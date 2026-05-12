'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useLinkStore } from '@/store/link-store'

interface ActivityItem {
  id: string
  platform: string
  platformIcon: string
  platformColor: string
  action: string
  timestamp: Date
  status: 'success' | 'failed' | 'pending'
}

const SIMULATED_ACTIONS = [
  { platform: 'Instagram', icon: '📸', color: '#E4405F', action: 'link opened in native app' },
  { platform: 'YouTube', icon: '▶️', color: '#FF0000', action: 'deep link generated' },
  { platform: 'Facebook', icon: '👤', color: '#1877F2', action: 'link opened in native app' },
  { platform: 'TikTok', icon: '🎵', color: '#1DA1F2', action: 'video deep link created' },
  { platform: 'Telegram', icon: '✈️', color: '#26A5E4', action: 'channel link resolved' },
  { platform: 'WhatsApp', icon: '💬', color: '#25D366', action: 'chat deep link opened' },
  { platform: 'X (Twitter)', icon: '🐦', color: '#1DA1F2', action: 'profile link opened in app' },
  { platform: 'Snapchat', icon: '👻', color: '#FFFC00', action: 'story link detected' },
  { platform: 'LinkedIn', icon: '💼', color: '#0A66C2', action: 'post deep link generated' },
  { platform: 'Pinterest', icon: '📌', color: '#E60023', action: 'pin link resolved' },
  { platform: 'Reddit', icon: '🤖', color: '#FF4500', action: 'thread deep link opened' },
  { platform: 'Discord', icon: '🎮', color: '#5865F2', action: 'invite link processed' },
  { platform: 'Threads', icon: '🧵', color: '#333', action: 'post link detected' },
]

const STATUS_CONFIG = {
  success: { label: 'Success', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)' },
  failed: { label: 'Failed', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)' },
  pending: { label: 'Pending', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' },
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)

  if (diffSecs < 60) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  return `${Math.floor(diffMins / 60)}h ago`
}

// Module-level seed data (generated once, stable across renders)
let _seedActivities: ActivityItem[] | null = null
function getSeedActivities(): ActivityItem[] {
  if (!_seedActivities) {
    const now = new Date()
    const result: ActivityItem[] = []
    for (let i = 0; i < 8; i++) {
      const sim = SIMULATED_ACTIONS[i % SIMULATED_ACTIONS.length]
      result.push({
        id: `sim-init-${i}-${now.getTime()}`,
        platform: sim.platform,
        platformIcon: sim.icon,
        platformColor: sim.color,
        action: sim.action,
        timestamp: new Date(now.getTime() - (i + 1) * 45000),
        status: i === 3 ? 'pending' : (i === 7 ? 'failed' : 'success'),
      })
    }
    _seedActivities = result.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }
  return _seedActivities
}

export function ActivityFeed() {
  const { history } = useLinkStore()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Compute base activities from history + seed using useMemo
  const baseActivities = useMemo(() => {
    const fromHistory: ActivityItem[] = history.slice(0, 5).map((item) => ({
      id: `hist-${item.id}`,
      platform: item.platform.name,
      platformIcon: item.platform.icon,
      platformColor: item.platform.color,
      action: 'deep link generated',
      timestamp: new Date(item.createdAt),
      status: 'success' as const,
    }))

    const seed = getSeedActivities()
    return [...fromHistory, ...seed].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    )
  }, [history])

  // Live activities layer on top of base
  const [liveUpdates, setLiveUpdates] = useState<ActivityItem[]>([])

  // Auto-generate new activities every 15-30 seconds
  useEffect(() => {
    const generateActivity = () => {
      const sim = SIMULATED_ACTIONS[Math.floor(Math.random() * SIMULATED_ACTIONS.length)]
      const statusRoll = Math.random()
      const status: 'success' | 'failed' | 'pending' = statusRoll < 0.8 ? 'success' : statusRoll < 0.92 ? 'pending' : 'failed'

      const newActivity: ActivityItem = {
        id: `sim-${Date.now()}-${Math.random()}`,
        platform: sim.platform,
        platformIcon: sim.icon,
        platformColor: sim.color,
        action: sim.action,
        timestamp: new Date(),
        status,
      }

      setLiveUpdates((prev) => [newActivity, ...prev].slice(0, 30))
    }

    const firstDelay = 15000 + Math.random() * 5000
    const firstTimeout = setTimeout(() => {
      generateActivity()
      intervalRef.current = setInterval(() => {
        generateActivity()
      }, 15000 + Math.random() * 15000)
    }, firstDelay)

    return () => {
      clearTimeout(firstTimeout)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  // Merge live updates with base
  const activities = useMemo(() => {
    return [...liveUpdates, ...baseActivities].slice(0, 50)
  }, [liveUpdates, baseActivities])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass-card p-4 sm:p-5 space-y-3"
    >
      {/* Header with Live indicator */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Activity Feed</h3>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-medium text-emerald-400">Live</span>
        </div>
      </div>

      {/* Activity List */}
      <ScrollArea className="max-h-72">
        <div className="space-y-1">
          <AnimatePresence initial={false}>
            {activities.map((item) => {
              const statusCfg = STATUS_CONFIG[item.status]
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 10, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="group flex items-center gap-2.5 rounded-lg p-2 hover:bg-accent/30 transition-colors"
                >
                  {/* Platform Icon */}
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs"
                    style={{ backgroundColor: `${item.platformColor}20` }}
                  >
                    {item.platformIcon}
                  </div>

                  {/* Description */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground truncate">
                      <span className="font-medium">{item.platform}</span>{' '}
                      <span className="text-muted-foreground">{item.action}</span>
                    </p>
                  </div>

                  {/* Timestamp + Status */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant="outline"
                      className="text-[10px] h-5 px-1.5 gap-1 border-0"
                      style={{
                        backgroundColor: statusCfg.bgColor,
                        color: statusCfg.color,
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: statusCfg.color }}
                      />
                      {statusCfg.label}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground/60 w-12 text-right">
                      {formatRelativeTime(item.timestamp)}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="flex items-center justify-center pt-1">
        <span className="text-[10px] text-muted-foreground/40">
          Real-time activity updates
        </span>
      </div>
    </motion.div>
  )
}
