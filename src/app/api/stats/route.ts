import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

// ============================================================================
// Types
// ============================================================================

/** Valid period query parameter values */
type StatsPeriod = 'today' | '7d' | '30d' | '90d' | 'all'

/** Platform breakdown entry */
interface PlatformBreakdown {
  platform: string
  count: number
  percentage: number
}

/** Top performing link entry */
interface TopLink {
  id: string
  originalUrl: string
  deepLink: string | null
  shortCode: string
  platform: string
  openCount: number
  nativeOpenRate: number
}

/** Aggregated statistics response */
interface StatsData {
  period: StatsPeriod
  totalLinks: number
  totalOpens: number
  nativeOpens: number
  browserOpens: number
  conversionRate: number
  averageLinksPerDay: number
  busiestDay: { date: string; count: number } | null
  busiestHour: { hour: number; count: number } | null
  platformBreakdown: PlatformBreakdown[]
  growthRate: number
  topLinks: TopLink[]
}

// ============================================================================
// Helpers
// ============================================================================

/** Brand colors for known platforms */
const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#E4405F',
  youtube: '#FF0000',
  facebook: '#1877F2',
  tiktok: '#000000',
  telegram: '#26A5E4',
  whatsapp: '#25D366',
  x: '#000000',
  snapchat: '#FFFC00',
  linkedin: '#0A66C2',
  pinterest: '#E60023',
  reddit: '#FF4500',
  discord: '#5865F2',
  threads: '#000000',
}

/**
 * Calculate the start date for a given stats period.
 *
 * @param period - The stats period to calculate the start date for
 * @returns The start Date for the period
 */
function getStartDate(period: StatsPeriod): Date {
  const now = new Date()
  switch (period) {
    case 'today': {
      const start = new Date(now)
      start.setHours(0, 0, 0, 0)
      return start
    }
    case '7d': {
      const start = new Date(now)
      start.setDate(start.getDate() - 7)
      return start
    }
    case '30d': {
      const start = new Date(now)
      start.setDate(start.getDate() - 30)
      return start
    }
    case '90d': {
      const start = new Date(now)
      start.setDate(start.getDate() - 90)
      return start
    }
    case 'all':
      return new Date(0) // epoch — include everything
  }
}

/**
 * Calculate the length of a period in days.
 *
 * @param period - The stats period
 * @returns Number of days in the period (minimum 1)
 */
function getPeriodDays(period: StatsPeriod): number {
  switch (period) {
    case 'today':
      return 1
    case '7d':
      return 7
    case '30d':
      return 30
    case '90d':
      return 90
    case 'all':
      return 365 // approximate for "all time"
  }
}

// ============================================================================
// GET /api/stats — Return aggregated link statistics
// ============================================================================

/**
 * GET handler for link statistics aggregation.
 *
 * Returns aggregated statistics for the requested period including:
 * - Total links, opens, and conversion rate
 * - Average links per day
 * - Busiest day and hour
 * - Platform breakdown with percentages
 * - Growth rate compared to the previous period
 * - Top 5 performing links
 *
 * @param request - The incoming Next.js request
 * @returns JSON response with aggregated statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = withRateLimit(request, RATE_LIMITS.stats)
    if (rateLimitResponse) return rateLimitResponse

    const searchParams = request.nextUrl.searchParams
    const period = (searchParams.get('period') || '30d') as StatsPeriod

    // Validate period parameter
    const validPeriods: StatsPeriod[] = ['today', '7d', '30d', '90d', 'all']
    if (!validPeriods.includes(period)) {
      return NextResponse.json(
        { success: false, error: `Invalid period. Must be one of: ${validPeriods.join(', ')}` },
        { status: 400 }
      )
    }

    const startDate = getStartDate(period)
    const periodDays = getPeriodDays(period)

    // --- Current period queries ---

    // Total links created in period
    const linksInPeriod = await db.link.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        id: true,
        originalUrl: true,
        deepLink: true,
        shortCode: true,
        platform: true,
        openCount: true,
        createdAt: true,
        analytics: {
          where: {
            createdAt: { gte: startDate },
          },
          select: {
            isNative: true,
            createdAt: true,
          },
        },
      },
      take: 5000,
    })

    const totalLinks = linksInPeriod.length

    // Aggregate opens from analytics
    let totalOpens = 0
    let nativeOpens = 0
    let browserOpens = 0

    // Track per-day and per-hour counts
    const dayCounts: Record<string, number> = {}
    const hourCounts: Record<number, number> = {}

    for (const link of linksInPeriod) {
      totalOpens += link.openCount
      for (const analytics of link.analytics) {
        if (analytics.isNative) {
          nativeOpens++
        } else {
          browserOpens++
        }

        // Track day
        const dayStr = analytics.createdAt.toISOString().split('T')[0]
        dayCounts[dayStr] = (dayCounts[dayStr] || 0) + 1

        // Track hour
        const hour = analytics.createdAt.getHours()
        hourCounts[hour] = (hourCounts[hour] || 0) + 1
      }
    }

    // Also count opens from links that don't have analytics records
    // (use openCount for links that were opened but analytics weren't recorded)
    const analyticsOpens = linksInPeriod.reduce(
      (sum, link) => sum + link.analytics.length,
      0
    )
    if (totalOpens > analyticsOpens) {
      const untrackedOpens = totalOpens - analyticsOpens
      // Assume same native/browser ratio for untracked opens
      if (analyticsOpens > 0) {
        const nativeRatio = nativeOpens / analyticsOpens
        nativeOpens += Math.round(untrackedOpens * nativeRatio)
        browserOpens += Math.round(untrackedOpens * (1 - nativeRatio))
      } else {
        browserOpens += untrackedOpens
      }
    }

    // Conversion rate
    const conversionRate =
      totalOpens > 0
        ? Math.round((nativeOpens / totalOpens) * 10000) / 100
        : 0

    // Average links per day
    const averageLinksPerDay =
      periodDays > 0 ? Math.round((totalLinks / periodDays) * 100) / 100 : 0

    // Busiest day
    let busiestDay: { date: string; count: number } | null = null
    for (const [date, count] of Object.entries(dayCounts)) {
      if (!busiestDay || count > busiestDay.count) {
        busiestDay = { date, count }
      }
    }

    // Busiest hour
    let busiestHour: { hour: number; count: number } | null = null
    for (const [hour, count] of Object.entries(hourCounts)) {
      if (!busiestHour || count > busiestHour.count) {
        busiestHour = { hour: Number(hour), count }
      }
    }

    // Platform breakdown
    const platformCounts: Record<string, number> = {}
    for (const link of linksInPeriod) {
      platformCounts[link.platform] = (platformCounts[link.platform] || 0) + 1
    }

    const platformBreakdown: PlatformBreakdown[] = Object.entries(platformCounts)
      .map(([platform, count]) => ({
        platform,
        count,
        percentage:
          totalLinks > 0
            ? Math.round((count / totalLinks) * 10000) / 100
            : 0,
      }))
      .sort((a, b) => b.count - a.count)

    // --- Previous period for growth rate ---
    const previousPeriodDays = periodDays
    const previousStartDate = new Date(startDate.getTime() - previousPeriodDays * 24 * 60 * 60 * 1000)

    const previousLinksCount = await db.link.count({
      where: {
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
    })

    const growthRate =
      previousLinksCount > 0
        ? Math.round(((totalLinks - previousLinksCount) / previousLinksCount) * 10000) / 100
        : totalLinks > 0
          ? 100
          : 0

    // Top 5 performing links (by open count)
    const topLinks: TopLink[] = linksInPeriod
      .filter((l) => l.openCount > 0)
      .sort((a, b) => b.openCount - a.openCount)
      .slice(0, 5)
      .map((link) => {
        const linkNativeOpens = link.analytics.filter((a) => a.isNative).length
        const nativeOpenRate =
          link.analytics.length > 0
            ? Math.round((linkNativeOpens / link.analytics.length) * 10000) / 100
            : 0
        return {
          id: link.id,
          originalUrl: link.originalUrl,
          deepLink: link.deepLink,
          shortCode: link.shortCode,
          platform: link.platform,
          openCount: link.openCount,
          nativeOpenRate,
        }
      })

    const data: StatsData = {
      period,
      totalLinks,
      totalOpens,
      nativeOpens,
      browserOpens,
      conversionRate,
      averageLinksPerDay,
      busiestDay,
      busiestHour,
      platformBreakdown,
      growthRate,
      topLinks,
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Stats aggregation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
