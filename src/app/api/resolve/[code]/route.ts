import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getPlatformById } from '@/lib/platform-detect'

// ============================================================================
// Types
// ============================================================================

interface ResolveResult {
  originalUrl: string
  deepLink: string | null
  platform: {
    id: string
    name: string
    icon: string
    color: string
    deepLinkScheme: string
    category: string
  } | null
  shortCode: string
  title: string | null
  openCount: number
}

// ============================================================================
// GET /api/resolve/[code] — Resolve a short code to its link data
// ============================================================================

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Short code is required' },
        { status: 400 }
      )
    }

    // Look up the short code in the database
    const link = await db.link.findUnique({
      where: { shortCode: code },
    })

    if (!link) {
      return NextResponse.json(
        { success: false, error: 'Short code not found' },
        { status: 404 }
      )
    }

    // Check if link has expired
    if (link.expiresAt && new Date() > link.expiresAt) {
      return NextResponse.json(
        { success: false, error: 'This link has expired' },
        { status: 410 }
      )
    }

    // Get platform info
    const platformInfo = getPlatformById(link.platform)

    // Track the click in analytics (best effort)
    try {
      await db.analytics.create({
        data: {
          linkId: link.id,
          platform: link.platform,
          device: 'unknown',
          browser: 'unknown',
          os: 'unknown',
          isNative: false,
          isOpened: true,
        },
      })

      // Increment open count
      await db.link.update({
        where: { id: link.id },
        data: { openCount: { increment: 1 } },
      })
    } catch {
      // Analytics tracking failure shouldn't block the response
    }

    const result: ResolveResult = {
      originalUrl: link.originalUrl,
      deepLink: link.deepLink,
      platform: platformInfo
        ? {
            id: platformInfo.id,
            name: platformInfo.name,
            icon: platformInfo.icon,
            color: platformInfo.color,
            deepLinkScheme: platformInfo.deepLinkScheme,
            category: platformInfo.category,
          }
        : null,
      shortCode: link.shortCode,
      title: link.title,
      openCount: link.openCount + 1, // Include the current click
    }

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Link resolution error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
