'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, TrendingUp, Zap, ExternalLink, Trash2, Info, Globe } from 'lucide-react'
import { useLinkStore } from '@/store/link-store'
import { getAllPlatforms } from '@/lib/platform-detect'
import { Button } from '@/components/ui/button'
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card'

// ─── Quick Action Cards ────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: 'Open Instagram Profile', url: 'https://www.instagram.com/', icon: '📸', color: '#E4405F' },
  { label: 'Open YouTube Video', url: 'https://www.youtube.com/watch?v=', icon: '▶️', color: '#FF0000' },
  { label: 'Open X Profile', url: 'https://x.com/', icon: '🐦', color: '#1DA1F2' },
  { label: 'Open Telegram Chat', url: 'https://t.me/', icon: '✈️', color: '#26A5E4' },
  { label: 'Open LinkedIn Profile', url: 'https://www.linkedin.com/in/', icon: '💼', color: '#0A66C2' },
  { label: 'Open Reddit Post', url: 'https://www.reddit.com/r/', icon: '🤖', color: '#FF4500' },
]

// ─── Suggestion Card ───────────────────────────────────────────────

function SuggestionCard({
  label,
  sublabel,
  icon,
  color,
  onClick,
  index,
  hoverDetails,
}: {
  label: string
  sublabel?: string
  icon: string
  color: string
  onClick: () => void
  index: number
  hoverDetails?: { platform?: string; description?: string }
}) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{
            duration: 0.3,
            delay: index * 0.05,
            ease: [0.25, 0.46, 0.45, 0.94] as const,
          }}
          whileHover={{ scale: 1.02, x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClick}
          className="suggestion-card-hover flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-left hover:bg-accent/50 transition-colors group focus-visible-ring"
          style={{ background: `linear-gradient(135deg, ${color}06, ${color}02)` }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 transition-transform group-hover:scale-110"
            style={{ backgroundColor: `${color}15` }}
          >
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
              {label}
            </p>
            {sublabel && (
              <p className="text-[10px] text-muted-foreground truncate">
                {sublabel}
              </p>
            )}
          </div>
          <ExternalLink className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary/60 transition-colors shrink-0" />
        </motion.button>
      </HoverCardTrigger>
      {hoverDetails && (
        <HoverCardContent className="glass-card w-56 p-3 space-y-2" sideOffset={6}>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center text-xs"
              style={{ backgroundColor: `${color}20` }}
            >
              {icon}
            </div>
            <span className="text-xs font-medium text-foreground">
              {hoverDetails.platform || label}
            </span>
          </div>
          {hoverDetails.description && (
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              {hoverDetails.description}
            </p>
          )}
          <div className="flex items-center gap-1 text-[9px] text-muted-foreground/60">
            <Globe className="h-2.5 w-2.5" />
            Click to open
          </div>
        </HoverCardContent>
      )}
    </HoverCard>
  )
}

// ─── Main Component ────────────────────────────────────────────────

export function UrlSuggestions() {
  const { inputUrl, setInputUrl, recentUrls, clearRecentUrls, history } = useLinkStore()

  // Trending platforms based on user history
  const trendingPlatforms = useMemo(() => {
    if (history.length === 0) {
      // Show top platforms from registry as defaults
      const platforms = getAllPlatforms().slice(0, 5)
      return platforms.map((p) => ({
        id: p.id,
        name: p.name,
        icon: p.icon,
        color: p.color,
        urlPattern: p.urlPatterns[0]?.source.replace(/\\\//g, '/').replace(/\^/g, '').replace(/\$$/g, '') || '',
      }))
    }

    // Count platform usage from history
    const platformCounts: Record<string, { count: number; name: string; icon: string; color: string; urlPattern: string }> = {}
    for (const item of history) {
      const pid = item.platform?.id
      if (!pid) continue
      if (!platformCounts[pid]) {
        const platformInfo = getAllPlatforms().find((p) => p.id === pid)
        platformCounts[pid] = {
          count: 0,
          name: item.platform?.name || pid,
          icon: item.platform?.icon || '🔗',
          color: item.platform?.color || '#888',
          urlPattern: platformInfo?.urlPatterns[0]?.source.replace(/\\\//g, '/').replace(/\^/g, '').replace(/\$$/g, '') || '',
        }
      }
      platformCounts[pid].count++
    }

    return Object.values(platformCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [history])

  const hasRecentUrls = recentUrls.length > 0
  const hasContent = hasRecentUrls || trendingPlatforms.length > 0 || QUICK_ACTIONS.length > 0

  // Don't show suggestions when user is typing or has no content
  if (inputUrl.trim() || !hasContent) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="glass-card rounded-xl p-4 space-y-4 mt-2">
        {/* Recent URLs */}
        {hasRecentUrls && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Recent URLs</span>
              </div>
              <AnimatePresence>
                {recentUrls.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearRecentUrls}
                      className="h-6 px-2 text-[10px] text-muted-foreground hover:text-red-400"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Clear All
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="space-y-0.5 max-h-40 overflow-y-auto scrollbar-thin">
              <AnimatePresence>
                {recentUrls.slice(0, 6).map((url, i) => (
                  <SuggestionCard
                    key={url}
                    label={url.length > 45 ? url.slice(0, 45) + '...' : url}
                    sublabel="Previously used"
                    icon="🕐"
                    color="#6b7280"
                    onClick={() => setInputUrl(url)}
                    index={i}
                    hoverDetails={{ platform: 'Recent URL', description: 'A URL you previously used for deep link generation' }}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Trending Platforms */}
        {trendingPlatforms.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Trending Platforms</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {trendingPlatforms.map((p, i) => (
                  <motion.button
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    whileHover={{ scale: 1.08, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setInputUrl(p.urlPattern || `https://${p.id}.com/`)}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 border border-border/30 hover:border-primary/30 transition-all group focus-visible-ring"
                    style={{ backgroundColor: `${p.color}08` }}
                  >
                    <span className="text-sm">{p.icon}</span>
                    <span className="text-[11px] font-medium text-foreground/80 group-hover:text-primary transition-colors">
                      {p.name}
                    </span>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Quick Access Actions */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Quick Access</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <AnimatePresence>
              {QUICK_ACTIONS.map((action, i) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setInputUrl(action.url)}
                  className="suggestion-card-hover flex items-center gap-2 rounded-lg px-2.5 py-2 border border-border/20 hover:border-primary/20 transition-all group focus-visible-ring"
                  style={{ background: `linear-gradient(135deg, ${action.color}08, ${action.color}02)` }}
                >
                  <span className="text-sm shrink-0">{action.icon}</span>
                  <span className="text-[10px] font-medium text-foreground/70 group-hover:text-primary transition-colors truncate">
                    {action.label}
                  </span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
