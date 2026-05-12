import { NextRequest, NextResponse } from 'next/server'
import { detectPlatform, validateUrl } from '@/lib/platform-detect'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      )
    }

    const validation = validateUrl(url)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    const platform = detectPlatform(validation.normalizedUrl)

    if (!platform) {
      return NextResponse.json({
        success: false,
        error: 'Unsupported platform',
        normalizedUrl: validation.normalizedUrl,
      })
    }

    // Generate a deep link by combining the platform scheme with the URL path
    const parsedUrl = new URL(validation.normalizedUrl)
    const deepLink = `${platform.deepLinkScheme}${parsedUrl.hostname}${parsedUrl.pathname}${parsedUrl.search}`

    return NextResponse.json({
      success: true,
      platform: platform.name,
      platformColor: platform.color,
      deepLink,
      normalizedUrl: validation.normalizedUrl,
      category: platform.category,
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
