// Shared in-memory store for link sharing feature
// This is used by both /api/share and /api/share/[code] routes

export interface SharedLink {
  code: string
  originalUrl: string
  deepLink: string
  platform: string
  shortCode?: string
  allowDeepLinkReveal: boolean
  views: number
  expiresAt: string | null
  createdAt: string
}

export const sharedLinks = new Map<string, SharedLink>()
