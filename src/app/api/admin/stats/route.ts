import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUser } from '@/lib/auth'

// GET /api/admin/stats — System-wide stats (admin only)
export async function GET() {
  try {
    // Admin check
    const user = await getUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    // Get total counts
    const [totalUsers, totalLinks, totalAnalytics] = await Promise.all([
      db.user.count(),
      db.link.count(),
      db.analytics.count(),
    ])

    // Links created today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const linksToday = await db.link.count({
      where: { createdAt: { gte: todayStart } },
    })

    // Active users (users who created links in the last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const activeUsers = await db.user.count({
      where: {
        links: {
          some: { createdAt: { gte: sevenDaysAgo } },
        },
      },
    })

    // Recent signups (last 7 days)
    const recentSignups = await db.user.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    })

    // Platform breakdown
    const platformBreakdown = await db.link.groupBy({
      by: ['platform'],
      _count: { platform: true },
      orderBy: { _count: { platform: 'desc' } },
      take: 10,
    })

    const data = {
      totalUsers,
      totalLinks,
      totalAnalytics,
      linksToday,
      activeUsers,
      recentSignups,
      platformBreakdown: platformBreakdown.map((p) => ({
        platform: p.platform,
        count: p._count.platform,
      })),
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Admin stats fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
