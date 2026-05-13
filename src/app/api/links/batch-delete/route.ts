import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids } = body

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'ids array is required and must not be empty' },
        { status: 400 }
      )
    }

    if (ids.length > 100) {
      return NextResponse.json(
        { error: 'Cannot delete more than 100 links at once' },
        { status: 400 }
      )
    }

    // Delete associated analytics first, then the links
    let deletedCount = 0
    for (const id of ids) {
      try {
        // Delete analytics records referencing this link
        await db.analytics.deleteMany({ where: { linkId: id } }).catch(() => {})
        // Delete the link
        const deleted = await db.link.deleteMany({ where: { id } })
        deletedCount += deleted.count
      } catch {
        // Continue with other IDs even if one fails
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        requested: ids.length,
        deleted: deletedCount,
      },
    })
  } catch (error) {
    console.error('Batch delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
