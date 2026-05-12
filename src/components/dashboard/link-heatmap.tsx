'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Info } from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { useLinkStore } from '@/store/link-store'

// Day labels for Y-axis
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
// Hour labels for X-axis
const HOURS = Array.from({ length: 24 }, (_, i) => i)

interface HeatmapCell {
  day: number // 0-6
  hour: number // 0-23
  count: number
}

function generateHeatmapData(history: { createdAt: string }[]): HeatmapCell[] {
  const grid: Record<string, number> = {}

  // Initialize all cells to 0
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      grid[`${d}-${h}`] = 0
    }
  }

  // Fill from history
  for (const item of history) {
    const date = new Date(item.createdAt)
    const day = date.getDay() === 0 ? 6 : date.getDay() - 1 // Mon=0, Sun=6
    const hour = date.getHours()
    grid[`${day}-${hour}`] = (grid[`${day}-${hour}`] || 0) + 1
  }

  return Object.entries(grid).map(([key, count]) => {
    const [day, hour] = key.split('-').map(Number)
    return { day, hour, count }
  })
}

function getIntensityColor(count: number, max: number): string {
  if (count === 0) return 'bg-emerald-500/[0.03] border-emerald-500/[0.06]'
  const ratio = max > 0 ? count / max : 0
  if (ratio < 0.15) return 'bg-emerald-500/10 border-emerald-500/15'
  if (ratio < 0.3) return 'bg-emerald-500/20 border-emerald-500/25'
  if (ratio < 0.45) return 'bg-emerald-500/30 border-emerald-500/35'
  if (ratio < 0.6) return 'bg-emerald-500/40 border-emerald-500/45'
  if (ratio < 0.75) return 'bg-emerald-500/55 border-emerald-500/60'
  if (ratio < 0.9) return 'bg-emerald-500/70 border-emerald-500/75'
  return 'bg-emerald-500/85 border-emerald-500/90'
}

export function LinkHeatmap() {
  const { history } = useLinkStore()
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null)

  const heatmapData = useMemo(() => generateHeatmapData(history), [history])

  const maxCount = useMemo(() => {
    return Math.max(1, ...heatmapData.map((c) => c.count))
  }, [heatmapData])

  // Build lookup for fast rendering
  const dataLookup = useMemo(() => {
    const map = new Map<string, number>()
    for (const cell of heatmapData) {
      map.set(`${cell.day}-${cell.hour}`, cell.count)
    }
    return map
  }, [heatmapData])

  const totalActivity = useMemo(() => {
    return heatmapData.reduce((sum, c) => sum + c.count, 0)
  }, [heatmapData])

  const peakDayHour = useMemo(() => {
    let peak = heatmapData[0]
    for (const cell of heatmapData) {
      if (cell.count > (peak?.count || 0)) peak = cell
    }
    return peak
  }, [heatmapData])

  return (
    <div className="glass-card rounded-xl p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Activity Heatmap</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">
            {totalActivity} total activities
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors focus-visible-ring">
                <Info className="h-3 w-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs max-w-[200px]">
              Shows link creation and activity patterns by day of week and hour of day.
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto scrollbar-none">
        <div className="min-w-[480px]">
          {/* Hour labels */}
          <div className="flex items-center mb-1 pl-10">
            {HOURS.filter((_, i) => i % 3 === 0).map((hour) => (
              <div
                key={hour}
                className="flex-1 text-center text-[9px] text-muted-foreground/60 font-mono"
                style={{ minWidth: 0 }}
              >
                {hour.toString().padStart(2, '0')}
              </div>
            ))}
          </div>

          {/* Grid rows */}
          <div className="space-y-[2px]">
            {DAYS.map((day, dayIdx) => (
              <div key={day} className="flex items-center gap-1">
                <div className="w-9 text-[10px] text-muted-foreground/70 font-medium text-right pr-1 shrink-0">
                  {day}
                </div>
                <div className="flex gap-[2px] flex-1">
                  {HOURS.map((hour) => {
                    const count = dataLookup.get(`${dayIdx}-${hour}`) || 0
                    const cellKey = `${dayIdx}-${hour}`
                    return (
                      <Tooltip key={cellKey}>
                        <TooltipTrigger asChild>
                          <motion.div
                            whileHover={{ scale: 1.3, zIndex: 10 }}
                            className={`aspect-square rounded-[3px] border cursor-crosshair transition-colors duration-200 ${getIntensityColor(count, maxCount)}`}
                            onMouseEnter={() => setHoveredCell({ day: dayIdx, hour, count })}
                            onMouseLeave={() => setHoveredCell(null)}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <span className="font-medium">{DAYS[dayIdx]}</span>{' '}
                          {hour.toString().padStart(2, '0')}:00 —{' '}
                          <span className="text-primary font-semibold">{count}</span> activ{count === 1 ? 'y' : 'ies'}
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between pt-2 border-t border-border/20">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground/60">Less</span>
          <div className="flex gap-[2px]">
            {[0, 0.15, 0.3, 0.5, 0.7, 0.9].map((ratio, i) => (
              <div
                key={i}
                className={`h-3 w-3 rounded-[2px] border ${getIntensityColor(Math.round(ratio * maxCount), maxCount)}`}
              />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground/60">More</span>
        </div>
        <AnimatePresence mode="wait">
          {hoveredCell && hoveredCell.count > 0 && (
            <motion.div
              key={`${hoveredCell.day}-${hoveredCell.hour}`}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="text-[10px] text-muted-foreground"
            >
              {DAYS[hoveredCell.day]} {hoveredCell.hour.toString().padStart(2, '0')}:00 —{' '}
              <span className="text-primary font-semibold">{hoveredCell.count}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Peak info */}
      {peakDayHour && peakDayHour.count > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 border border-primary/10">
          <span className="text-[10px] text-muted-foreground">Peak activity:</span>
          <span className="text-xs font-medium text-primary">
            {DAYS[peakDayHour.day]} {peakDayHour.hour.toString().padStart(2, '0')}:00
          </span>
          <span className="text-[10px] text-muted-foreground">
            ({peakDayHour.count} activities)
          </span>
        </div>
      )}
    </div>
  )
}
