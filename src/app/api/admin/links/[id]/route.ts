import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUser } from '@/lib/auth'

// DELETE /api/admin/links/[id] — Delete a link (admin only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params

    const link = await db.link.findUnique({ where: { id } })
    if (!link) {
      return NextResponse.json(
        { success: false, error: 'Link not found' },
        { status: 404 }
      )
    }

    // Delete analytics first (cascade should handle this, but explicit for safety)
    await db.analytics.deleteMany({ where: { linkId: id } })

    await db.link.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Link deleted successfully',
    })
  } catch (error) {
    console.error('Admin link delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
