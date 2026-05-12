'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLinkStore } from '@/store/link-store'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const DEFAULT_DATA = [
  { day: 'Mon', value: 24 },
  { day: 'Tue', value: 45 },
  { day: 'Wed', value: 32 },
  { day: 'Thu', value: 58 },
  { day: 'Fri', value: 41 },
  { day: 'Sat', value: 19 },
  { day: 'Sun', value: 35 },
]

export function MiniChart() {
  const { analytics } = useLinkStore()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const data = useMemo(() => {
    if (analytics.recentActivity && analytics.recentActivity.length > 0) {
      const chartData = analytics.recentActivity.slice(-7).map((item, i) => ({
        day: DAYS[i] || DAYS[0],
        value: item.opens,
      }))
      // Pad to 7 days if needed
      while (chartData.length < 7) {
        chartData.unshift({
          day: DAYS[6 - chartData.length],
          value: 0,
        })
      }
      return chartData
    }
    return DEFAULT_DATA
  }, [analytics.recentActivity])

  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const avgValue = Math.round(data.reduce((sum, d) => sum + d.value, 0) / data.length)
  const avgHeightPercent = (avgValue / maxValue) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card p-4 sm:p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Activity</h3>
        <span className="text-xs text-muted-foreground">Last 7 days</span>
      </div>

      {/* Bar Chart with dot grid background */}
      <div className="relative">
        {/* Dot grid background */}
        <div className="absolute inset-0 dot-grid rounded-lg opacity-60" />

        <div className="relative flex items-end justify-between gap-2 h-32">
          {/* Average line */}
          <div
            className="absolute left-0 right-0 border-t border-dashed border-emerald-500/30 z-10 pointer-events-none"
            style={{ bottom: `${Math.max(avgHeightPercent, 2)}%` }}
          >
            <span className="absolute -top-4 right-0 text-[10px] text-emerald-500/60 font-medium">
              Avg: {avgValue}
            </span>
          </div>

          {data.map((item, index) => {
            const heightPercent = (item.value / maxValue) * 100
            const minHeight = 4 // minimum height in percent
            const isHovered = hoveredIndex === index

            return (
              <div key={item.day} className="flex flex-col items-center gap-1.5 flex-1 relative">
                {/* Tooltip Label on Hover */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="absolute -top-8 left-1/2 -translate-x-1/2 z-20"
                    >
                      <div className="rounded-md bg-popover border border-border/50 px-2 py-1 shadow-lg">
                        <span className="text-[10px] font-medium text-foreground whitespace-nowrap">
                          {item.value} opens
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(heightPercent, minHeight)}%` }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.08,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="w-full max-w-[32px] rounded-t-md relative overflow-hidden cursor-pointer"
                  style={{
                    minHeight: `${minHeight}%`,
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Gradient bar: emerald-500 at bottom to emerald-300 at top */}
                  <div className="absolute inset-0 rounded-t-md bg-gradient-to-t from-emerald-500 to-emerald-300" />

                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  {/* Hover highlight */}
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-white/10 rounded-t-md"
                    />
                  )}
                </motion.div>

                {/* Day Label */}
                <span className="text-[10px] text-muted-foreground">{item.day}</span>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
