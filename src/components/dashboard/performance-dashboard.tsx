'use client'

import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts'
import { RefreshCw, BarChart3, TrendingUp, Link2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLinkStore } from '@/store/link-store'

type DateRange = '7d' | '30d' | '90d'

interface PerformanceData {
  totalLinks: number
  totalOpens: number
  nativeOpens: number
  browserOpens: number
  conversionRate: number
  recentActivity: { date: string; opens: number }[]
  topPlatforms: { platform: string; count: number; color: string; percentage: number }[]
  topPerformingLinks: {
    id: string
    originalUrl: string
    platform: string
    openCount: number
    nativeOpenRate: number
  }[]
}

// Animated number counter
function useAnimatedNumber(target: number, duration = 1200) {
  const [current, setCurrent] = useState(0)
  const ref = useRef<ReturnType<typeof requestAnimationFrame> | null>(null)
  const prevTarget = useRef(target)

  useEffect(() => {
    if (prevTarget.current === target) return
    prevTarget.current = target

    const startTime = Date.now()
    const startVal = current

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(Math.round(startVal + (target - startVal) * eased))

      if (progress < 1) {
        ref.current = requestAnimationFrame(animate)
      }
    }

    ref.current = requestAnimationFrame(animate)
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current)
    }
  }, [target, duration, current])

  return current
}

// Circular gauge for performance score
function PerformanceGauge({ score }: { score: number }) {
  const animatedScore = useAnimatedNumber(score)
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference

  const getColor = (s: number) => {
    if (s >= 80) return '#10b981'
    if (s >= 60) return '#f59e0b'
    return '#ef4444'
  }
  const color = getColor(score)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
          {/* Progress arc */}
          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground" style={{ color }}>
            {animatedScore}
          </span>
          <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Score</span>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground text-center">
        {score >= 80 ? 'Excellent link health' : score >= 60 ? 'Good, room to improve' : 'Needs attention'}
      </p>
    </div>
  )
}

// Funnel step
function FunnelStep({ label, value, percentage, color, isLast }: {
  label: string
  value: number
  percentage: number
  color: string
  isLast?: boolean
}) {
  const animatedValue = useAnimatedNumber(value)

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="rounded-lg transition-all duration-500 flex items-center justify-center min-h-[36px]"
        style={{
          width: `${Math.max(percentage, 15)}%`,
          backgroundColor: `${color}20`,
          border: `1px solid ${color}30`,
        }}
      >
        <span className="text-xs font-bold" style={{ color }}>
          {animatedValue.toLocaleString()}
        </span>
      </div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
      {!isLast && (
        <div className="w-px h-3 bg-border/30" />
      )}
    </div>
  )
}

// Custom tooltip for recharts
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="glass-card p-2.5 rounded-lg border border-border/50 text-xs shadow-lg">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} className="font-medium" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

const RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
]

export function PerformanceDashboard() {
  const { analytics } = useLinkStore()
  const [range, setRange] = useState<DateRange>('30d')
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<PerformanceData | null>(null)

  const fetchData = useCallback(async (r: DateRange) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/analytics?range=${r}`)
      if (res.ok) {
        const json = await res.json()
        const d = json.data || json
        setData({
          totalLinks: d.totalLinks || 0,
          totalOpens: d.totalOpens || 0,
          nativeOpens: d.nativeOpens || 0,
          browserOpens: d.browserOpens || 0,
          conversionRate: d.conversionRate || 0,
          recentActivity: d.recentActivity || [],
          topPlatforms: d.topPlatforms || [],
          topPerformingLinks: d.topPerformingLinks || [],
        })
      }
    } catch {
      // Use fallback data
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(range)
  }, [range, fetchData])

  // Fallback data from store analytics
  const totalLinks = data?.totalLinks || analytics.totalLinks || 1247
  const totalOpens = data?.totalOpens || analytics.totalOpens || 1247
  const nativeOpens = data?.nativeOpens || analytics.nativeOpens || 892
  const browserOpens = data?.browserOpens || analytics.browserOpens || 355
  const conversionRate = data?.conversionRate || (nativeOpens > 0 ? Math.round((nativeOpens / (nativeOpens + browserOpens)) * 10000) / 100 : 71.5)

  // Performance score: based on conversion rate and total usage
  const performanceScore = useMemo(() => {
    let score = Math.min(conversionRate, 100)
    // Boost for high volume
    if (totalLinks > 100) score = Math.min(score + 5, 100)
    if (totalLinks > 500) score = Math.min(score + 5, 100)
    // Penalty for low volume
    if (totalLinks < 10) score = Math.max(score - 10, 0)
    return Math.round(score)
  }, [conversionRate, totalLinks])

  // Line chart data: performance over time
  const lineChartData = useMemo(() => {
    if (data?.recentActivity && data.recentActivity.length > 0) {
      return data.recentActivity.map((item) => ({
        date: item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
        opens: item.opens,
      }))
    }
    if (analytics.recentActivity && analytics.recentActivity.length > 0) {
      return analytics.recentActivity.map((item) => ({
        date: item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
        opens: item.opens,
      }))
    }
    // Fallback mock data
    const days = range === '7d' ? 7 : range === '90d' ? 90 : 30
    return Array.from({ length: days }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (days - 1 - i))
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        opens: Math.floor(Math.random() * 50) + 15 + Math.floor(i * 0.8),
      }
    })
  }, [data, analytics, range])

  // Platform distribution for horizontal bar chart
  const platformBarData = useMemo(() => {
    if (data?.topPlatforms && data.topPlatforms.length > 0) {
      return data.topPlatforms.slice(0, 8).map((p) => ({
        platform: p.platform.charAt(0).toUpperCase() + p.platform.slice(1),
        count: p.count,
        color: p.color,
        percentage: p.percentage,
      }))
    }
    if (analytics.topPlatforms && analytics.topPlatforms.length > 0) {
      return analytics.topPlatforms.slice(0, 8).map((p) => ({
        platform: p.platform.charAt(0).toUpperCase() + p.platform.slice(1),
        count: p.count,
        color: p.color,
        percentage: 0,
      }))
    }
    return [
      { platform: 'Instagram', count: 342, color: '#E4405F', percentage: 27.4 },
      { platform: 'YouTube', count: 278, color: '#FF0000', percentage: 22.3 },
      { platform: 'Facebook', count: 156, color: '#1877F2', percentage: 12.5 },
      { platform: 'TikTok', count: 134, color: '#000000', percentage: 10.7 },
      { platform: 'Telegram', count: 98, color: '#26A5E4', percentage: 7.9 },
      { platform: 'WhatsApp', count: 87, color: '#25D366', percentage: 7.0 },
    ]
  }, [data, analytics])

  // Top performing links table
  const topLinks = useMemo(() => {
    if (data?.topPerformingLinks && data.topPerformingLinks.length > 0) {
      return data.topPerformingLinks.slice(0, 5)
    }
    return [
      { id: '1', originalUrl: 'https://instagram.com/p/abc123', platform: 'instagram', openCount: 87, nativeOpenRate: 94.2 },
      { id: '2', originalUrl: 'https://youtube.com/watch?v=xyz', platform: 'youtube', openCount: 65, nativeOpenRate: 89.1 },
      { id: '3', originalUrl: 'https://t.me/channel/42', platform: 'telegram', openCount: 52, nativeOpenRate: 96.3 },
      { id: '4', originalUrl: 'https://twitter.com/user/status/1', platform: 'x', openCount: 41, nativeOpenRate: 78.5 },
      { id: '5', originalUrl: 'https://linkedin.com/posts/prof', platform: 'linkedin', openCount: 33, nativeOpenRate: 72.1 },
    ]
  }, [data])

  // Funnel percentages
  const funnelTotal = Math.max(totalLinks, 1)
  const nativePercent = (nativeOpens / funnelTotal) * 100
  const browserPercent = (browserOpens / funnelTotal) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-4 sm:p-6 space-y-5"
    >
      {/* Header with range selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Link Performance</h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Date range pills */}
          <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-0.5">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRange(opt.value)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                  range === opt.value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {/* Refresh button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => fetchData(range)}
            disabled={isLoading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Top row: Performance Score + Funnel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Performance Score Gauge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card rounded-xl p-4 flex flex-col items-center justify-center border border-border/20"
        >
          <h4 className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-medium mb-3">
            Performance Score
          </h4>
          <PerformanceGauge score={performanceScore} />
        </motion.div>

        {/* Conversion Funnel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="glass-card rounded-xl p-4 border border-border/20"
        >
          <h4 className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-medium mb-4 text-center">
            Conversion Funnel
          </h4>
          <div className="flex flex-col items-center gap-2">
            <FunnelStep
              label="Total Links"
              value={totalLinks}
              percentage={100}
              color="#10b981"
            />
            <FunnelStep
              label="Native Opens"
              value={nativeOpens}
              percentage={nativePercent}
              color="#8b5cf6"
            />
            <FunnelStep
              label="Browser Opens"
              value={browserOpens}
              percentage={browserPercent}
              color="#3b82f6"
              isLast
            />
          </div>
          <div className="mt-3 text-center">
            <span className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline text-emerald-400 mr-1" />
              {conversionRate}% conversion rate
            </span>
          </div>
        </motion.div>
      </div>

      {/* Line Chart: Performance Over Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-card rounded-xl p-4 border border-border/20"
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-foreground">Opens Over Time</h4>
          <span className="text-[10px] text-muted-foreground">{range === '7d' ? 'Last 7 days' : range === '90d' ? 'Last 90 days' : 'Last 30 days'}</span>
        </div>
        <div className="h-48 sm:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.08)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: '#888' }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(128,128,128,0.1)' }}
                interval={range === '7d' ? 0 : range === '90d' ? 12 : 5}
              />
              <YAxis
                tick={{ fontSize: 9, fill: '#888' }}
                tickLine={false}
                axisLine={false}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="opens"
                name="Opens"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Bottom row: Platform Distribution + Top Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Platform Distribution - Horizontal Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="glass-card rounded-xl p-4 border border-border/20"
        >
          <h4 className="text-xs font-semibold text-foreground mb-3">Platform Distribution</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformBarData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.08)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 9, fill: '#888' }} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="platform"
                  tick={{ fontSize: 9, fill: '#888' }}
                  tickLine={false}
                  axisLine={false}
                  width={70}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  name="Links"
                  radius={[0, 4, 4, 0]}
                  animationDuration={1200}
                  animationEasing="ease-out"
                >
                  {platformBarData.map((entry, index) => (
                    <rect key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Performing Links Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass-card rounded-xl p-4 border border-border/20"
        >
          <h4 className="text-xs font-semibold text-foreground mb-3">Top Performing Links</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {topLinks.map((link, index) => (
              <div
                key={link.id}
                className="flex items-center gap-2 rounded-lg p-2 hover:bg-accent/30 transition-colors"
              >
                <span className="text-[10px] font-bold text-muted-foreground/50 w-4 shrink-0">
                  {index + 1}
                </span>
                <Link2 className="h-3 w-3 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-foreground truncate">{link.originalUrl}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] text-muted-foreground/50 uppercase">{link.platform}</span>
                    <span className="text-[9px] text-emerald-400 font-medium">{link.nativeOpenRate}% native</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs font-bold text-foreground">{link.openCount}</span>
                  <span className="text-[9px] text-muted-foreground/50">opens</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
