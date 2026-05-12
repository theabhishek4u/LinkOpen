'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Timer, AlertCircle, Calendar, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useLinkStore } from '@/store/link-store'

function CountdownDisplay({ expiryDate }: { expiryDate: string }) {
  const [timeLeft, setTimeLeft] = useState('')
  const [isExpired, setIsExpired] = useState(false)
  const [isUrgent, setIsUrgent] = useState(false)

  useEffect(() => {
    const calculate = () => {
      const now = new Date().getTime()
      const expiry = new Date(expiryDate).getTime()
      const diff = expiry - now

      if (diff <= 0) {
        setIsExpired(true)
        setIsUrgent(false)
        setTimeLeft('Expired')
        return
      }

      setIsExpired(false)
      setIsUrgent(diff < 3600000) // Less than 1 hour

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const secs = Math.floor((diff % (1000 * 60)) / 1000)

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${mins}m`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${mins}m ${secs}s`)
      } else if (mins > 0) {
        setTimeLeft(`${mins}m ${secs}s`)
      } else {
        setTimeLeft(`${secs}s`)
      }
    }

    calculate()
    const interval = setInterval(calculate, 1000)
    return () => clearInterval(interval)
  }, [expiryDate])

  const colorClass = isExpired
    ? 'text-red-400'
    : isUrgent
      ? 'text-amber-400'
      : 'text-muted-foreground'

  return <span className={`text-[10px] font-mono ${colorClass}`}>{timeLeft}</span>
}

export function LinkScheduler() {
  const { linkExpiry, setLinkExpiry, history, addNotification } = useLinkStore()
  const [enabled, setEnabled] = useState(!!linkExpiry)

  // Get links with expiry that haven't expired yet
  const expiringLinks = history.filter((item) => {
    if (!item.expiry) return false
    return new Date(item.expiry).getTime() > Date.now()
  })

  // Get expired links
  const expiredLinks = history.filter((item) => {
    if (!item.expiry) return false
    return new Date(item.expiry).getTime() <= Date.now()
  })

  const handleToggle = useCallback((checked: boolean) => {
    setEnabled(checked)
    if (!checked) {
      setLinkExpiry(null)
    } else {
      // Set default expiry to 24 hours from now
      const defaultExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)
      const formatted = defaultExpiry.toISOString().slice(0, 16)
      setLinkExpiry(formatted)
    }
  }, [setLinkExpiry])

  const handleExpiryChange = useCallback((value: string) => {
    if (value) {
      setLinkExpiry(value)
    }
  }, [setLinkExpiry])

  const handleClearExpiry = useCallback(() => {
    setLinkExpiry(null)
    setEnabled(false)
  }, [setLinkExpiry])

  // Format for datetime-local input
  const formattedExpiry = linkExpiry
    ? new Date(linkExpiry).toISOString().slice(0, 16)
    : ''

  const minDateTime = new Date().toISOString().slice(0, 16)

  return (
    <div className="glass-card p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Link Expiration</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">Set expiration</span>
          <Switch
            checked={enabled}
            onCheckedChange={handleToggle}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </div>

      {/* Expiry Date/Time Input */}
      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <Input
                type="datetime-local"
                value={formattedExpiry}
                onChange={(e) => handleExpiryChange(e.target.value)}
                min={minDateTime}
                className="h-8 text-xs bg-background/40 border-border/50 focus:border-primary/50"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearExpiry}
                className="h-8 px-2 shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
            {/* Quick presets */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] text-muted-foreground shrink-0">Quick:</span>
              {[
                { label: '1h', ms: 3600000 },
                { label: '6h', ms: 21600000 },
                { label: '24h', ms: 86400000 },
                { label: '7d', ms: 604800000 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    const newExpiry = new Date(Date.now() + preset.ms)
                    setLinkExpiry(newExpiry.toISOString().slice(0, 16))
                  }}
                  className="rounded-md px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expiring Soon */}
      {expiringLinks.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-amber-400" />
            <span className="text-[10px] text-amber-400 font-medium uppercase tracking-wider">
              Expiring Soon
            </span>
          </div>
          <div className="space-y-1">
            {expiringLinks.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded-md bg-amber-500/5 border border-amber-500/10 px-2.5 py-1.5"
              >
                <span className="text-sm">{item.platform.icon}</span>
                <p className="text-[11px] text-foreground truncate flex-1">
                  {item.originalUrl.length > 30 ? item.originalUrl.slice(0, 30) + '...' : item.originalUrl}
                </p>
                <CountdownDisplay expiryDate={item.expiry!} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expired Links */}
      {expiredLinks.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="h-3 w-3 text-red-400" />
            <span className="text-[10px] text-red-400 font-medium uppercase tracking-wider">
              Expired
            </span>
            <Badge variant="outline" className="h-4 text-[9px] border-red-500/30 text-red-400">
              {expiredLinks.length}
            </Badge>
          </div>
          <div className="space-y-1">
            {expiredLinks.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded-md bg-red-500/5 border border-red-500/10 px-2.5 py-1.5 opacity-60"
              >
                <span className="text-sm">{item.platform.icon}</span>
                <p className="text-[11px] text-foreground truncate flex-1 line-through">
                  {item.originalUrl.length > 30 ? item.originalUrl.slice(0, 30) + '...' : item.originalUrl}
                </p>
                <Badge variant="outline" className="h-4 text-[9px] border-red-500/30 text-red-400 shrink-0">
                  Expired
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!enabled && expiringLinks.length === 0 && expiredLinks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <Clock className="h-6 w-6 text-muted-foreground/15 mb-2" />
          <p className="text-[10px] text-muted-foreground/50">
            Enable expiration to auto-expire links after a set time
          </p>
        </div>
      )}
    </div>
  )
}
