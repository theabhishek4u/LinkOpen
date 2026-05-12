'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Gauge, ArrowUpRight, AlertTriangle, Clock, TrendingUp } from 'lucide-react'
import { useLinkStore } from '@/store/link-store'

interface PlanInfo {
  name: string
  links: number
  apiCalls: number
  storage: number // MB
  color: string
}

const PLANS: PlanInfo[] = [
  { name: 'Free', links: 50, apiCalls: 100, storage: 5, color: 'text-muted-foreground' },
  { name: 'Pro', links: 1000, apiCalls: 5000, storage: 100, color: 'text-primary' },
  { name: 'Enterprise', links: -1, apiCalls: -1, storage: -1, color: 'text-violet-400' },
]

interface QuotaData {
  linksUsed: number
  apiCallsUsed: number
  storageUsed: number // MB
  plan: string
  resetDate: string
  dailyTrend: number[] // last 7 days
}

function loadQuota(): QuotaData {
  if (typeof window === 'undefined') {
    return { linksUsed: 0, apiCallsUsed: 0, storageUsed: 0, plan: 'Free', resetDate: '', dailyTrend: [] }
  }
  try {
    const stored = localStorage.getItem('linkverse-quota')
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return { linksUsed: 0, apiCallsUsed: 0, storageUsed: 0, plan: 'Free', resetDate: '', dailyTrend: [] }
}

function saveQuota(data: QuotaData) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('linkverse-quota', JSON.stringify(data))
  } catch { /* ignore */ }
}

function CircularProgress({
  value,
  max,
  size = 60,
  strokeWidth = 5,
  color,
  warningLevel = 0.8,
  dangerLevel = 0.95,
}: {
  value: number
  max: number
  size?: number
  strokeWidth?: number
  color: string
  warningLevel?: number
  dangerLevel?: number
}) {
  const isUnlimited = max === -1
  const ratio = isUnlimited ? 0.2 : Math.min(value / max, 1)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - ratio * circumference
  const isWarning = !isUnlimited && ratio >= warningLevel
  const isDanger = !isUnlimited && ratio >= dangerLevel
  const strokeColor = isDanger ? '#ef4444' : isWarning ? '#f59e0b' : color

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-border/20"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold text-foreground">
          {isUnlimited ? '∞' : `${Math.round(ratio * 100)}%`}
        </span>
      </div>
    </div>
  )
}

export function UsageQuota() {
  const { history } = useLinkStore()

  // Calculate real usage from store + localStorage
  const quota = useMemo(() => {
    const saved = loadQuota()
    const linksUsed = history.length
    const apiCallsUsed = saved.apiCallsUsed || linksUsed * 3 // approximate
    const storageUsed = Math.max(saved.storageUsed || 0, linksUsed * 0.02) // ~20KB per link

    // Calculate reset date (1st of next month)
    const now = new Date()
    const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    // Generate daily trend from history
    const dailyCounts: number[] = []
    for (let i = 6; i >= 0; i--) {
      const day = new Date()
      day.setDate(day.getDate() - i)
      const dayStr = day.toISOString().split('T')[0]
      const count = history.filter((item) => item.createdAt.startsWith(dayStr)).length
      dailyCounts.push(count)
    }

    const result = {
      linksUsed,
      apiCallsUsed,
      storageUsed: Math.round(storageUsed * 100) / 100,
      plan: saved.plan || 'Free',
      resetDate: resetDate.toISOString(),
      dailyTrend: dailyCounts,
    }

    // Persist to localStorage
    saveQuota(result)
    return result
  }, [history])

  const currentPlan = useMemo(() => {
    return PLANS.find((p) => p.name === quota.plan) || PLANS[0]
  }, [quota.plan])

  const nextPlan = useMemo(() => {
    const currentIdx = PLANS.findIndex((p) => p.name === quota.plan)
    return currentIdx < PLANS.length - 1 ? PLANS[currentIdx + 1] : null
  }, [quota.plan])

  const quotas = useMemo(() => [
    {
      label: 'Links Created',
      used: quota.linksUsed,
      limit: currentPlan.links,
      unit: '',
      color: '#10b981',
    },
    {
      label: 'API Calls',
      used: quota.apiCallsUsed,
      limit: currentPlan.apiCalls,
      unit: '',
      color: '#8b5cf6',
    },
    {
      label: 'Storage',
      used: quota.storageUsed,
      limit: currentPlan.storage,
      unit: ' MB',
      color: '#f59e0b',
    },
  ], [quota, currentPlan])

  const daysUntilReset = useMemo(() => {
    if (!quota.resetDate) return 0
    const reset = new Date(quota.resetDate)
    const now = new Date()
    return Math.max(0, Math.ceil((reset.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
  }, [quota.resetDate])

  const trendMax = useMemo(() => {
    return Math.max(1, ...quota.dailyTrend)
  }, [quota.dailyTrend])

  return (
    <div className="glass-card rounded-xl p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Usage & Limits</h3>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
          quota.plan === 'Enterprise' ? 'bg-violet-500/15 text-violet-400' :
          quota.plan === 'Pro' ? 'bg-primary/15 text-primary' :
          'bg-muted/30 text-muted-foreground'
        }`}>
          {quota.plan} Plan
        </span>
      </div>

      {/* Circular Progress Indicators */}
      <div className="grid grid-cols-3 gap-3">
        {quotas.map((q) => {
          const ratio = q.limit === -1 ? 0 : q.used / q.limit
          const isWarning = q.limit !== -1 && ratio >= 0.8
          const isDanger = q.limit !== -1 && ratio >= 0.95

          return (
            <div key={q.label} className="flex flex-col items-center gap-2">
              <CircularProgress
                value={q.used}
                max={q.limit === -1 ? 1 : q.limit}
                size={56}
                strokeWidth={4}
                color={q.color}
              />
              <div className="text-center">
                <p className="text-xs font-medium text-foreground">{q.label}</p>
                <p className={`text-[10px] font-mono ${
                  isDanger ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-muted-foreground'
                }`}>
                  {q.used}{q.unit} / {q.limit === -1 ? '∞' : q.limit + q.unit}
                </p>
              </div>
              {/* Warning indicator */}
              {isWarning && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="flex items-center gap-1"
                >
                  <AlertTriangle className={`h-2.5 w-2.5 ${isDanger ? 'text-red-400' : 'text-amber-400'}`} />
                  <span className={`text-[8px] font-medium ${isDanger ? 'text-red-400' : 'text-amber-400'}`}>
                    {isDanger ? 'Almost full!' : 'Getting close'}
                  </span>
                </motion.div>
              )}
            </div>
          )
        })}
      </div>

      {/* Daily Trend Mini Chart */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-medium">7-Day Trend</span>
          <div className="flex items-center gap-1 text-primary">
            <TrendingUp className="h-3 w-3" />
          </div>
        </div>
        <div className="flex items-end gap-1 h-10">
          {quota.dailyTrend.map((count, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-t-sm bg-primary/30 hover:bg-primary/50 transition-colors"
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(count > 0 ? 15 : 4, (count / trendMax) * 100)}%` }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            />
          ))}
        </div>
        <div className="flex gap-1">
          {quota.dailyTrend.map((_, i) => {
            const d = new Date()
            d.setDate(d.getDate() - (6 - i))
            return (
              <div key={i} className="flex-1 text-center text-[7px] text-muted-foreground/40 font-mono">
                {d.toLocaleDateString('en', { weekday: 'short' }).slice(0, 2)}
              </div>
            )
          })}
        </div>
      </div>

      {/* Reset Timer */}
      <div className="flex items-center justify-between rounded-lg bg-background/30 p-2.5 border border-border/20">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3 text-muted-foreground/60" />
          <span className="text-[10px] text-muted-foreground">Quota resets in</span>
        </div>
        <span className="text-[11px] font-mono font-semibold text-foreground">
          {daysUntilReset}d {new Date().getHours()}h
        </span>
      </div>

      {/* Upgrade CTA */}
      {nextPlan && (
        <button className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 text-[11px] font-medium text-primary hover:bg-primary/20 transition-colors focus-visible-ring">
          <ArrowUpRight className="h-3 w-3" />
          Upgrade to {nextPlan.name}
          <span className="text-primary/50 ml-1">
            ({nextPlan.links === -1 ? '∞' : nextPlan.links} links, {nextPlan.apiCalls === -1 ? '∞' : nextPlan.apiCalls} API calls)
          </span>
        </button>
      )}
    </div>
  )
}
