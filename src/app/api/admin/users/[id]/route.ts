import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUser } from '@/lib/auth'

// PATCH /api/admin/users/[id] — Update user (change role, plan, suspend/activate)
export async function PATCH(
  request: NextRequest,
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

    // Don't allow admin to modify themselves
    if (id === user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot modify your own account' },
        { status: 400 }
      )
    }

    const targetUser = await db.user.findUnique({ where: { id } })
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { role, plan, suspended } = body as {
      role?: string
      plan?: string
      suspended?: boolean
    }

    const updateData: Record<string, string | boolean> = {}

    if (role !== undefined) {
      if (!['user', 'admin'].includes(role)) {
        return NextResponse.json(
          { success: false, error: 'Invalid role. Must be "user" or "admin"' },
          { status: 400 }
        )
      }
      updateData.role = role
    }

    if (plan !== undefined) {
      if (!['free', 'pro', 'enterprise'].includes(plan)) {
        return NextResponse.json(
          { success: false, error: 'Invalid plan. Must be "free", "pro", or "enterprise"' },
          { status: 400 }
        )
      }
      updateData.plan = plan
    }

    if (suspended !== undefined) {
      // We use role = 'suspended' to mark suspended users
      if (suspended) {
        updateData.role = 'suspended'
      } else {
        // Reactivate: set back to 'user' if currently suspended
        if (targetUser.role === 'suspended') {
          updateData.role = 'user'
        }
      }
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedUser,
    })
  } catch (error) {
    console.error('Admin user update error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id] — Delete a user
export async function DELETE(
  request: NextRequest,
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

    // Don't allow admin to delete themselves
    if (id === user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    const targetUser = await db.user.findUnique({ where: { id } })
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    await db.user.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    })
  } catch (error) {
    console.error('Admin user delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
