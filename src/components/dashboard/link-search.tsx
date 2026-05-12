'use client'

import { useMemo, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, SlidersHorizontal, ArrowUpDown, Calendar, Filter, RotateCcw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLinkStore } from '@/store/link-store'
import { getAllPlatforms } from '@/lib/platform-detect'

const DATE_RANGES = [
  { value: 'all' as const, label: 'All Time' },
  { value: 'today' as const, label: 'Today' },
  { value: '7d' as const, label: 'Last 7 Days' },
  { value: '30d' as const, label: 'Last 30 Days' },
]

const SORT_OPTIONS = [
  { value: 'newest' as const, label: 'Newest First' },
  { value: 'oldest' as const, label: 'Oldest First' },
  { value: 'mostOpened' as const, label: 'Most Opened' },
  { value: 'recentlyOpened' as const, label: 'Recently Opened' },
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'expiring', label: 'Expiring' },
]

export function LinkSearch() {
  const {
    history,
    searchQuery,
    setSearchQuery,
    filterPlatform,
    setFilterPlatform,
    filterDateRange,
    setFilterDateRange,
    sortBy,
    setSortBy,
  } = useLinkStore()

  const [localQuery, setLocalQuery] = useState(searchQuery)
  const [statusFilter, setStatusFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  // Debounce search query to store
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localQuery)
    }, 200)
    return () => clearTimeout(timer)
  }, [localQuery, setSearchQuery])

  const platforms = useMemo(() => getAllPlatforms(), [])

  // Filter and sort results
  const filteredCount = useMemo(() => {
    let items = history

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      items = items.filter(
        (item) =>
          item.originalUrl.toLowerCase().includes(query) ||
          item.platform.name.toLowerCase().includes(query) ||
          item.deepLink.toLowerCase().includes(query)
      )
    }

    // Platform filter
    if (filterPlatform) {
      items = items.filter((item) => item.platform.id === filterPlatform)
    }

    // Date range filter
    const now = Date.now()
    if (filterDateRange !== 'all') {
      items = items.filter((item) => {
        const itemDate = new Date(item.createdAt).getTime()
        switch (filterDateRange) {
          case 'today':
            return now - itemDate < 86400000
          case '7d':
            return now - itemDate < 604800000
          case '30d':
            return now - itemDate < 2592000000
          default:
            return true
        }
      })
    }

    // Status filter
    if (statusFilter !== 'all') {
      items = items.filter((item) => {
        if (!item.expiry) return statusFilter === 'active'
        const expiryTime = new Date(item.expiry).getTime()
        if (statusFilter === 'expired') return expiryTime <= now
        if (statusFilter === 'expiring') return expiryTime > now && expiryTime - now < 3600000
        if (statusFilter === 'active') return expiryTime > now
        return true
      })
    }

    // Sort
    const sorted = [...items].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'mostOpened':
          return b.openCount - a.openCount
        case 'recentlyOpened':
          return b.openCount > 0
            ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            : -1
        default:
          return 0
      }
    })

    return sorted.length
  }, [history, searchQuery, filterPlatform, filterDateRange, statusFilter, sortBy])

  const hasActiveFilters = filterPlatform !== null || filterDateRange !== 'all' || statusFilter !== 'all' || searchQuery.trim() !== ''

  const handleReset = () => {
    setLocalQuery('')
    setSearchQuery('')
    setFilterPlatform(null)
    setFilterDateRange('all')
    setStatusFilter('all')
    setSortBy('newest')
  }

  const activeFilterCount = [
    filterPlatform !== null,
    filterDateRange !== 'all',
    statusFilter !== 'all',
  ].filter(Boolean).length

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card rounded-xl p-4 space-y-3"
    >
      {/* Search Bar Row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search links by URL, platform, or deep link..."
            className="h-9 pl-9 pr-8 text-sm bg-background/40 border-border/50 focus:border-primary/50 transition-colors"
          />
          {localQuery && (
            <button
              onClick={() => { setLocalQuery(''); setSearchQuery('') }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Result Count Badge */}
        <Badge
          variant="secondary"
          className="shrink-0 text-xs font-medium bg-primary/10 text-primary border border-primary/20"
        >
          {filteredCount} link{filteredCount !== 1 ? 's' : ''}
        </Badge>

        {/* Filter Toggle */}
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`h-9 gap-1.5 text-xs relative ${
                activeFilterCount > 0
                  ? 'text-primary bg-primary/10 hover:bg-primary/15'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="flex items-center justify-center h-4 w-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="glass-card w-72 p-3 space-y-3" sideOffset={8} align="end">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">Filters</span>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </button>
              )}
            </div>

            {/* Platform Filter */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Platform
              </label>
              <Select
                value={filterPlatform || 'all'}
                onValueChange={(value) => setFilterPlatform(value === 'all' ? null : value)}
              >
                <SelectTrigger className="h-8 text-xs bg-background/40 border-border/50">
                  <SelectValue placeholder="All Platforms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  {platforms.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="flex items-center gap-1.5">
                        <span>{p.icon}</span>
                        {p.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Date Range
              </label>
              <Select
                value={filterDateRange}
                onValueChange={(value: 'today' | '7d' | '30d' | 'all') => setFilterDateRange(value)}
              >
                <SelectTrigger className="h-8 text-xs bg-background/40 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_RANGES.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-xs bg-background/40 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </PopoverContent>
        </Popover>

        {/* Sort Select */}
        <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest' | 'mostOpened' | 'recentlyOpened') => setSortBy(value)}>
          <SelectTrigger className="h-9 w-auto gap-1.5 text-xs bg-background/40 border-border/50">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">
              {SORT_OPTIONS.find((o) => o.value === sortBy)?.label || 'Sort'}
            </span>
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters Display */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap items-center gap-1.5 overflow-hidden"
          >
            {searchQuery.trim() && (
              <Badge variant="secondary" className="text-[10px] gap-1 bg-primary/10 text-primary border border-primary/20">
                Search: &ldquo;{searchQuery.trim().slice(0, 20)}&rdquo;
                <button onClick={() => { setLocalQuery(''); setSearchQuery('') }}>
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            )}
            {filterPlatform && (
              <Badge variant="secondary" className="text-[10px] gap-1 bg-violet-500/10 text-violet-400 border border-violet-500/20">
                {platforms.find((p) => p.id === filterPlatform)?.icon}{' '}
                {platforms.find((p) => p.id === filterPlatform)?.name}
                <button onClick={() => setFilterPlatform(null)}>
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            )}
            {filterDateRange !== 'all' && (
              <Badge variant="secondary" className="text-[10px] gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {DATE_RANGES.find((r) => r.value === filterDateRange)?.label}
                <button onClick={() => setFilterDateRange('all')}>
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            )}
            {statusFilter !== 'all' && (
              <Badge variant="secondary" className="text-[10px] gap-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {STATUS_OPTIONS.find((s) => s.value === statusFilter)?.label}
                <button onClick={() => setStatusFilter('all')}>
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            )}
            <button
              onClick={handleReset}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              Clear all
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
