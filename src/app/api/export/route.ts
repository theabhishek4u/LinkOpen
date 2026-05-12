import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// ============================================================================
// Types
// ============================================================================

interface ExportRequest {
  format: 'csv' | 'json'
  data: 'links' | 'analytics'
  links?: Array<Record<string, unknown>>
  analytics?: Record<string, unknown>
}

// ============================================================================
// CSV Helpers
// ============================================================================

function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  // If the value contains a comma, newline, or double quote, wrap in quotes
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function generateCSV(headers: string[], rows: Array<Record<string, unknown>>): string {
  const headerLine = headers.map(escapeCSVValue).join(',')
  const dataLines = rows.map((row) =>
    headers.map((header) => escapeCSVValue(row[header])).join(',')
  )
  return [headerLine, ...dataLines].join('\n')
}

// ============================================================================
// POST /api/export — Export data as CSV or JSON
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body: ExportRequest = await request.json()
    const { format, data } = body

    if (!format || !['csv', 'json'].includes(format)) {
      return NextResponse.json(
        { success: false, error: 'Format must be "csv" or "json"' },
        { status: 400 }
      )
    }

    if (!data || !['links', 'analytics'].includes(data)) {
      return NextResponse.json(
        { success: false, error: 'Data type must be "links" or "analytics"' },
        { status: 400 }
      )
    }

    let exportData: string
    let contentType: string
    let filename: string

    if (data === 'links') {
      // Fetch links from database or use provided data
      let links = body.links as Array<Record<string, unknown>> | undefined

      if (!links || !Array.isArray(links) || links.length === 0) {
        const dbLinks = await db.link.findMany({
          orderBy: { createdAt: 'desc' },
          take: 1000,
        })
        links = dbLinks.map((link) => ({
          id: link.id,
          originalUrl: link.originalUrl,
          platform: link.platform,
          deepLink: link.deepLink || '',
          shortCode: link.shortCode,
          shortUrl: link.shortUrl || '',
          title: link.title || '',
          openCount: link.openCount,
          isFavorite: link.isFavorite,
          healthStatus: link.healthStatus || '',
          createdAt: link.createdAt.toISOString(),
        }))
      }

      if (format === 'csv') {
        const headers = [
          'id',
          'originalUrl',
          'platform',
          'deepLink',
          'shortCode',
          'shortUrl',
          'title',
          'openCount',
          'isFavorite',
          'healthStatus',
          'createdAt',
        ]
        exportData = generateCSV(headers, links)
        contentType = 'text/csv'
        filename = 'linkverse-links.csv'
      } else {
        exportData = JSON.stringify(links, null, 2)
        contentType = 'application/json'
        filename = 'linkverse-links.json'
      }
    } else {
      // Analytics export
      let analyticsData = body.analytics as Record<string, unknown> | undefined

      if (!analyticsData) {
        // Fetch analytics from database
        const totalLinks = await db.link.count()
        const links = await db.link.findMany({
          select: { openCount: true, platform: true },
        })
        const totalOpens = links.reduce((sum, l) => sum + l.openCount, 0)

        const analyticsRecords = await db.analytics.findMany({
          take: 1000,
          orderBy: { createdAt: 'desc' },
        })

        const nativeOpens = analyticsRecords.filter((a) => a.isNative).length
        const browserOpens = analyticsRecords.filter((a) => !a.isNative).length

        const platformCounts: Record<string, number> = {}
        for (const link of links) {
          platformCounts[link.platform] =
            (platformCounts[link.platform] || 0) + 1
        }

        analyticsData = {
          totalLinks,
          totalOpens,
          nativeOpens,
          browserOpens,
          platformDistribution: Object.entries(platformCounts).map(
            ([platform, count]) => ({ platform, count })
          ),
          records: analyticsRecords.map((a) => ({
            id: a.id,
            platform: a.platform,
            device: a.device,
            browser: a.browser,
            os: a.os,
            isNative: a.isNative,
            createdAt: a.createdAt.toISOString(),
          })),
        }
      }

      if (format === 'csv') {
        // For analytics, flatten records into CSV
        const records =
          (analyticsData.records as Array<Record<string, unknown>>) || []

        if (records.length > 0) {
          const headers = Object.keys(records[0])
          exportData = generateCSV(headers, records)
        } else {
          // If no records, export the summary
          const summaryHeaders = Object.keys(analyticsData).filter(
            (k) => k !== 'records'
          )
          const summaryRow: Record<string, unknown> = {}
          for (const key of summaryHeaders) {
            summaryRow[key] =
              typeof analyticsData[key] === 'object'
                ? JSON.stringify(analyticsData[key])
                : analyticsData[key]
          }
          exportData = generateCSV(summaryHeaders, [summaryRow])
        }
        contentType = 'text/csv'
        filename = 'linkverse-analytics.csv'
      } else {
        exportData = JSON.stringify(analyticsData, null, 2)
        contentType = 'application/json'
        filename = 'linkverse-analytics.json'
      }
    }

    return new NextResponse(exportData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
