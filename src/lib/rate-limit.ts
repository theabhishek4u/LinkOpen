// ============================================================================
// Rate Limiting Middleware
// In-memory rate limiter using a Map to track requests by IP address
// ============================================================================

/**
 * Configuration options for rate limiting
 */
export interface RateLimitOptions {
  /** Time window in milliseconds */
  windowMs: number
  /** Maximum number of requests allowed per window */
  maxRequests: number
}

/**
 * Internal record tracking request counts per IP
 */
interface RateLimitRecord {
  count: number
  resetTime: number
}

/**
 * Result of a rate limit check
 */
interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean
  /** Maximum requests per window */
  limit: number
  /** Remaining requests in the current window */
  remaining: number
  /** Timestamp when the window resets (Unix ms) */
  resetTime: number
}

// ============================================================================
// In-memory store and cleanup
// ============================================================================

/** Map of IP address → rate limit record */
const store = new Map<string, RateLimitRecord>()

/** Cleanup interval reference */
let cleanupTimer: ReturnType<typeof setInterval> | null = null

/** Whether cleanup has been initialized */
let cleanupInitialized = false

/**
 * Initialize periodic cleanup of expired rate limit entries.
 * Runs every 60 seconds to prevent memory leaks from stale IP entries.
 * Only initializes once across the application lifecycle.
 */
function initCleanup(): void {
  if (cleanupInitialized) return
  cleanupInitialized = true

  cleanupTimer = setInterval(() => {
    const now = Date.now()
    for (const [ip, record] of store.entries()) {
      if (now >= record.resetTime) {
        store.delete(ip)
      }
    }
  }, 60_000)

  // Prevent the timer from keeping the process alive
  if (cleanupTimer && typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref()
  }
}

/**
 * Get the client IP address from a Next.js request.
 * Checks X-Forwarded-For header first (for proxied requests),
 * then falls back to the request's IP property.
 *
 * @param request - The incoming Next.js request
 * @returns The client IP address, or 'unknown' if it cannot be determined
 */
function getClientIp(request: Request): string {
  // Check X-Forwarded-For header (common with reverse proxies)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    // X-Forwarded-For may contain multiple IPs; the first is the original client
    const ips = forwarded.split(',').map((ip) => ip.trim())
    if (ips[0]) return ips[0]
  }

  // Check X-Real-IP header (used by some proxies like Nginx)
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()

  return 'unknown'
}

/**
 * Check whether a request from the given IP should be allowed under the
 * specified rate limit options. Uses a sliding-window approach: if the
 * current window has expired, a new window is started.
 *
 * @param ip      - The client IP address
 * @param options - Rate limit configuration
 * @returns A RateLimitResult indicating whether the request is allowed
 */
function checkRateLimit(ip: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  const record = store.get(ip)

  // No existing record or window has expired → start fresh
  if (!record || now >= record.resetTime) {
    const resetTime = now + options.windowMs
    store.set(ip, { count: 1, resetTime })
    return {
      allowed: true,
      limit: options.maxRequests,
      remaining: options.maxRequests - 1,
      resetTime,
    }
  }

  // Window is active — increment count
  record.count++

  if (record.count > options.maxRequests) {
    return {
      allowed: false,
      limit: options.maxRequests,
      remaining: 0,
      resetTime: record.resetTime,
    }
  }

  return {
    allowed: true,
    limit: options.maxRequests,
    remaining: options.maxRequests - record.count,
    resetTime: record.resetTime,
  }
}

/**
 * Rate-limit a Next.js API route request. This is the primary entry point
 * for applying rate limiting to any API route handler.
 *
 * Returns a `NextResponse` with rate limit headers if the request is allowed,
 * or a 429 Too Many Requests response if the limit has been exceeded.
 *
 * @example
 * ```ts
 * import { withRateLimit } from '@/lib/rate-limit'
 *
 * export async function POST(request: NextRequest) {
 *   const rateLimitResult = withRateLimit(request, { windowMs: 60_000, maxRequests: 10 })
 *   if (rateLimitResult) return rateLimitResult // 429 response
 *
 *   // ... normal route logic
 * }
 * ```
 *
 * @param request - The incoming Next.js request
 * @param options - Rate limit configuration (windowMs, maxRequests)
 * @returns A 429 NextResponse if rate-limited, or null if the request is allowed
 */
export function withRateLimit(
  request: Request,
  options: RateLimitOptions
): Response | null {
  initCleanup()

  const ip = getClientIp(request)
  const result = checkRateLimit(ip, options)

  // Build rate limit headers
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)), // Unix seconds
  }

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000)
    headers['Retry-After'] = String(retryAfter)

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Too many requests. Please try again later.',
        retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      }
    )
  }

  // Request is allowed — return null so the caller can proceed.
  // The caller can use the rate limit info to set response headers if desired.
  return null
}

/**
 * Get rate limit headers for a given request without enforcing the limit.
 * Useful for adding rate limit info to successful responses.
 *
 * @param request - The incoming Next.js request
 * @param options - Rate limit configuration
 * @returns An object of rate limit headers to merge into the response
 */
export function getRateLimitHeaders(
  request: Request,
  options: RateLimitOptions
): Record<string, string> {
  const ip = getClientIp(request)
  const record = store.get(ip)
  const now = Date.now()

  if (!record || now >= record.resetTime) {
    return {
      'X-RateLimit-Limit': String(options.maxRequests),
      'X-RateLimit-Remaining': String(options.maxRequests - 1),
      'X-RateLimit-Reset': String(Math.ceil((now + options.windowMs) / 1000)),
    }
  }

  return {
    'X-RateLimit-Limit': String(options.maxRequests),
    'X-RateLimit-Remaining': String(Math.max(0, options.maxRequests - record.count)),
    'X-RateLimit-Reset': String(Math.ceil(record.resetTime / 1000)),
  }
}

/**
 * Pre-configured rate limit options for standard API routes.
 * These can be imported and passed directly to `withRateLimit`.
 */
export const RATE_LIMITS = {
  /** Link generation & listing: 10 requests per minute */
  links: { windowMs: 60_000, maxRequests: 10 },
  /** Bulk processing: 5 requests per minute */
  bulk: { windowMs: 60_000, maxRequests: 5 },
  /** Health checks: 20 requests per minute */
  health: { windowMs: 60_000, maxRequests: 20 },
  /** Search: 30 requests per minute */
  search: { windowMs: 60_000, maxRequests: 30 },
  /** Stats: 20 requests per minute */
  stats: { windowMs: 60_000, maxRequests: 20 },
  /** Favorite toggle: 30 requests per minute */
  favorite: { windowMs: 60_000, maxRequests: 30 },
} as const
