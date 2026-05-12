'use client'

import { useMemo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Link2, Filter, X, GripVertical } from 'lucide-react'
import { useLinkStore } from '@/store/link-store'

// Generate sparkline SVG path from data points
function generateSparklinePath(data: number[], width: number, height: number): string {
  if (data.length < 2) return ''
  const max = Math.max(...data, 1)
  const step = width / (data.length - 1)
  return data
    .map((val, i) => {
      const x = i * step
      const y = height - (val / max) * height * 0.8 - height * 0.1
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

interface ClusterData {
  platformId: string
  platformName: string
  platformIcon: string
  platformColor: string
  count: number
  sparklineData: number[]
  linkIds: string[]
}

export function LinkClusters() {
  const { history, filterPlatform, setFilterPlatform } = useLinkStore()
  const [dragOverCluster, setDragOverCluster] = useState<string | null>(null)

  // Group links by platform
  const clusters = useMemo(() => {
    const platformMap = new Map<string, ClusterData>()

    // Build daily activity data for the last 7 days
    const now = Date.now()
    const dayMs = 86400000

    history.forEach((item) => {
      const pid = item.platform.id
      if (!platformMap.has(pid)) {
        platformMap.set(pid, {
          platformId: pid,
          platformName: item.platform.name,
          platformIcon: item.platform.icon,
          platformColor: item.platform.color,
          count: 0,
          sparklineData: [0, 0, 0, 0, 0, 0, 0], // last 7 days
          linkIds: [],
        })
      }
      const cluster = platformMap.get(pid)!
      cluster.count++
      cluster.linkIds.push(item.id)

      // Determine which day bucket this link falls in
      const itemTime = new Date(item.createdAt).getTime()
      const daysAgo = Math.floor((now - itemTime) / dayMs)
      if (daysAgo >= 0 && daysAgo < 7) {
        cluster.sparklineData[6 - daysAgo]++
      }
    })

    // Ungrouped: links without tags
    const ungroupedLinks = history.filter(
      (item) => !item.tags || item.tags.length === 0
    )
    const ungroupedSparkline = [0, 0, 0, 0, 0, 0, 0]
    ungroupedLinks.forEach((item) => {
      const itemTime = new Date(item.createdAt).getTime()
      const daysAgo = Math.floor((now - itemTime) / dayMs)
      if (daysAgo >= 0 && daysAgo < 7) {
        ungroupedSparkline[6 - daysAgo]++
      }
    })

    const result = Array.from(platformMap.values())

    // Add ungrouped cluster
    if (ungroupedLinks.length > 0) {
      result.push({
        platformId: 'ungrouped',
        platformName: 'Ungrouped',
        platformIcon: '📂',
        platformColor: '#6b7280',
        count: ungroupedLinks.length,
        sparklineData: ungroupedSparkline,
        linkIds: ungroupedLinks.map((l) => l.id),
      })
    }

    // Sort by count descending
    result.sort((a, b) => b.count - a.count)

    return result
  }, [history])

  const handleClusterClick = useCallback(
    (platformId: string) => {
      if (filterPlatform === platformId) {
        setFilterPlatform(null)
      } else {
        setFilterPlatform(platformId === 'ungrouped' ? null : platformId)
      }
    },
    [filterPlatform, setFilterPlatform]
  )

  const handleDragStart = useCallback(
    (e: React.DragEvent, linkId: string) => {
      e.dataTransfer.setData('text/plain', linkId)
      e.dataTransfer.effectAllowed = 'move'
    },
    []
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent, platformId: string) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      setDragOverCluster(platformId)
    },
    []
  )

  const handleDragLeave = useCallback(() => {
    setDragOverCluster(null)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, _targetPlatformId: string) => {
      e.preventDefault()
      setDragOverCluster(null)
      // Note: Moving links between platform clusters isn't semantically possible
      // since platform is auto-detected from URL. The drag-drop here provides
      // visual feedback and can be used for future tag-based grouping.
    },
    []
  )

  if (history.length === 0) {
    return null
  }

  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Link Clusters</h3>
        </div>
        {filterPlatform && (
          <button
            onClick={() => setFilterPlatform(null)}
            className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] text-primary bg-primary/10 hover:bg-primary/15 transition-colors"
          >
            <X className="h-3 w-3" />
            Clear filter
          </button>
        )}
      </div>

      {/* Cluster Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        <AnimatePresence>
          {clusters.map((cluster, index) => {
            const isActive = filterPlatform === cluster.platformId
            const isDragOver = dragOverCluster === cluster.platformId
            const sparklinePath = generateSparklinePath(
              cluster.sparklineData,
              60,
              20
            )

            return (
              <motion.div
                key={cluster.platformId}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.06,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                draggable
                onDragStart={(e) => {
                  // Use the first link ID as drag data
                  if (cluster.linkIds[0]) {
                    handleDragStart(
                      e as unknown as React.DragEvent,
                      cluster.linkIds[0]
                    )
                  }
                }}
                onDragOver={(e) =>
                  handleDragOver(
                    e as unknown as React.DragEvent,
                    cluster.platformId
                  )
                }
                onDragLeave={handleDragLeave}
                onDrop={(e) =>
                  handleDrop(
                    e as unknown as React.DragEvent,
                    cluster.platformId
                  )
                }
                onClick={() => handleClusterClick(cluster.platformId)}
                className={`relative rounded-lg p-3 cursor-pointer transition-all border group ${
                  isActive
                    ? 'border-primary/40 bg-primary/5 shadow-sm shadow-primary/10'
                    : isDragOver
                      ? 'border-primary/30 bg-primary/5 scale-[1.02]'
                      : 'border-border/20 hover:border-border/40 hover:bg-accent/30'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Drag handle */}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-50 transition-opacity">
                  <GripVertical className="h-3 w-3 text-muted-foreground" />
                </div>

                {/* Platform icon & name */}
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-md text-sm shrink-0"
                    style={{
                      backgroundColor: `${cluster.platformColor}20`,
                    }}
                  >
                    {cluster.platformIcon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-foreground truncate">
                      {cluster.platformName}
                    </p>
                  </div>
                </div>

                {/* Count */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <Link2 className="h-3 w-3 text-muted-foreground/60" />
                    <span className="text-sm font-bold text-foreground">
                      {cluster.count}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">
                      link{cluster.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {isActive && (
                    <Filter className="h-3 w-3 text-primary" />
                  )}
                </div>

                {/* Mini sparkline */}
                <svg
                  width="100%"
                  height="20"
                  viewBox="0 0 60 20"
                  preserveAspectRatio="none"
                  className="overflow-visible"
                >
                  {sparklinePath && (
                    <>
                      <defs>
                        <linearGradient
                          id={`spark-grad-${cluster.platformId}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor={cluster.platformColor}
                            stopOpacity="0.3"
                          />
                          <stop
                            offset="100%"
                            stopColor={cluster.platformColor}
                            stopOpacity="0"
                          />
                        </linearGradient>
                      </defs>
                      {/* Area fill */}
                      <path
                        d={`${sparklinePath} L60,20 L0,20 Z`}
                        fill={`url(#spark-grad-${cluster.platformId})`}
                      />
                      {/* Line */}
                      <path
                        d={sparklinePath}
                        fill="none"
                        stroke={cluster.platformColor}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={isActive ? 1 : 0.7}
                      />
                      {/* End dot */}
                      {cluster.sparklineData.length > 0 && (
                        <circle
                          cx="60"
                          cy={
                            20 -
                            (cluster.sparklineData[
                              cluster.sparklineData.length - 1
                            ] /
                              Math.max(...cluster.sparklineData, 1)) *
                              20 *
                              0.8 -
                            20 * 0.1
                          }
                          r="2"
                          fill={cluster.platformColor}
                        />
                      )}
                    </>
                  )}
                </svg>

                {/* Active indicator glow */}
                {isActive && (
                  <motion.div
                    layoutId="cluster-active-indicator"
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{
                      boxShadow: `0 0 12px ${cluster.platformColor}30`,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Total count */}
      <p className="text-[10px] text-muted-foreground/50 text-center">
        {clusters.reduce((sum, c) => sum + c.count, 0)} links across{' '}
        {clusters.length} cluster{clusters.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
