import { NextRequest, NextResponse } from 'next/server'
import { detectPlatform, validateUrl } from '@/lib/platform-detect'
import { generateDeepLink, generateShortCode } from '@/lib/deep-link'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, customAlias } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate custom alias if provided
    if (customAlias && typeof customAlias === 'string') {
      if (customAlias.length < 3 || customAlias.length > 20) {
        return NextResponse.json(
          { error: 'Custom alias must be 3-20 characters' },
          { status: 400 }
        )
      }
      if (!/^[a-zA-Z0-9-]+$/.test(customAlias)) {
        return NextResponse.json(
          { error: 'Custom alias can only contain letters, numbers, and hyphens' },
          { status: 400 }
        )
      }
      // Check if alias is already taken
      const existing = await db.link.findFirst({
        where: { shortCode: customAlias },
      })
      if (existing) {
        return NextResponse.json(
          { error: 'This alias is already taken' },
          { status: 409 }
        )
      }
    }

    // Validate URL
    const validation = validateUrl(url)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid URL' },
        { status: 400 }
      )
    }

    // Detect platform
    const platform = detectPlatform(validation.normalizedUrl)
    if (!platform) {
      return NextResponse.json(
        { error: 'Unsupported platform. We support Instagram, YouTube, Facebook, TikTok, Telegram, WhatsApp, X/Twitter, Snapchat, LinkedIn, Pinterest, Reddit, Discord, and Threads.' },
        { status: 400 }
      )
    }

    // Generate deep link
    const result = generateDeepLink(validation.normalizedUrl, platform)
    const shortCode = customAlias || generateShortCode()

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

    return NextResponse.json({
      success: true,
      data: {
        originalUrl: result.originalUrl,
        platform: {
          id: platform.id,
          name: platform.name,
          icon: platform.icon,
          color: platform.color,
          deepLinkScheme: platform.deepLinkScheme,
          category: platform.category,
        },
        deepLink: result.deepLink,
        webUrl: result.webUrl,
        fallbackUrl: result.fallbackUrl,
        shortCode,
      },
    })
  } catch (error) {
    console.error('Link processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const links = await db.link.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    })

    const total = await db.link.count()

    return NextResponse.json({
      success: true,
      data: links,
      pagination: { total, limit, offset },
    })
  } catch (error) {
    console.error('Links fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
