import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

// ============================================================================
// Types
// ============================================================================

/** Type filter: search in original URL, deep link, or both */
type SearchType = 'all' | 'link' | 'deepLink'

/** A single search result with highlighted matching terms */
interface SearchResult {
  id: string
  originalUrl: string
  deepLink: string | null
  shortCode: string
  platform: string
  title: string | null
  isFavorite: boolean
  openCount: number
  createdAt: string
  highlights: Record<string, string[]>
}

/** Paginated search response */
interface SearchResponse {
  results: SearchResult[]
  total: number
  limit: number
  offset: number
  query: string
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Sanitize a search query string by removing dangerous characters and
 * trimming whitespace. Only allows alphanumeric, spaces, and common
 * URL-safe characters.
 *
 * @param query - The raw search query
 * @returns The sanitized query string
 */
function sanitizeQuery(query: string): string {
  return query
    .trim()
    .slice(0, 200) // Limit query length
    .replace(/[<>{}|\\^`]/g, '') // Remove potentially dangerous characters
}

/**
 * Extract highlighted snippets from a text field based on the search query.
 * Returns an array of matching fragments with the query term emphasized
 * via case-insensitive matching.
 *
 * @param text  - The text to search within
 * @param query - The search query to highlight
 * @returns Array of matching text fragments (max 3)
 */
function extractHighlights(text: string, query: string): string[] {
  if (!text || !query) return []

  const highlights: string[] = []
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()

  let searchStart = 0
  while (searchStart < lowerText.length && highlights.length < 3) {
    const index = lowerText.indexOf(lowerQuery, searchStart)
    if (index === -1) break

    // Extract a snippet around the match (up to 80 chars)
    const snippetStart = Math.max(0, index - 20)
    const snippetEnd = Math.min(text.length, index + query.length + 40)
    let snippet = text.slice(snippetStart, snippetEnd)
    if (snippetStart > 0) snippet = '...' + snippet
    if (snippetEnd < text.length) snippet = snippet + '...'

    highlights.push(snippet)
    searchStart = index + query.length
  }

  return highlights
}

/**
 * Build a Prisma `where` clause for searching links based on the given
 * query, type filter, and platform filter.
 *
 * @param query    - The search keyword
 * @param type     - Whether to search in originalUrl, deepLink, or both
 * @param platform - Optional platform filter
 * @returns A Prisma-compatible where clause object
 */
function buildWhereClause(query: string, type: SearchType, platform?: string) {
  // SQLite's contains filter is case-insensitive by default
  const containsQuery = { contains: query }

  const searchConditions: Record<string, typeof containsQuery>[] = []

  if (type === 'all' || type === 'link') {
    searchConditions.push({ originalUrl: containsQuery })
    searchConditions.push({ shortCode: containsQuery })
    searchConditions.push({ title: containsQuery })
  }

  if (type === 'all' || type === 'deepLink') {
    searchConditions.push({ deepLink: containsQuery })
  }

  const where: Record<string, unknown> = {
    OR: searchConditions,
  }

  if (platform) {
    where.platform = platform
  }

  return where
}

// ============================================================================
// GET /api/search — Search links with keyword, platform, and type filters
// ============================================================================

/**
 * GET handler for link search.
 *
 * Accepts query parameters:
 * - `q` — Search keyword (required, min 1 character)
 * - `platform` — Filter by platform ID (optional)
 * - `type` — Search scope: 'all' | 'link' | 'deepLink' (default: 'all')
 * - `limit` — Results per page (default: 20, max: 100)
 * - `offset` — Pagination offset (default: 0)
 *
 * Returns paginated results with highlighted matching terms and total count.
 *
 * @param request - The incoming Next.js request
 * @returns JSON response with search results
 */
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = withRateLimit(request, RATE_LIMITS.search)
    if (rateLimitResponse) return rateLimitResponse

    const searchParams = request.nextUrl.searchParams
    const rawQuery = searchParams.get('q') || ''
    const query = sanitizeQuery(rawQuery)
    const platform = searchParams.get('platform') || undefined
    const rawType = searchParams.get('type') || 'all'
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    // Validate required query
    if (!query || query.length < 1) {
      return NextResponse.json(
        { success: false, error: 'Search query (q) is required and must be at least 1 character' },
        { status: 400 }
      )
    }

    // Validate type parameter
    const validTypes: SearchType[] = ['all', 'link', 'deepLink']
    const type: SearchType = validTypes.includes(rawType as SearchType)
      ? (rawType as SearchType)
      : 'all'

    // Build where clause
    const where = buildWhereClause(query, type, platform)

    // Execute search with pagination
    const [links, total] = await Promise.all([
      db.link.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          originalUrl: true,
          deepLink: true,
          shortCode: true,
          platform: true,
          title: true,
          isFavorite: true,
          openCount: true,
          createdAt: true,
        },
      }),
      db.link.count({ where }),
    ])

    // Build results with highlights
    const results: SearchResult[] = links.map((link) => {
      const highlights: Record<string, string[]> = {}

      // Highlight matches in each searchable field
      const urlHighlights = extractHighlights(link.originalUrl, query)
      if (urlHighlights.length > 0) {
        highlights.originalUrl = urlHighlights
      }

      if (link.deepLink) {
        const deepHighlights = extractHighlights(link.deepLink, query)
        if (deepHighlights.length > 0) {
          highlights.deepLink = deepHighlights
        }
      }

      const codeHighlights = extractHighlights(link.shortCode, query)
      if (codeHighlights.length > 0) {
        highlights.shortCode = codeHighlights
      }

      if (link.title) {
        const titleHighlights = extractHighlights(link.title, query)
        if (titleHighlights.length > 0) {
          highlights.title = titleHighlights
        }
      }

      return {
        id: link.id,
        originalUrl: link.originalUrl,
        deepLink: link.deepLink,
        shortCode: link.shortCode,
        platform: link.platform,
        title: link.title,
        isFavorite: link.isFavorite,
        openCount: link.openCount,
        createdAt: link.createdAt.toISOString(),
        highlights,
      }
    })

    const data: SearchResponse = {
      results,
      total,
      limit,
      offset,
      query,
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Link search error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
