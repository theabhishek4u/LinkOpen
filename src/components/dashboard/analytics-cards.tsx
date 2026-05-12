'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link2, Smartphone, Globe, TrendingUp, TrendingDown, ArrowRight, BarChart3 } from 'lucide-react'
import { useLinkStore } from '@/store/link-store'
import { Button } from '@/components/ui/button'
import { LinkStatsModal } from './link-stats-modal'

interface StatCardProps {
  title: string
  value: number
  suffix?: string
  subtitle: string
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  delay: number
  trend?: 'up' | 'down'
  trendValue?: string
  sparkData?: number[]
  gradientFrom?: string
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [displayed, setDisplayed] = useState(0)
  const ref = useRef<ReturnType<typeof requestAnimationFrame> | null>(null)

  useEffect(() => {
    const duration = 1800
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutExpo(progress)
      const current = Math.floor(eased * value)
      setDisplayed(current)

      if (progress < 1) {
        ref.current = requestAnimationFrame(animate)
      }
    }

    ref.current = requestAnimationFrame(animate)

    return () => {
      if (ref.current) {
        cancelAnimationFrame(ref.current)
      }
    }
  }, [value])

  const formatted = displayed >= 1000
    ? displayed.toLocaleString()
    : displayed.toString()

  return (
    <span>
      {formatted}
      {suffix}
    </span>
  )
}

function Sparkline({ data, color, gradientFrom }: { data: number[]; color: string; gradientFrom?: string }) {
  if (!data || data.length < 2) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const width = 64
  const height = 24

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  // Create area fill path
  const areaPath = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * height
    return `${i === 0 ? 'M' : 'L'}${x},${y}`
  }).join(' ') + ` L${width},${height} L0,${height} Z`

  const gradientId = `spark-grad-${color.replace('#', '')}`

  return (
    <svg width={width} height={height} className="opacity-70">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={(data.length - 1) / (data.length - 1) * width}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r="2"
        fill={color}
      />
    </svg>
  )
}

function StatCard({ title, value, suffix, subtitle, icon, iconBg, iconColor, delay, trend, trendValue, sparkData, gradientFrom }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative group rounded-xl overflow-hidden gradient-card-bg"
    >
      {/* Animated gradient border */}
      <div className="absolute inset-0 rounded-xl premium-border pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="glass-card hover-lift p-4 sm:p-5 space-y-3 rounded-xl relative z-10">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </h4>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: iconBg }}
          >
            <span style={{ color: iconColor }}>{icon}</span>
          </div>
        </div>

        <div className="flex items-end justify-between gap-2">
          <div>
            <div className={`text-2xl sm:text-3xl font-bold text-foreground animate-number-glow`}>
              <AnimatedNumber value={value} suffix={suffix} />
            </div>
            {/* Trend indicator */}
            {trend && trendValue && (
              <div className="flex items-center gap-1 mt-1">
                {trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-400" />
                )}
                <span className={`text-xs font-semibold ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {trendValue}
                </span>
                <span className="text-[10px] text-muted-foreground/50 ml-0.5">vs last week</span>
              </div>
            )}
          </div>

          {/* Sparkline with gradient fill */}
          {sparkData && (
            <div className="flex-shrink-0">
              <Sparkline data={sparkData} color={iconColor} gradientFrom={gradientFrom} />
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </motion.div>
  )
}

export function AnalyticsCards() {
  const { analytics, setAnalytics } = useLinkStore()
  const [showStatsModal, setShowStatsModal] = useState(false)

  // Fetch analytics on mount
  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((json) => {
        const data = json.data || json
        if (data && typeof data.totalLinks === 'number') {
          setAnalytics(data)
        }
      })
      .catch(() => {
        // Use default mock data
      })
  }, [setAnalytics])

  // Use mock data if no real data
  const totalLinks = analytics.totalLinks || 1247
  const nativeOpens = analytics.nativeOpens || 892
  const browserOpens = analytics.browserOpens || 355
  const conversionRate = totalLinks > 0
    ? ((nativeOpens / (nativeOpens + browserOpens)) * 100).toFixed(1)
    : '94.2'

  const cards: StatCardProps[] = [
    {
      title: 'Total Links',
      value: totalLinks,
      subtitle: '+12% from last week',
      icon: <Link2 className="h-4 w-4" />,
      iconBg: 'rgba(16, 185, 129, 0.15)',
      iconColor: '#10b981',
      delay: 0,
      trend: 'up',
      trendValue: '+12.3%',
      sparkData: [8, 12, 10, 18, 14, 22, 20],
      gradientFrom: '#10b981',
    },
    {
      title: 'Native Opens',
      value: nativeOpens,
      subtitle: `${((nativeOpens / Math.max(totalLinks, 1)) * 100).toFixed(0)}% of total`,
      icon: <Smartphone className="h-4 w-4" />,
      iconBg: 'rgba(139, 92, 246, 0.15)',
      iconColor: '#8b5cf6',
      delay: 0.1,
      trend: 'up',
      trendValue: '+8.7%',
      sparkData: [15, 22, 18, 25, 20, 28, 24],
      gradientFrom: '#8b5cf6',
    },
    {
      title: 'Browser Opens',
      value: browserOpens,
      subtitle: `${((browserOpens / Math.max(totalLinks, 1)) * 100).toFixed(0)}% of total`,
      icon: <Globe className="h-4 w-4" />,
      iconBg: 'rgba(59, 130, 246, 0.15)',
      iconColor: '#3b82f6',
      delay: 0.2,
      trend: 'down',
      trendValue: '-3.2%',
      sparkData: [10, 8, 12, 7, 9, 6, 8],
      gradientFrom: '#3b82f6',
    },
    {
      title: 'Conversion Rate',
      value: parseFloat(conversionRate),
      suffix: '%',
      subtitle: 'Above industry avg',
      icon: <TrendingUp className="h-4 w-4" />,
      iconBg: 'rgba(245, 158, 11, 0.15)',
      iconColor: '#f59e0b',
      delay: 0.3,
      trend: 'up',
      trendValue: '+2.1%',
      sparkData: [88, 90, 91, 93, 92, 94, 94],
      gradientFrom: '#f59e0b',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* View Full Analytics Link */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowStatsModal(true)}
          className="text-xs text-muted-foreground hover:text-primary transition-colors group gap-1.5"
        >
          <BarChart3 className="h-3.5 w-3.5" />
          View Full Analytics
          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </div>

      {/* Full Stats Modal */}
      <LinkStatsModal open={showStatsModal} onOpenChange={setShowStatsModal} />
    </div>
  )
}
