import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { sharedLinks } from '@/lib/share-store'

// ============================================================================
// Types
// ============================================================================

interface ShareRequest {
  linkId?: string
  originalUrl?: string
  deepLink?: string
  platform?: string
  shortCode?: string
  allowDeepLinkReveal?: boolean
  expiresIn?: number // hours
}

function generateShareCode(): string {
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const CODE_LENGTH = 7
  let code = ''
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(CODE_LENGTH)
    crypto.getRandomValues(bytes)
    for (let i = 0; i < CODE_LENGTH; i++) {
      code += ALPHABET[bytes[i] % ALPHABET.length]
    }
  } else {
    for (let i = 0; i < CODE_LENGTH; i++) {
      code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
    }
  }
  return code
}

// ============================================================================
// POST /api/share — Create a shared link
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = withRateLimit(request, RATE_LIMITS.default)
    if (rateLimitResponse) return rateLimitResponse

    const body: ShareRequest = await request.json()
    const { linkId, originalUrl, deepLink, platform, shortCode, allowDeepLinkReveal = true, expiresIn } = body

    // Try to find link in database if linkId provided
    let resolvedOriginalUrl = originalUrl || ''
    let resolvedDeepLink = deepLink || ''
    let resolvedPlatform = platform || ''
    let resolvedShortCode = shortCode

    if (linkId) {
      try {
        const link = await db.link.findUnique({ where: { id: linkId } })
        if (link) {
          resolvedOriginalUrl = link.originalUrl
          resolvedDeepLink = link.deepLink || ''
          resolvedPlatform = link.platform
          resolvedShortCode = link.shortCode
        }
      } catch {
        // Database not available, use provided values
      }
    }

    if (!resolvedOriginalUrl && !resolvedDeepLink) {
      return NextResponse.json(
        { success: false, error: 'Either linkId or originalUrl/deepLink must be provided' },
        { status: 400 }
      )
    }

    const code = generateShareCode()
    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 60 * 60 * 1000).toISOString()
      : null

    const sharedLink = {
      code,
      originalUrl: resolvedOriginalUrl,
      deepLink: resolvedDeepLink,
      platform: resolvedPlatform,
      shortCode: resolvedShortCode,
      allowDeepLinkReveal,
      views: 0,
      expiresAt,
      createdAt: new Date().toISOString(),
    }

    sharedLinks.set(code, sharedLink)

    return NextResponse.json({
      success: true,
      data: {
        code,
        shareUrl: `/s/${code}`,
        expiresAt,
        allowDeepLinkReveal,
      },
    })
  } catch (error) {
    console.error('Share creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// GET /api/share — List all shared links (for admin)
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const rateLimitResponse = withRateLimit(request, RATE_LIMITS.default)
    if (rateLimitResponse) return rateLimitResponse

    const entries = Array.from(sharedLinks.entries()).map(([, link]) => ({
      ...link,
    }))

    return NextResponse.json({
      success: true,
      data: entries,
    })
  } catch (error) {
    console.error('Share list error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
