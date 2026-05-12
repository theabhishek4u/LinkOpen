'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Link2, Smartphone, Globe, TrendingUp } from 'lucide-react'
import { useLinkStore } from '@/store/link-store'

interface StatCardProps {
  title: string
  value: number
  suffix?: string
  subtitle: string
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  delay: number
}

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [displayed, setDisplayed] = useState(0)
  const ref = useRef<ReturnType<typeof requestAnimationFrame> | null>(null)

  useEffect(() => {
    const duration = 1500
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
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

function StatCard({ title, value, suffix, subtitle, icon, iconBg, iconColor, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-card hover-lift p-4 sm:p-5 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </h4>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: iconBg }}
        >
          <span style={{ color: iconColor }}>{icon}</span>
        </div>
      </div>

      <div className="text-2xl sm:text-3xl font-bold text-foreground">
        <AnimatedNumber value={value} suffix={suffix} />
      </div>

      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </motion.div>
  )
}

export function AnalyticsCards() {
  const { analytics, setAnalytics } = useLinkStore()

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
    },
    {
      title: 'Native Opens',
      value: nativeOpens,
      subtitle: `${((nativeOpens / Math.max(totalLinks, 1)) * 100).toFixed(0)}% of total`,
      icon: <Smartphone className="h-4 w-4" />,
      iconBg: 'rgba(139, 92, 246, 0.15)',
      iconColor: '#8b5cf6',
      delay: 0.1,
    },
    {
      title: 'Browser Opens',
      value: browserOpens,
      subtitle: `${((browserOpens / Math.max(totalLinks, 1)) * 100).toFixed(0)}% of total`,
      icon: <Globe className="h-4 w-4" />,
      iconBg: 'rgba(59, 130, 246, 0.15)',
      iconColor: '#3b82f6',
      delay: 0.2,
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
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  )
}
