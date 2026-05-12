'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
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

      {/* Bar Chart */}
      <div className="flex items-end justify-between gap-2 h-32">
        {data.map((item, index) => {
          const heightPercent = (item.value / maxValue) * 100
          const minHeight = 4 // minimum height in percent

          return (
            <div key={item.day} className="flex flex-col items-center gap-1.5 flex-1">
              {/* Value Label */}
              <span className="text-[10px] text-muted-foreground/60">
                {item.value}
              </span>

              {/* Bar */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(heightPercent, minHeight)}%` }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.08,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="w-full max-w-[32px] rounded-t-md relative overflow-hidden"
                style={{
                  minHeight: `${minHeight}%`,
                }}
              >
                {/* Gradient bar */}
                <div className="absolute inset-0 rounded-t-md bg-gradient-to-t from-emerald-600/80 to-emerald-400/90" />

                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </motion.div>

              {/* Day Label */}
              <span className="text-[10px] text-muted-foreground">{item.day}</span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
