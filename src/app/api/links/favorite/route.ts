import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

// ============================================================================
// Types
// ============================================================================

/** Request body for toggling a link's favorite status */
interface FavoriteRequest {
  linkId: string
  favorite: boolean
}

// ============================================================================
// POST /api/links/favorite — Toggle link favorite/bookmark status
// ============================================================================

/**
 * POST handler for toggling a link's favorite status.
 *
 * Accepts a JSON body with:
 * - `linkId` — The ID of the link to update (required)
 * - `favorite` — Whether the link should be marked as favorite (required)
 *
 * Validates that the link exists before updating. Returns the updated link data.
 *
 * @param request - The incoming Next.js request
 * @returns JSON response with the updated link data
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = withRateLimit(request, RATE_LIMITS.favorite)
    if (rateLimitResponse) return rateLimitResponse

    const body: FavoriteRequest = await request.json()
    const { linkId, favorite } = body

    // Validate linkId
    if (!linkId || typeof linkId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'linkId is required and must be a string' },
        { status: 400 }
      )
    }

    // Validate favorite
    if (typeof favorite !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'favorite is required and must be a boolean' },
        { status: 400 }
      )
    }

    // Check that the link exists
    const existingLink = await db.link.findUnique({
      where: { id: linkId },
    })

    if (!existingLink) {
      return NextResponse.json(
        { success: false, error: 'Link not found' },
        { status: 404 }
      )
    }

    // Update the favorite status
    const updatedLink = await db.link.update({
      where: { id: linkId },
      data: { isFavorite: favorite },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedLink.id,
        originalUrl: updatedLink.originalUrl,
        deepLink: updatedLink.deepLink,
        shortCode: updatedLink.shortCode,
        platform: updatedLink.platform,
        title: updatedLink.title,
        isFavorite: updatedLink.isFavorite,
        openCount: updatedLink.openCount,
        createdAt: updatedLink.createdAt.toISOString(),
        updatedAt: updatedLink.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Favorite toggle error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
