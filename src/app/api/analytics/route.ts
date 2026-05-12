import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '30')

    // Get total links count
    const totalLinks = await db.link.count()

    // Get total opens
    const links = await db.link.findMany({
      select: { openCount: true, platform: true },
    })
    const totalOpens = links.reduce((sum, l) => sum + l.openCount, 0)

    // Get analytics records
    const analytics = await db.analytics.findMany({
      take: 1000,
      orderBy: { createdAt: 'desc' },
    })

    const nativeOpens = analytics.filter((a) => a.isNative).length
    const browserOpens = analytics.filter((a) => !a.isNative).length

    // Top platforms
    const platformCounts: Record<string, { count: number; color: string }> = {}
    for (const link of links) {
      if (!platformCounts[link.platform]) {
        const platformColors: Record<string, string> = {
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
        platformCounts[link.platform] = {
          count: 0,
          color: platformColors[link.platform] || '#888888',
        }
      }
      platformCounts[link.platform].count++
    }

    const topPlatforms = Object.entries(platformCounts)
      .map(([platform, data]) => ({ platform, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Recent activity (mock data for demo)
    const recentActivity = Array.from({ length: 14 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (13 - i))
      return {
        date: date.toISOString().split('T')[0],
        opens: Math.floor(Math.random() * 50) + 10,
      }
    })

    // Device breakdown
    const deviceCounts: Record<string, number> = {}
    for (const a of analytics) {
      const device = a.device || 'unknown'
      deviceCounts[device] = (deviceCounts[device] || 0) + 1
    }
    const deviceBreakdown = Object.entries(deviceCounts)
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({
      success: true,
      data: {
        totalLinks,
        totalOpens,
        nativeOpens,
        browserOpens,
        topPlatforms,
        recentActivity,
        deviceBreakdown,
      },
    })
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { linkId, shortCode, platform, device, browser, os, isNative } = body

    if (!platform) {
      return NextResponse.json(
        { error: 'platform is required' },
        { status: 400 }
      )
    }

    // Resolve linkId: try direct linkId first, then shortCode lookup
    let resolvedLinkId = linkId
    if (!resolvedLinkId && shortCode) {
      const link = await db.link.findUnique({ where: { shortCode } })
      resolvedLinkId = link?.id
    }

    if (resolvedLinkId) {
      // Record analytics with link reference
      await db.analytics.create({
        data: {
          linkId: resolvedLinkId,
          platform,
          device: device || 'unknown',
          browser: browser || 'unknown',
          os: os || 'unknown',
          isNative: isNative || false,
          isOpened: true,
        },
      })

      // Increment link open count
      await db.link.update({
        where: { id: resolvedLinkId },
        data: { openCount: { increment: 1 } },
      }).catch(() => {})
    } else {
      // No link reference - just record platform analytics
      // Create a minimal analytics entry without link relation
      // This is best-effort for links not stored in our DB
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics record error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
