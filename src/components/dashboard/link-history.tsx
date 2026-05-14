'use client'

import { useCallback, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, X, ExternalLink, Clock, Search, Trash2, Link2, Sparkles, Globe, Heart, Pin, AlertCircle, CheckSquare, Square, FileQuestion, ArrowUpRight, TrendingUp, StickyNote } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useLinkStore } from '@/store/link-store'
import { Badge } from '@/components/ui/badge'
import { LinkCategories } from './link-categories'
import { LinkTags, LinkTagBadges, TagAssignPopover } from './link-tags'
import { LinkNotes } from './link-notes'

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

type FilterTab = 'all' | 'favorites'

export function LinkHistory() {
  const { history, removeFromHistory, toggleFavorite, setDeepLinkResult, setInputUrl, clearHistory, selectedCategory, categories, selectedLinkIds, toggleSelect, selectAll, clearSelection, filterByTag, linkTags } =
    useLinkStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [heartAnimatingId, setHeartAnimatingId] = useState<string | null>(null)
  const [selectionMode, setSelectionMode] = useState(false)
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null)

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

  const handleToggleFavorite = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite(id)
    setHeartAnimatingId(id)
    setTimeout(() => setHeartAnimatingId(null), 400)
  }, [toggleFavorite])

  const handleExpand = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedId(prev => prev === id ? null : id)
  }, [])

  // Filtered list
  const filteredHistory = useMemo(() => {
    let items = history

    if (activeTab === 'favorites') {
      items = items.filter((item) => item.isFavorite)
    }

    // Filter by selected category
    if (selectedCategory) {
      items = items.filter((item) => item.category === selectedCategory)
    }

    // Filter by selected tag
    if (filterByTag) {
      items = items.filter((item) => item.tags?.includes(filterByTag))
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      items = items.filter(
        (item) =>
          item.originalUrl.toLowerCase().includes(query) ||
          item.platform.name.toLowerCase().includes(query) ||
          item.deepLink.toLowerCase().includes(query) ||
          (item.note && item.note.toLowerCase().includes(query))
      )
    }

    return items
  }, [history, activeTab, searchQuery, selectedCategory, filterByTag])

  // Shift+click range selection handler
  const handleSelectionClick = useCallback(
    (itemId: string, index: number, e: React.MouseEvent) => {
      if (e.shiftKey && lastSelectedIndex !== null) {
        // Range selection
        const start = Math.min(lastSelectedIndex, index)
        const end = Math.max(lastSelectedIndex, index)
        const rangeIds = filteredHistory.slice(start, end + 1).map((item) => item.id)
        selectAll(rangeIds)
      } else {
        toggleSelect(itemId)
      }
      setLastSelectedIndex(index)
    },
    [lastSelectedIndex, filteredHistory, toggleSelect, selectAll]
  )

  const favoriteCount = history.filter((item) => item.isFavorite).length

  return (
    <div className="glass-card p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
      {/* Header with count badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-xs sm:text-sm font-semibold text-foreground">Recent Links</h3>
          <span className="count-badge">{history.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (selectionMode) {
                clearSelection()
              }
              setSelectionMode(!selectionMode)
            }}
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
              selectionMode
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
            }`}
          >
            {selectionMode ? (
              <>
                <CheckSquare className="h-3 w-3" />
                Done
              </>
            ) : (
              <>
                <Square className="h-3 w-3" />
                Select
              </>
            )}
          </button>
          {selectionMode && selectedLinkIds.length > 0 && (
            <button
              onClick={() => {
                const allFilteredIds = filteredHistory.map((item) => item.id)
                const allSel = allFilteredIds.every((id) => selectedLinkIds.includes(id))
                if (allSel) {
                  clearSelection()
                } else {
                  selectAll(allFilteredIds)
                }
              }}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              {filteredHistory.length > 0 && filteredHistory.every((item) => selectedLinkIds.includes(item.id)) ? (
                <>
                  <CheckSquare className="h-3 w-3" />
                  Deselect
                </>
              ) : (
                <>
                  <Square className="h-3 w-3" />
                  All
                </>
              )}
            </button>
          )}
          <span className="text-xs text-muted-foreground">{history.length} links</span>
        </div>
      </div>

      {/* Category filter */}
      <LinkCategories />

      {/* Tag filter */}
      <LinkTags />

      {/* Search Input with filter indicator */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by URL, platform, or deep link..."
          className="h-8 pl-8 pr-16 text-xs bg-background/40 border-border/50 focus:border-primary/50 transition-colors"
        />
        {searchQuery && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            <span className="text-[9px] text-muted-foreground/40">{filteredHistory.length}</span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* Tab Filter */}
      <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-0.5">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
            activeTab === 'all'
              ? 'bg-accent text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
            activeTab === 'favorites'
              ? 'bg-accent text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className="flex items-center justify-center gap-1">
            <Star className="h-3 w-3" />
            Favorites
            {favoriteCount > 0 && (
              <span className="text-[10px] text-muted-foreground/60">({favoriteCount})</span>
            )}
          </span>
        </button>
      </div>

      {/* List with improved empty state */}
      {filteredHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="empty-state-icon mb-4 relative">
            <motion.div
              animate={{ y: [-2, 2, -2] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Link2 className="h-8 w-8 text-muted-foreground/25" />
            </motion.div>
            {/* Empty state pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ border: '1px solid oklch(0.696 0.17 162.48 / 15%)' }}
            />
            {/* Orbiting decorative dots */}
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{ y: [1, -1, 1], scale: [1, 1.2, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            >
              <Sparkles className="h-4 w-4 text-primary/30" />
            </motion.div>
            <motion.div
              className="absolute -bottom-1 -left-1"
              animate={{ y: [-1, 1, -1], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
            >
              <Globe className="h-4 w-4 text-violet-400/30" />
            </motion.div>
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {searchQuery ? 'No matching links' : activeTab === 'favorites' ? 'No favorites yet' : 'No links yet'}
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1 max-w-[200px]">
            {searchQuery ? 'Try a different search term or filter' : 'Paste a link above to generate your first deep link!'}
          </p>
          {!searchQuery && activeTab === 'all' && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-3 flex items-center gap-1 text-[10px] text-emerald-400/60"
            >
              <ArrowUpRight className="h-3 w-3" />
              <span>Supports 13+ platforms</span>
            </motion.div>
          )}
        </div>
      ) : (
        <>
          <ScrollArea className="max-h-96">
            {/* Timeline container */}
            <div className="timeline-line space-y-0">
              <AnimatePresence initial={false}>
                {filteredHistory.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -30, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group relative"
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-[11px] top-3 z-10">
                      <motion.div
                        className="h-[9px] w-[9px] rounded-full border-2 border-background"
                        style={{ backgroundColor: item.platform.color }}
                        whileHover={{ scale: 1.4 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      />
                    </div>

                    {/* Pin indicator for favorites */}
                    {item.isFavorite && (
                      <motion.div
                        className="absolute -top-1 right-3 z-10"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Pin className="h-3 w-3 text-amber-400/70 rotate-45" />
                      </motion.div>
                    )}

                    {/* Hover card preview showing link details */}
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <div
                      className={`flex items-center gap-2 sm:gap-3 rounded-lg p-2 sm:p-2.5 ml-8 transition-all cursor-pointer relative overflow-hidden ${
                        selectedLinkIds.includes(item.id)
                          ? 'bg-primary/5 border border-primary/15'
                          : item.isFavorite
                            ? 'bg-amber-500/5 border border-amber-500/10'
                            : 'hover:bg-accent/50 border border-transparent'
                      } ${expandedId === item.id ? 'bg-accent/50' : ''}`}
                      onClick={(e) => {
                        if (selectionMode) {
                          handleSelectionClick(item.id, index, e)
                        } else {
                          handleItemClick(item)
                        }
                      }}
                    >
                      {/* Hover glow effect */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        style={{
                          background: `radial-gradient(ellipse at left, ${item.platform.color}08, transparent 60%)`,
                        }}
                      />

                      {/* Checkbox (when selection mode is active) */}
                      {selectionMode && (
                        <div className="shrink-0 relative z-10" onClick={(e) => { e.stopPropagation(); handleSelectionClick(item.id, index, e) }}>
                          {selectedLinkIds.includes(item.id) ? (
                            <CheckSquare className="h-4 w-4 text-primary" />
                          ) : (
                            <Square className="h-4 w-4 text-muted-foreground/50 hover:text-foreground transition-colors" />
                          )}
                        </div>
                      )}

                      {/* Platform Icon */}
                      <div className="relative shrink-0 z-10">
                        <div
                          className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md text-sm"
                          style={{
                            backgroundColor: `${item.platform.color}20`,
                          }}
                        >
                          {item.platform.icon}
                        </div>
                        {/* Note indicator dot */}
                        {item.note && (
                          <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary border border-background flex items-center justify-center">
                            <StickyNote className="h-1.5 w-1.5 text-primary-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 relative z-10">
                        <p className="text-xs sm:text-sm text-foreground truncate">
                          {truncateUrl(item.originalUrl)}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[10px] sm:text-xs text-muted-foreground">
                            {formatRelativeTime(item.createdAt)}
                          </p>
                          {item.openCount > 0 && (
                            <span className="text-[10px] text-muted-foreground/50">
                              • {item.openCount}x opened
                            </span>
                          )}
                          {item.category && (() => {
                            const cat = categories.find(c => c.id === item.category)
                            return cat ? (
                              <Badge
                                variant="outline"
                                className="h-3.5 text-[8px] px-1 border-0"
                                style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                              >
                                {cat.name}
                              </Badge>
                            ) : null
                          })()}
                          {item.expiry && new Date(item.expiry).getTime() <= Date.now() && (
                            <Badge variant="outline" className="h-3.5 text-[8px] border-red-500/30 text-red-400 px-1">
                              Expired
                            </Badge>
                          )}
                          {item.expiry && new Date(item.expiry).getTime() > Date.now() && new Date(item.expiry).getTime() - Date.now() < 3600000 && (
                            <Badge variant="outline" className="h-3.5 text-[8px] border-amber-500/30 text-amber-400 px-1">
                              Expiring
                            </Badge>
                          )}
                        </div>

                        {/* Tag pills */}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1 group/tag">
                            {item.tags.map((tagId) => {
                              const tag = linkTags.find(t => t.id === tagId)
                              if (!tag) return null
                              return (
                                <Badge
                                  key={tagId}
                                  variant="outline"
                                  className="h-4 text-[8px] px-1.5 border-0"
                                  style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                                >
                                  {tag.name}
                                </Badge>
                              )
                            })}
                          </div>
                        )}

                        {/* Link Notes */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity" style={item.note ? { opacity: 1 } : undefined}>
                          <LinkNotes linkId={item.id} currentNote={item.note} />
                        </div>

                        {/* Expanded details */}
                        <AnimatePresence>
                          {expandedId === item.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-2 pt-2 border-t border-border/20 space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">Deep Link</span>
                                  <p className="text-[11px] text-primary font-mono truncate">
                                    {item.deepLink}
                                  </p>
                                </div>
                                {item.shortCode && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">Short</span>
                                    <p className="text-[11px] text-amber-400 font-mono">
                                      /s/{item.shortCode}
                                    </p>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">Platform</span>
                                  <p className="text-[11px] text-foreground">
                                    {item.platform.name}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Actions - hidden in selection mode */}
                      {!selectionMode && (
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 relative z-10">
                        {/* Favorite / Heart button with animation */}
                        <button
                          onClick={(e) => handleToggleFavorite(item.id, e)}
                          className="rounded-md p-1 hover:bg-accent transition-colors"
                        >
                          <span className={heartAnimatingId === item.id ? 'animate-heart-pop inline-block' : ''}>
                            {item.isFavorite ? (
                              <Heart className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            ) : (
                              <Heart className="h-3.5 w-3.5 text-muted-foreground hover:text-amber-400 transition-colors" />
                            )}
                          </span>
                        </button>

                        {/* Tag assign popover */}
                        <TagAssignPopover linkId={item.id} existingTags={item.tags} />

                        {/* Expand button */}
                        <button
                          onClick={(e) => handleExpand(item.id, e)}
                          className="rounded-md p-1 hover:bg-accent transition-colors"
                        >
                          <Clock className={`h-3.5 w-3.5 transition-colors ${expandedId === item.id ? 'text-primary' : 'text-muted-foreground'}`} />
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
                      )}
                    </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="glass-card w-64 p-3" side="left">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs"
                              style={{ backgroundColor: `${item.platform.color}20` }}
                            >
                              {item.platform.icon}
                            </div>
                            <span className="text-xs font-medium text-foreground">{item.platform.name}</span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">Deep Link</p>
                            <p className="text-[11px] text-primary font-mono truncate">{item.deepLink}</p>
                          </div>
                          {item.shortCode && (
                            <div className="space-y-1">
                              <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">Short Code</p>
                              <p className="text-[11px] text-amber-400 font-mono">/s/{item.shortCode}</p>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground/50">
                            <span>{item.openCount}x opened</span>
                            <span>•</span>
                            <span>{formatRelativeTime(item.createdAt)}</span>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>

          {/* Clear All Button */}
          {history.length > 0 && (
            <div className="flex justify-end pt-2 border-t border-border/20">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="glass-card border-border/50">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all history?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all {history.length} links from your history. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={clearHistory}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Clear All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </>
      )}
    </div>
  )
}
