import { NextRequest, NextResponse } from 'next/server'
import { detectPlatform, validateUrl } from '@/lib/platform-detect'
import { generateDeepLink, generateShortCode } from '@/lib/deep-link'
import { db } from '@/lib/db'

// ============================================================================
// Types
// ============================================================================

interface BulkRequest {
  urls: string[]
}

interface BulkResultItem {
  originalUrl: string
  platform: string | null
  deepLink: string | null
  shortCode: string | null
  success: boolean
  error?: string
}

interface BulkSummary {
  total: number
  successful: number
  failed: number
}

// ============================================================================
// POST /api/bulk — Process multiple URLs in bulk
// ============================================================================

const MAX_BULK_URLS = 50

export async function POST(request: NextRequest) {
  try {
    const body: BulkRequest = await request.json()
    const { urls } = body

    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json(
        { success: false, error: 'urls array is required' },
        { status: 400 }
      )
    }

    if (urls.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one URL is required' },
        { status: 400 }
      )
    }

    if (urls.length > MAX_BULK_URLS) {
      return NextResponse.json(
        {
          success: false,
          error: `Maximum ${MAX_BULK_URLS} URLs allowed per request`,
        },
        { status: 400 }
      )
    }

    const results: BulkResultItem[] = []
    let successful = 0
    let failed = 0

    for (const url of urls) {
      try {
        // Validate URL
        const validation = validateUrl(url)
        if (!validation.valid) {
          results.push({
            originalUrl: url,
            platform: null,
            deepLink: null,
            shortCode: null,
            success: false,
            error: validation.error || 'Invalid URL',
          })
          failed++
          continue
        }

        // Detect platform
        const platform = detectPlatform(validation.normalizedUrl)
        if (!platform) {
          results.push({
            originalUrl: url,
            platform: null,
            deepLink: null,
            shortCode: null,
            success: false,
            error: 'Unsupported platform',
          })
          failed++
          continue
        }

        // Generate deep link
        const result = generateDeepLink(validation.normalizedUrl, platform)
        const shortCode = generateShortCode()

        // Save to database (best effort)
        try {
          await db.link.create({
            data: {
              originalUrl: result.originalUrl,
              platform: platform.id,
              deepLink: result.deepLink,
              shortCode,
              title: `${platform.name} Link`,
            },
          })
        } catch {
          // Database save failure shouldn't block the response
        }

        results.push({
          originalUrl: url,
          platform: platform.id,
          deepLink: result.deepLink,
          shortCode,
          success: true,
        })
        successful++
      } catch (error) {
        results.push({
          originalUrl: url,
          platform: null,
          deepLink: null,
          shortCode: null,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
        failed++
      }
    }

    const summary: BulkSummary = {
      total: urls.length,
      successful,
      failed,
    }

    return NextResponse.json({
      success: true,
      data: { results, summary },
    })
  } catch (error) {
    console.error('Bulk processing error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
