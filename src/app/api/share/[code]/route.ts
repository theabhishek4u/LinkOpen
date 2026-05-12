import { NextRequest, NextResponse } from 'next/server'
import { sharedLinks } from '@/lib/share-store'

// ============================================================================
// GET /api/share/[code] — Get a shared link by code
// ============================================================================

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Share code is required' },
        { status: 400 }
      )
    }

    const sharedLink = sharedLinks.get(code)

    if (!sharedLink) {
      return NextResponse.json(
        { success: false, error: 'Shared link not found' },
        { status: 404 }
      )
    }

    // Check if expired
    if (sharedLink.expiresAt && new Date(sharedLink.expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'This shared link has expired' },
        { status: 410 }
      )
    }

    // Increment views
    sharedLink.views += 1

    return NextResponse.json({
      success: true,
      data: {
        originalUrl: sharedLink.originalUrl,
        deepLink: sharedLink.allowDeepLinkReveal ? sharedLink.deepLink : null,
        platform: sharedLink.platform,
        shortCode: sharedLink.shortCode,
        views: sharedLink.views,
        allowDeepLinkReveal: sharedLink.allowDeepLinkReveal,
        expiresAt: sharedLink.expiresAt,
        createdAt: sharedLink.createdAt,
      },
    })
  } catch (error) {
    console.error('Share retrieval error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
