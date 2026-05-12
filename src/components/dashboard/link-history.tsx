'use client'

import { useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, X, ExternalLink, Clock } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useLinkStore } from '@/store/link-store'

function formatRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function truncateUrl(url: string, maxLen: number = 35): string {
  try {
    const parsed = new URL(url)
    const display = parsed.hostname + parsed.pathname
    if (display.length <= maxLen) return display
    return display.slice(0, maxLen) + '...'
  } catch {
    if (url.length <= maxLen) return url
    return url.slice(0, maxLen) + '...'
  }
}

export function LinkHistory() {
  const { history, removeFromHistory, toggleFavorite, setDeepLinkResult, setInputUrl } =
    useLinkStore()

  const handleItemClick = useCallback(
    (item: (typeof history)[0]) => {
      setInputUrl(item.originalUrl)
      setDeepLinkResult({
        originalUrl: item.originalUrl,
        deepLink: item.deepLink,
        webUrl: item.originalUrl,
        fallbackUrl: item.originalUrl,
        shortCode: item.shortCode,
      })
    },
    [setInputUrl, setDeepLinkResult]
  )

  return (
    <div className="glass-card p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Recent Links</h3>
        <span className="text-xs text-muted-foreground">{history.length} links</span>
      </div>

      {/* List */}
      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Clock className="h-8 w-8 text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">No links yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Paste a link above to get started!
          </p>
        </div>
      ) : (
        <ScrollArea className="max-h-96">
          <div className="space-y-1">
            <AnimatePresence initial={false}>
              {history.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                  className="group flex items-center gap-3 rounded-lg p-2.5 hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => handleItemClick(item)}
                >
                  {/* Platform Icon */}
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sm"
                    style={{
                      backgroundColor: `${item.platform.color}20`,
                    }}
                  >
                    {item.platform.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">
                      {truncateUrl(item.originalUrl)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(item.createdAt)}
                    </p>
                  </div>

                  {/* Open Count */}
                  {item.openCount > 0 && (
                    <span className="text-xs text-muted-foreground/60 shrink-0">
                      {item.openCount}x
                    </span>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(item.id)
                      }}
                      className="rounded-md p-1 hover:bg-accent transition-colors"
                    >
                      <Star
                        className={`h-3.5 w-3.5 transition-colors ${
                          item.isFavorite
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(item.deepLink, '_blank')
                      }}
                      className="rounded-md p-1 hover:bg-accent transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFromHistory(item.id)
                      }}
                      className="rounded-md p-1 hover:bg-destructive/20 transition-colors"
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
