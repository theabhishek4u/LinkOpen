'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, CheckCheck, Trash2, Link2, Clock, HeartPulse,
  Trophy, X, ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useLinkStore, type LinkVerseNotification } from '@/store/link-store'

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

const notificationIcons: Record<string, typeof Link2> = {
  link_generated: Link2,
  link_expired: Clock,
  health_check: HeartPulse,
  milestone: Trophy,
}

const notificationColors: Record<string, string> = {
  link_generated: 'text-primary',
  link_expired: 'text-red-400',
  health_check: 'text-amber-400',
  milestone: 'text-violet-400',
}

const notificationBgColors: Record<string, string> = {
  link_generated: 'bg-primary/10',
  link_expired: 'bg-red-500/10',
  health_check: 'bg-amber-500/10',
  milestone: 'bg-violet-500/10',
}

function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: LinkVerseNotification
  onMarkRead: (id: string) => void
}) {
  const Icon = notificationIcons[notification.type] || Bell
  const colorClass = notificationColors[notification.type] || 'text-muted-foreground'
  const bgClass = notificationBgColors[notification.type] || 'bg-muted/50'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 30 }}
      className={`flex items-start gap-2.5 rounded-lg p-2.5 cursor-pointer transition-colors ${
        notification.read
          ? 'opacity-50 hover:opacity-70'
          : 'bg-accent/10 hover:bg-accent/20'
      }`}
      onClick={() => {
        if (!notification.read) onMarkRead(notification.id)
      }}
    >
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${bgClass}`}>
        <Icon className={`h-3.5 w-3.5 ${colorClass}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate">
          {notification.title}
        </p>
        <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">
          {notification.description}
        </p>
        <p className="text-[9px] text-muted-foreground/40 mt-1">
          {formatRelativeTime(notification.timestamp)}
        </p>
      </div>
      {!notification.read && (
        <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
      )}
    </motion.div>
  )
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const { notifications, markNotificationRead, markAllNotificationsRead, clearNotifications, unreadNotificationCount } = useLinkStore()

  const unreadCount = unreadNotificationCount()

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }, [notifications])

  const handleMarkAllRead = useCallback(() => {
    markAllNotificationsRead()
  }, [markAllNotificationsRead])

  const handleClearAll = useCallback(() => {
    clearNotifications()
  }, [clearNotifications])

  return (
    <div className="relative">
      {/* Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground px-1"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </motion.button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop to close */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96"
            >
              <div className="glass-card rounded-xl border border-border/30 overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Notifications</span>
                    {unreadCount > 0 && (
                      <Badge variant="outline" className="h-4 text-[9px] border-primary/30 text-primary">
                        {unreadCount}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkAllRead}
                        className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground gap-1"
                      >
                        <CheckCheck className="h-3 w-3" />
                        Mark all
                      </Button>
                    )}
                    {notifications.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearAll}
                        className="h-6 px-2 text-[10px] text-muted-foreground hover:text-destructive gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        Clear
                      </Button>
                    )}
                  </div>
                </div>

                {/* Notification List */}
                <ScrollArea className="max-h-80">
                  {sortedNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Bell className="h-8 w-8 text-muted-foreground/15 mb-2" />
                      <p className="text-xs text-muted-foreground">No notifications yet</p>
                      <p className="text-[10px] text-muted-foreground/50 mt-1">
                        Generate links, check health, and reach milestones!
                      </p>
                    </div>
                  ) : (
                    <div className="p-2 space-y-1">
                      <AnimatePresence>
                        {sortedNotifications.map((notification) => (
                          <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onMarkRead={markNotificationRead}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
