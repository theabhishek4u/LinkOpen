import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUser } from '@/lib/auth'

// GET /api/admin/analytics — Platform-wide analytics aggregation (admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get('range') || '30d'

    // Calculate date range
    const now = new Date()
    let startDate: Date | null = null
    switch (range) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'today':
        startDate = new Date(now)
        startDate.setHours(0, 0, 0, 0)
        break
      default:
        startDate = null // all time
    }

    const dateFilter = startDate ? { createdAt: { gte: startDate } } : {}

    // Get aggregated analytics
    const [
      totalOpens,
      totalNativeOpens,
      totalBrowserOpens,
      totalLinksInRange,
      totalUsersInRange,
    ] = await Promise.all([
      db.analytics.count({ where: dateFilter }),
      db.analytics.count({ where: { ...dateFilter, isNative: true } }),
      db.analytics.count({ where: { ...dateFilter, isNative: false } }),
      db.link.count({ where: dateFilter }),
      db.user.count({ where: dateFilter }),
    ])

    // Conversion rate
    const conversionRate = totalOpens > 0
      ? ((totalNativeOpens / totalOpens) * 100).toFixed(1)
      : '0'

    // Platform breakdown
    const platformBreakdownRaw = await db.analytics.groupBy({
      by: ['platform'],
      where: dateFilter,
      _count: { _all: true },
    })

    const platformBreakdown = platformBreakdownRaw
      .sort((a, b) => b._count._all - a._count._all)
      .slice(0, 15)

    const platformData = platformBreakdown.map((p) => ({
      platform: p.platform,
      count: p._count._all,
      percentage: totalOpens > 0 ? parseFloat(((p._count._all / totalOpens) * 100).toFixed(1)) : 0,
    }))

    // Top performing links
    const topLinks = await db.link.findMany({
      where: dateFilter,
      take: 10,
      orderBy: { openCount: 'desc' },
      select: {
        id: true,
        originalUrl: true,
        platform: true,
        deepLink: true,
        shortCode: true,
        openCount: true,
        title: true,
        createdAt: true,
        user: {
          select: { email: true, name: true },
        },
        _count: {
          select: { analytics: true },
        },
      },
    })

    const topLinksWithRate = topLinks.map((link) => ({
      ...link,
      nativeOpenRate: link._count.analytics > 0
        ? parseFloat((((link.openCount || 0) / link._count.analytics) * 100).toFixed(1))
        : 0,
    }))

    // Click trends over time (daily for the selected range)
    const days = range === '7d' ? 7 : range === 'today' ? 1 : range === '90d' ? 90 : 30
    const trendData = []
    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date(now)
      dayStart.setDate(dayStart.getDate() - i)
      dayStart.setHours(0, 0, 0, 0)

      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayEnd.getDate() + 1)

      const [dayOpens, dayNativeOpens] = await Promise.all([
        db.analytics.count({
          where: { createdAt: { gte: dayStart, lt: dayEnd } },
        }),
        db.analytics.count({
          where: {
            createdAt: { gte: dayStart, lt: dayEnd },
            isNative: true,
          },
        }),
      ])

      trendData.push({
        date: dayStart.toISOString().split('T')[0],
        opens: dayOpens,
        nativeOpens: dayNativeOpens,
      })
    }

    // User engagement metrics
    const totalActiveUsers = await db.user.count({
      where: {
        ...dateFilter,
        links: { some: {} },
      },
    })

    const avgLinksPerUser = totalUsersInRange > 0
      ? (totalLinksInRange / totalUsersInRange).toFixed(1)
      : '0'

    // Device breakdown
    const deviceBreakdownRaw = await db.analytics.groupBy({
      by: ['device'],
      where: dateFilter,
      _count: { _all: true },
    })
    const deviceBreakdown = deviceBreakdownRaw
      .sort((a, b) => b._count._all - a._count._all)
      .slice(0, 10)

    // Browser breakdown
    const browserBreakdownRaw = await db.analytics.groupBy({
      by: ['browser'],
      where: dateFilter,
      _count: { _all: true },
    })
    const browserBreakdown = browserBreakdownRaw
      .sort((a, b) => b._count._all - a._count._all)
      .slice(0, 10)

    // Recent activity
    const recentActivity = await db.analytics.findMany({
      where: dateFilter,
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        platform: true,
        device: true,
        browser: true,
        isNative: true,
        isOpened: true,
        country: true,
        createdAt: true,
        link: {
          select: {
            shortCode: true,
            originalUrl: true,
            title: true,
          },
        },
        user: {
          select: { email: true, name: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        range,
        startDate: startDate?.toISOString() || null,
        overview: {
          totalOpens,
          totalNativeOpens,
          totalBrowserOpens,
          totalLinksInRange,
          totalUsersInRange,
          conversionRate: parseFloat(conversionRate),
          avgLinksPerUser: parseFloat(avgLinksPerUser),
          totalActiveUsers,
        },
        platformBreakdown: platformData,
        topLinks: topLinksWithRate,
        clickTrends: trendData,
        deviceBreakdown: deviceBreakdown.map((d) => ({
          device: d.device,
          count: d._count._all,
        })),
        browserBreakdown: browserBreakdown.map((b) => ({
          browser: b.browser,
          count: b._count._all,
        })),
        recentActivity,
      },
    })
  } catch (error) {
    console.error('Admin analytics fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
