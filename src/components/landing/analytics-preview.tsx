'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Link2, Zap, Calendar } from 'lucide-react'

const stats = [
  { label: 'Total Links', value: '12,847', icon: Link2, color: 'text-emerald-400', bg: 'bg-emerald-500/15', glowColor: 'oklch(0.696 0.17 162.48)' },
  { label: 'Native Opens', value: '89%', icon: Zap, color: 'text-violet-400', bg: 'bg-violet-500/15', glowColor: 'oklch(0.488 0.243 264.376)' },
  { label: 'Conversion Rate', value: '94.2%', icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/15', glowColor: 'oklch(0.769 0.188 70.08)' },
  { label: 'Active Users', value: '3,241', icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/15', glowColor: 'oklch(0.65 0.2 200)' },
]

const barChartData = [
  { label: 'Mon', value: 65, color: 'bg-emerald-500' },
  { label: 'Tue', value: 80, color: 'bg-emerald-400' },
  { label: 'Wed', value: 45, color: 'bg-emerald-500' },
  { label: 'Thu', value: 90, color: 'bg-emerald-400' },
  { label: 'Fri', value: 70, color: 'bg-emerald-500' },
  { label: 'Sat', value: 55, color: 'bg-emerald-400' },
  { label: 'Sun', value: 85, color: 'bg-emerald-500' },
]

const platformDistribution = [
  { name: 'Instagram', value: 32, color: '#E4405F', icon: '📸' },
  { name: 'YouTube', value: 28, color: '#FF0000', icon: '▶️' },
  { name: 'Facebook', value: 18, color: '#1877F2', icon: '👤' },
  { name: 'TikTok', value: 12, color: '#ff0050', icon: '🎵' },
  { name: 'X (Twitter)', value: 10, color: '#888888', icon: '🐦' },
]

export default function AnalyticsPreview() {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300)
    return () => clearTimeout(timer)
  }, [])

  const today = new Date()
  const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)
  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            <span className="gradient-text">Enterprise Analytics</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Deep insights into your link performance with real-time analytics
          </p>
        </motion.div>

        {/* Stats cards with animated borders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8"
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card hover-lift p-4 sm:p-5 animated-border-glow group"
                style={{
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${stat.glowColor}20, 0 0 40px ${stat.glowColor}08`
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = ''
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-md ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`size-4 ${stat.color}`} />
                  </div>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <span className="text-2xl sm:text-3xl font-bold text-foreground">
                  {stat.value}
                </span>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Bar chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card p-5 sm:p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-foreground">
                Weekly Link Opens
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                <Calendar className="size-3" />
                <span>Last 14 days</span>
                <span className="text-muted-foreground/30 mx-1">•</span>
                <span>{formatDate(twoWeeksAgo)} – {formatDate(today)}</span>
              </div>
            </div>

            {/* Chart with grid lines */}
            <div className="relative">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" style={{ height: '140px', paddingBottom: '20px' }}>
                {[0, 25, 50, 75, 100].map((pct) => (
                  <div key={pct} className="flex items-center gap-2">
                    <span className="text-[9px] text-muted-foreground/20 w-6 text-right">{pct}%</span>
                    <div className="flex-1 h-px bg-border/15" />
                  </div>
                ))}
              </div>

              {/* Bars */}
              <div className="relative flex items-end gap-2 sm:gap-3 h-40 pt-4">
                {barChartData.map((bar, i) => (
                  <div key={bar.label} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full relative" style={{ height: '120px' }}>
                      <div
                        className={`absolute bottom-0 w-full rounded-t-lg ${bar.color} transition-all duration-1000 ease-out`}
                        style={{
                          height: animated ? `${bar.value}%` : '0%',
                          opacity: animated ? 1 : 0.3,
                          transitionDelay: `${i * 120}ms`,
                          borderRadius: '6px 6px 2px 2px',
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{bar.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Platform distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-card p-5 sm:p-6"
          >
            <h3 className="text-sm font-semibold text-foreground mb-5">
              Platform Distribution
            </h3>
            <div className="flex flex-col gap-4">
              {platformDistribution.map((platform, i) => (
                <div key={platform.name} className="flex items-center gap-3 group">
                  <span className="text-base w-6 text-center flex-shrink-0">{platform.icon}</span>
                  <span className="text-xs text-muted-foreground w-20 truncate group-hover:text-foreground transition-colors">
                    {platform.name}
                  </span>
                  <div className="flex-1 h-5 rounded-full bg-surface-3 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full relative"
                      style={{ backgroundColor: platform.color }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${animated ? platform.value : 0}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.5 + i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                      {/* Shimmer effect on bar */}
                      <div className="absolute inset-0 opacity-30" style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                        animation: 'shimmer 2.5s ease-in-out infinite',
                      }} />
                    </motion.div>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground w-10 text-right group-hover:text-foreground transition-colors">
                    {platform.value}%
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
