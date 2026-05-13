'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Link2, Zap, Calendar, Sparkles } from 'lucide-react'

const stats = [
  { label: 'Total Links', value: '12,847', numericValue: 12847, icon: Link2, color: 'text-emerald-400', bg: 'bg-emerald-500/15', glowColor: 'oklch(0.696 0.17 162.48)', gradient: 'from-emerald-500/8 to-transparent' },
  { label: 'Native Opens', value: '89%', numericValue: 89, icon: Zap, color: 'text-violet-400', bg: 'bg-violet-500/15', glowColor: 'oklch(0.488 0.243 264.376)', gradient: 'from-violet-500/8 to-transparent' },
  { label: 'Conversion Rate', value: '94.2%', numericValue: 94.2, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/15', glowColor: 'oklch(0.769 0.188 70.08)', gradient: 'from-amber-500/8 to-transparent' },
  { label: 'Active Users', value: '3,241', numericValue: 3241, icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/15', glowColor: 'oklch(0.65 0.2 200)', gradient: 'from-cyan-500/8 to-transparent' },
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

// Particle positions for subtle background effect
const particles = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  style: {
    left: `${10 + i * 12}%`,
    top: `${15 + (i % 3) * 25}%`,
    animationDelay: `${i * 1.2}s`,
    animationDuration: `${7 + i * 0.8}s`,
  },
}))

// Animated number counter hook
function useAnimatedNumber(end: number, duration: number = 1500) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const startTime = Date.now()
          const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * end * 10) / 10)
            if (progress < 1) {
              requestAnimationFrame(animate)
            } else {
              setCount(end)
            }
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration])

  return { count, ref }
}

// Individual stat card component (to satisfy hooks rules)
function StatCard({ stat, index }: { stat: typeof stats[0]; index: number }) {
  const Icon = stat.icon
  const { count, ref: counterRef } = useAnimatedNumber(stat.numericValue, 1800)
  const displayValue = stat.value.includes('%')
    ? (stat.numericValue < 100 ? `${Math.floor(count)}%` : stat.value)
    : Number.isInteger(stat.numericValue)
      ? Math.floor(count).toLocaleString()
      : stat.value

  return (
    <motion.div
      ref={counterRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass-card glass-card-hover stat-card-glow p-4 sm:p-5 animated-border-glow group relative overflow-hidden"
    >
      {/* Gradient background overlay per card */}
      <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} pointer-events-none`} />

      <div className="relative z-10">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-md ${stat.bg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
              <Icon className={`size-4 ${stat.color}`} />
            </div>
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
          {/* Live indicator with pulsing green dot on first card */}
          {index === 0 && (
            <span className="live-indicator">
              <span className="sr-only">Live data</span>
            </span>
          )}
        </div>
        <span className="text-2xl sm:text-3xl font-bold text-foreground animate-number-glow">
          {displayValue}
        </span>
        {/* Mini trend indicator */}
        <div className="flex items-center gap-1 mt-1.5">
          <motion.span
            className="animate-trend-bounce inline-flex"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 + index * 0.1 }}
          >
            <TrendingUp className="h-3 w-3 text-emerald-400" />
          </motion.span>
          <span className="text-[10px] text-emerald-400 font-medium">
            +{(8 + index * 3.2).toFixed(1)}%
          </span>
          <span className="text-[10px] text-muted-foreground/50">vs last week</span>
        </div>
      </div>
    </motion.div>
  )
}

// Individual bar chart bar with stagger animation and glow
function ChartBar({ bar, index, animated, hoveredBar, onHover, onLeave }: {
  bar: typeof barChartData[0]
  index: number
  animated: boolean
  hoveredBar: number | null
  onHover: () => void
  onLeave: () => void
}) {
  return (
    <div
      className="flex-1 flex flex-col items-center gap-2 relative"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Tooltip */}
      <motion.div
        initial={false}
        animate={{
          opacity: hoveredBar === index ? 1 : 0,
          y: hoveredBar === index ? 0 : 4,
          scale: hoveredBar === index ? 1 : 0.85,
        }}
        transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="bar-tooltip"
      >
        {bar.value} opens
      </motion.div>
      <div className="w-full relative" style={{ height: '120px' }}>
        <motion.div
          className={`absolute bottom-0 w-full rounded-t-lg ${bar.color} cursor-pointer chart-bar-glow`}
          initial={{ scaleY: 0 }}
          animate={{
            scaleY: animated ? 1 : 0,
            opacity: animated ? (hoveredBar === index ? 1 : 0.85) : 0.3,
          }}
          transition={{
            scaleY: { duration: 0.8, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
            opacity: { duration: 0.3 },
          }}
          style={{
            height: `${bar.value}%`,
            transformOrigin: 'bottom',
            borderRadius: '6px 6px 2px 2px',
            boxShadow: hoveredBar === index
              ? `0 0 16px oklch(0.696 0.17 162.48 / 30%), 0 -4px 12px oklch(0.696 0.17 162.48 / 15%), inset 0 1px 0 rgba(255,255,255,0.1)`
              : 'inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Glass shine on bar */}
          <div className="absolute inset-0 rounded-t-lg overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-white/8 to-transparent" />
            {hoveredBar === index && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/10"
              />
            )}
          </div>
        </motion.div>
      </div>
      <span className={`text-[10px] transition-colors duration-200 ${hoveredBar === index ? 'text-emerald-400 font-medium' : 'text-muted-foreground'}`}>
        {bar.label}
      </span>
    </div>
  )
}

export default function AnalyticsPreview() {
  const [animated, setAnimated] = useState(false)
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)
  const [scrollOffset, setScrollOffset] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300)
    return () => clearTimeout(timer)
  }, [])

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect()
        const progress = rect.top / window.innerHeight
        setScrollOffset(progress * 40)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const today = new Date()
  const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)
  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden" ref={sectionRef}>
      {/* Parallax particle effects */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{ transform: `translateY(${scrollOffset}px)` }}>
        {particles.map((p) => (
          <div key={p.id} className="particle-dot" style={p.style} />
        ))}
      </div>

      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-emerald-500/[0.02] to-background pointer-events-none" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20"
          >
            <Sparkles className="size-3.5 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">Real-time Insights</span>
          </motion.div>
          {/* Real-time badge with pulse */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
            className="realtime-badge flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="text-[9px] font-semibold text-emerald-400 uppercase tracking-wider">Real-time</span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            <span className="gradient-text">Enterprise Analytics</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Deep insights into your link performance with real-time analytics
          </p>
        </motion.div>

        {/* Stats cards with animated number counters, glass morphism, and Live indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8"
        >
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </motion.div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Bar chart with tooltips, shimmer and gradient bg */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card glass-card-hover p-5 sm:p-6 relative overflow-hidden"
          >
            {/* Gradient background for chart */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] via-transparent to-violet-500/[0.02] pointer-events-none" />

            <div className="relative z-10">
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

                {/* Bars with staggered grow animation */}
                <div className="relative flex items-end gap-2 sm:gap-3 h-40 pt-4">
                  {barChartData.map((bar, i) => (
                    <ChartBar
                      key={bar.label}
                      bar={bar}
                      index={i}
                      animated={animated}
                      hoveredBar={hoveredBar}
                      onHover={() => setHoveredBar(i)}
                      onLeave={() => setHoveredBar(null)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Platform distribution with Live indicator and gradient bg */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-card glass-card-hover p-5 sm:p-6 relative overflow-hidden"
          >
            {/* Gradient background for distribution */}
            <div className="absolute inset-0 bg-gradient-to-bl from-violet-500/[0.03] via-transparent to-amber-500/[0.02] pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-foreground">
                  Platform Distribution
                </h3>
                {/* Live indicator with pulsing green dot */}
                <span className="live-indicator">
                  <span className="sr-only">Live data</span>
                </span>
              </div>
              <div className="flex flex-col gap-4">
                {platformDistribution.map((platform, i) => (
                  <div key={platform.name} className="flex items-center gap-3 group">
                    <span className="text-base w-6 text-center flex-shrink-0">{platform.icon}</span>
                    <span className="text-xs text-muted-foreground w-20 truncate group-hover:text-foreground transition-colors">
                      {platform.name}
                    </span>
                    <div className="flex-1 h-5 rounded-full bg-accent/30 overflow-hidden">
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
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
