import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUser } from '@/lib/auth'

// GET /api/admin/links — List all links with pagination and filtering (admin only)
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
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search') || ''
    const platform = searchParams.get('platform') || ''
    const userId = searchParams.get('userId') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build where clause
    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { originalUrl: { contains: search } },
        { deepLink: { contains: search } },
        { shortCode: { contains: search } },
        { title: { contains: search } },
      ]
    }

    if (platform && platform !== 'all') {
      where.platform = platform
    }

    if (userId) {
      where.userId = userId
    }

    // Validate sort
    const validSortFields = ['createdAt', 'openCount', 'platform', 'shortCode']
    const validSortOrders = ['asc', 'desc']
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt'
    const safeSortOrder = validSortOrders.includes(sortOrder) ? sortOrder : 'desc'

    const [links, total] = await Promise.all([
      db.link.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { [safeSortBy]: safeSortOrder },
        select: {
          id: true,
          originalUrl: true,
          platform: true,
          deepLink: true,
          shortCode: true,
          shortUrl: true,
          title: true,
          openCount: true,
          isFavorite: true,
          expiresAt: true,
          healthStatus: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          _count: {
            select: { analytics: true },
          },
        },
      }),
      db.link.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        links,
        total,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error('Admin links fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
