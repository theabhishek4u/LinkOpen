import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

// ============================================================================
// Types
// ============================================================================

interface HealthCheckRequest {
  url: string
}

interface HealthCheckResult {
  url: string
  status: number | null
  responseTime: number
  isReachable: boolean
  redirectUrl?: string
  sslValid?: boolean
  lastChecked: string
}

// ============================================================================
// POST /api/health — Check if a URL is reachable
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = withRateLimit(request, RATE_LIMITS.health)
    if (rateLimitResponse) return rateLimitResponse

    const body: HealthCheckRequest = await request.json()
    const { url } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      )
    }

    // Normalize URL
    let normalizedUrl = url.trim()
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`
    }

    // Validate URL format
    try {
      new URL(normalizedUrl)
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    const startTime = Date.now()
    let status: number | null = null
    let isReachable = false
    let redirectUrl: string | undefined
    let sslValid: boolean | undefined

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(normalizedUrl, {
        method: 'HEAD',
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent': 'LinkVerse-HealthCheck/1.0',
        },
      })

      clearTimeout(timeoutId)

      status = response.status
      isReachable = response.status < 500

      // Detect redirect
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location')
        if (location) {
          redirectUrl = location
        }
      }

      // Check SSL
      if (normalizedUrl.startsWith('https://')) {
        sslValid = true // If fetch succeeded without SSL error, SSL is valid
      }
    } catch (error: unknown) {
      isReachable = false
      status = null

      // Determine if it's a timeout, DNS failure, or SSL error
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          // Timeout
        } else if (
          error.message.includes('ENOTFOUND') ||
          error.message.includes('getaddrinfo')
        ) {
          // DNS failure
        } else if (
          error.message.includes('certificate') ||
          error.message.includes('SSL') ||
          error.message.includes('UNABLE_TO_VERIFY_LEAF_SIGNATURE')
        ) {
          sslValid = false
        }
      }
    }

    const responseTime = Date.now() - startTime
    const lastChecked = new Date().toISOString()

    const result: HealthCheckResult = {
      url: normalizedUrl,
      status,
      responseTime,
      isReachable,
      lastChecked,
    }

    if (redirectUrl) {
      result.redirectUrl = redirectUrl
    }
    if (normalizedUrl.startsWith('https://')) {
      result.sslValid = sslValid
    }

    // Update link health status in database (best effort)
    try {
      const link = await db.link.findFirst({
        where: { originalUrl: normalizedUrl },
      })
      if (link) {
        await db.link.update({
          where: { id: link.id },
          data: {
            healthStatus: isReachable ? 'healthy' : 'unhealthy',
            lastHealthCheck: new Date(),
          },
        })
      }
    } catch {
      // Database update failure shouldn't block the response
    }

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
