'use client'

import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, TrendingUp, Smartphone, Globe, Loader2, Calendar, X, Check } from 'lucide-react'
import { useLinkStore } from '@/store/link-store'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

type DateRange = '7d' | '30d' | '90d' | 'custom'

interface AnalyticsData {
  totalLinks: number
  nativeOpens: number
  browserOpens: number
  topPlatforms: { platform: string; count: number; percentage: number; color: string }[]
  recentActivity: { date: string; opens: number }[]
  conversionRate?: number
  range?: string
  from?: string
  to?: string
}

// ─── Helpers ────────────────────────────────────────────────────────

function generateMockData(range: DateRange, from?: string, to?: string): AnalyticsData {
  let days: number
  if (range === 'custom' && from && to) {
    const fromDate = new Date(from)
    const toDate = new Date(to)
    days = Math.max(1, Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1)
  } else {
    days = range === '7d' ? 7 : range === '30d' ? 30 : 90
  }
  const now = new Date()
  const startDate = range === 'custom' && from ? new Date(from) : now
  const recentActivity = Array.from({ length: days }, (_, i) => {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    return {
      date: date.toISOString().split('T')[0],
      opens: Math.floor(Math.random() * 50) + 10 + Math.floor(i * 0.5),
    }
  })
  return {
    totalLinks: 1247,
    nativeOpens: 892,
    browserOpens: 355,
    conversionRate: 71.5,
    topPlatforms: [
      { platform: 'instagram', count: 342, percentage: 27.4, color: '#E4405F' },
      { platform: 'youtube', count: 278, percentage: 22.3, color: '#FF0000' },
      { platform: 'facebook', count: 156, percentage: 12.5, color: '#1877F2' },
      { platform: 'tiktok', count: 134, percentage: 10.7, color: '#69C9D0' },
      { platform: 'telegram', count: 98, percentage: 7.9, color: '#26A5E4' },
      { platform: 'whatsapp', count: 87, percentage: 7.0, color: '#25D366' },
      { platform: 'x', count: 72, percentage: 5.8, color: '#1DA1F2' },
      { platform: 'linkedin', count: 54, percentage: 4.3, color: '#0A66C2' },
    ],
    recentActivity,
  }
}

// ─── Responsive Line Chart (SVG) ───────────────────────────────────

function LineChart({ data }: { data: { date: string; opens: number }[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 600, height: 200 })
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; data: { date: string; opens: number } } | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width
        setDimensions({ width: Math.max(w, 200), height: 200 })
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const { width, height } = dimensions
  const padding = { top: 10, right: 10, bottom: 28, left: 40 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const maxVal = Math.max(...data.map(d => d.opens), 1)
  const minVal = 0

  const points = data.map((d, i) => ({
    x: padding.left + (i / Math.max(data.length - 1, 1)) * chartW,
    y: padding.top + chartH - ((d.opens - minVal) / (maxVal - minVal || 1)) * chartH,
  }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = linePath + ` L${points[points.length - 1].x},${padding.top + chartH} L${points[0].x},${padding.top + chartH} Z`

  // Calculate approximate path length for line-draw animation
  const pathLength = useMemo(() => {
    let len = 0
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x
      const dy = points[i].y - points[i - 1].y
      len += Math.sqrt(dx * dx + dy * dy)
    }
    return len
  }, [points])

  // Handle mouse move for cursor-following tooltip
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    setMousePos({ x: mx, y: my })

    // Find nearest data point
    let nearestIdx = 0
    let nearestDist = Infinity
    for (let i = 0; i < points.length; i++) {
      const dist = Math.abs(points[i].x - mx)
      if (dist < nearestDist) {
        nearestDist = dist
        nearestIdx = i
      }
    }

    if (nearestDist < 30) {
      setHoveredPoint({ x: points[nearestIdx].x, y: points[nearestIdx].y, data: data[nearestIdx] })
    } else {
      setHoveredPoint(null)
    }
  }, [points, data])

  const handleMouseLeave = useCallback(() => {
    setHoveredPoint(null)
  }, [])

  const yTicks = 4
  const yTickVals = Array.from({ length: yTicks + 1 }, (_, i) => Math.round(minVal + ((maxVal - minVal) / yTicks) * i))
  const xLabelInterval = data.length <= 7 ? 1 : data.length <= 30 ? 5 : 10

  return (
    <div ref={containerRef} className="w-full relative">
      <svg ref={svgRef} width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        <defs>
          <linearGradient id="lineAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="lineStrokeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yTickVals.map((val) => {
          const y = padding.top + chartH - ((val - minVal) / (maxVal - minVal || 1)) * chartH
          return (
            <line key={val} x1={padding.left} y1={y} x2={padding.left + chartW} y2={y} stroke="currentColor" strokeOpacity="0.06" strokeDasharray="3 3" />
          )
        })}

        {/* Area fill */}
        <motion.path
          d={areaPath}
          fill="url(#lineAreaGrad)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />

        {/* Line with animated drawing effect */}
        <motion.path
          d={linePath}
          fill="none"
          stroke="url(#lineStrokeGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="line-draw-animation"
          style={{ '--line-length': pathLength } as React.CSSProperties}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />

        {/* Data points - only show if not too many */}
        {data.length <= 30 && points.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={data.length <= 7 ? 4 : 3}
            fill="#10b981"
            className="stroke-background"
            strokeWidth="2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 + i * 0.02 }}
          />
        ))}

        {/* Pulsing dot at latest data point */}
        {points.length > 0 && (
          <>
            <motion.circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r={6}
              fill="#10b981"
              fillOpacity={0.15}
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            />
            <motion.circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r={4}
              fill="#10b981"
              stroke="#fff"
              strokeWidth={2}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.5, type: 'spring', stiffness: 400 }}
            />
          </>
        )}

        {/* Hovered point highlight */}
        {hoveredPoint && (
          <>
            <line
              x1={hoveredPoint.x}
              y1={padding.top}
              x2={hoveredPoint.x}
              y2={padding.top + chartH}
              stroke="#10b981"
              strokeOpacity={0.2}
              strokeDasharray="3 3"
            />
            <circle
              cx={hoveredPoint.x}
              cy={hoveredPoint.y}
              r={6}
              fill="#10b981"
              fillOpacity={0.3}
              stroke="#10b981"
              strokeWidth={2}
            />
          </>
        )}

        {/* Y-axis labels */}
        {yTickVals.map((val) => {
          const y = padding.top + chartH - ((val - minVal) / (maxVal - minVal || 1)) * chartH
          return (
            <text key={val} x={padding.left - 8} y={y + 3} textAnchor="end" style={{ fill: 'var(--muted-foreground)', fontSize: '9px' }}>
              {val}
            </text>
          )
        })}

        {/* X-axis labels */}
        {data.map((d, i) => {
          if (i % xLabelInterval !== 0 && i !== data.length - 1) return null
          const x = padding.left + (i / Math.max(data.length - 1, 1)) * chartW
          const label = new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          return (
            <text key={i} x={x} y={height - 4} textAnchor="middle" style={{ fill: 'var(--muted-foreground)', fontSize: '8px' }}>
              {label}
            </text>
          )
        })}
      </svg>

      {/* Cursor-following tooltip */}
      <AnimatePresence>
        {hoveredPoint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute pointer-events-none z-10"
            style={{
              left: Math.min(mousePos.x + 12, dimensions.width - 120),
              top: mousePos.y - 50,
            }}
          >
            <div className="glass-card rounded-lg px-2.5 py-1.5 shadow-lg border border-primary/20">
              <p className="text-[9px] text-muted-foreground">
                {new Date(hoveredPoint.data.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
              <p className="text-xs font-semibold text-primary">{hoveredPoint.data.opens} opens</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Bar Chart (SVG - Platform Distribution) ───────────────────────

function PlatformBarChart({ platforms }: { platforms: { platform: string; count: number; percentage: number; color: string }[] }) {
  const barHeight = 22
  const gap = 8
  const labelWidth = 70
  const barMaxWidth = 180
  const valueWidth = 80
  const totalWidth = labelWidth + barMaxWidth + valueWidth
  const totalHeight = platforms.length * (barHeight + gap) + 10

  const maxCount = Math.max(...platforms.map(p => p.count), 1)

  return (
    <svg width="100%" height={totalHeight} viewBox={`0 0 ${totalWidth} ${totalHeight}`} preserveAspectRatio="xMinYMin meet">
      {platforms.map((p, i) => {
        const y = i * (barHeight + gap) + 5
        const barW = (p.count / maxCount) * barMaxWidth
        return (
          <g key={p.platform}>
            {/* Label */}
            <text x={0} y={y + barHeight / 2 + 4} style={{ fill: 'var(--muted-foreground)', fontSize: '10px' }} className="capitalize">
              {p.platform}
            </text>
            {/* Bar background */}
            <rect x={labelWidth} y={y} width={barMaxWidth} height={barHeight} rx={4} fill="currentColor" fillOpacity="0.04" />
            {/* Bar fill */}
            <motion.rect
              x={labelWidth}
              y={y}
              width={0}
              height={barHeight}
              rx={4}
              fill={p.color}
              fillOpacity="0.8"
              animate={{ width: barW }}
              transition={{ duration: 0.8, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] as const }}
            />
            {/* Count label */}
            <motion.text
              x={labelWidth + barMaxWidth + 8}
              y={y + barHeight / 2 + 4}
              style={{ fill: 'var(--foreground)', fontSize: '10px', fontWeight: 500 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + i * 0.06 }}
            >
              {p.count} ({p.percentage}%)
            </motion.text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Donut Chart (SVG - Native vs Browser) ─────────────────────────

function DonutChart({ nativeOpens, browserOpens }: { nativeOpens: number; browserOpens: number }) {
  const total = nativeOpens + browserOpens || 1
  const nativePct = nativeOpens / total

  const radius = 55
  const stroke = 16
  const circumference = 2 * Math.PI * radius
  const nativeArc = nativePct * circumference
  const browserArc = (1 - nativePct) * circumference

  return (
    <div className="flex items-center gap-6 flex-wrap justify-center">
      <div className="relative w-[140px] h-[140px]">
        <svg width={140} height={140} viewBox="0 0 140 140">
          {/* Background circle */}
          <circle cx="70" cy="70" r={radius} fill="none" stroke="currentColor" strokeOpacity="0.06" strokeWidth={stroke} />
          {/* Browser arc */}
          <motion.circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="#8b5cf6"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${browserArc} ${circumference - browserArc}`}
            strokeDashoffset={-nativeArc}
            transform="rotate(-90 70 70)"
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${browserArc} ${circumference - browserArc}` }}
            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          />
          {/* Native arc */}
          <motion.circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="#10b981"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${nativeArc} ${circumference - nativeArc}`}
            strokeDashoffset={0}
            transform="rotate(-90 70 70)"
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${nativeArc} ${circumference - nativeArc}` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-foreground">{Math.round(nativePct * 100)}%</span>
          <span className="text-[8px] text-muted-foreground">Native</span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <div>
            <p className="text-xs font-medium text-foreground">Native Opens</p>
            <p className="text-[10px] text-muted-foreground">{nativeOpens.toLocaleString()} ({Math.round(nativePct * 100)}%)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-violet-500" />
          <div>
            <p className="text-xs font-medium text-foreground">Browser Opens</p>
            <p className="text-[10px] text-muted-foreground">{browserOpens.toLocaleString()} ({Math.round((1 - nativePct) * 100)}%)</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────

export function AnalyticsChart() {
  const { analytics, setAnalytics } = useLinkStore()
  const [range, setRange] = useState<DateRange>('7d')
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [customFrom, setCustomFrom] = useState<string>('')
  const [customTo, setCustomTo] = useState<string>('')
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  // Get today's date in YYYY-MM-DD for max date constraint
  const today = new Date().toISOString().split('T')[0]

  const fetchAnalytics = useCallback(async (r: DateRange, from?: string, to?: string) => {
    setIsLoading(true)
    try {
      let url = `/api/analytics?range=${r}`
      if (r === 'custom' && from && to) {
        url += `&from=${from}&to=${to}`
      }
      const res = await fetch(url)
      const json = await res.json()
      const fetched = json.data || json
      if (fetched && typeof fetched.totalLinks === 'number') {
        setData(fetched as AnalyticsData)
        setAnalytics(fetched)
      } else {
        setData(generateMockData(r, from, to))
      }
    } catch {
      setData(generateMockData(r, from, to))
    } finally {
      setIsLoading(false)
    }
  }, [setAnalytics])

  useEffect(() => {
    if (range === 'custom') return // Don't auto-fetch for custom range
    fetchAnalytics(range)
  }, [range, fetchAnalytics])

  const handleApplyCustomRange = useCallback(() => {
    if (!customFrom || !customTo) return
    if (new Date(customFrom) > new Date(customTo)) return
    setRange('custom')
    fetchAnalytics('custom', customFrom, customTo)
    setDatePickerOpen(false)
  }, [customFrom, customTo, fetchAnalytics])

  const handleClearCustomRange = useCallback(() => {
    setCustomFrom('')
    setCustomTo('')
    setRange('7d')
  }, [])

  const displayData = useMemo(() => {
    if (data) return data
    if (analytics.totalLinks > 0) {
      return {
        totalLinks: analytics.totalLinks,
        nativeOpens: analytics.nativeOpens,
        browserOpens: analytics.browserOpens,
        topPlatforms: analytics.topPlatforms.map((p, i) => ({
          ...p,
          percentage: p.percentage || 0,
          color: p.color || ['#E4405F', '#FF0000', '#1877F2', '#69C9D0', '#26A5E4', '#25D366', '#1DA1F2', '#0A66C2'][i % 8],
        })),
        recentActivity: analytics.recentActivity,
        conversionRate: analytics.nativeOpens > 0
          ? Math.round((analytics.nativeOpens / (analytics.nativeOpens + analytics.browserOpens)) * 10000) / 100
          : 0,
      } as AnalyticsData
    }
    return generateMockData(range, customFrom, customTo)
  }, [data, analytics, range, customFrom, customTo])

  const activityData = useMemo(() => {
    if (!displayData.recentActivity || displayData.recentActivity.length === 0) {
      return generateMockData(range, customFrom, customTo).recentActivity
    }
    return displayData.recentActivity
  }, [displayData.recentActivity, range, customFrom, customTo])

  const platforms = useMemo(() => {
    if (displayData.topPlatforms && displayData.topPlatforms.length > 0) {
      return displayData.topPlatforms.slice(0, 8)
    }
    return generateMockData(range, customFrom, customTo).topPlatforms
  }, [displayData.topPlatforms, range, customFrom, customTo])

  const ranges: { id: DateRange; label: string }[] = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' },
  ]

  // Format date for display
  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Current range label for display
  const currentRangeLabel = useMemo(() => {
    if (range === 'custom' && customFrom && customTo) {
      return `${formatDate(customFrom)} — ${formatDate(customTo)}`
    }
    const found = ranges.find(r => r.id === range)
    return found?.label || range
  }, [range, customFrom, customTo])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-xl p-4 sm:p-6 space-y-5"
    >
      {/* Header with range selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Analytics Dashboard</h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Range preset buttons */}
          <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-0.5">
            {ranges.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setRange(r.id)
                  setCustomFrom('')
                  setCustomTo('')
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all focus-visible-ring ${
                  range === r.id
                    ? 'bg-accent text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Custom Date Picker Popover */}
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <button
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all focus-visible-ring ${
                  range === 'custom'
                    ? 'bg-primary/15 text-primary border border-primary/30 shadow-sm'
                    : 'bg-muted/30 text-muted-foreground hover:text-foreground border border-transparent hover:border-border/30'
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                Custom
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3" align="end">
              <div className="space-y-3">
                <p className="text-xs font-semibold text-foreground">Custom Date Range</p>

                {/* From date */}
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">From</label>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    max={customTo || today}
                    className="w-full h-8 rounded-md border border-border/50 bg-background/50 px-2 text-xs text-foreground focus-visible-ring focus:border-primary/50 transition-colors"
                  />
                </div>

                {/* To date */}
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">To</label>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    min={customFrom}
                    max={today}
                    className="w-full h-8 rounded-md border border-border/50 bg-background/50 px-2 text-xs text-foreground focus-visible-ring focus:border-primary/50 transition-colors"
                  />
                </div>

                {/* Validation message */}
                {customFrom && customTo && new Date(customFrom) > new Date(customTo) && (
                  <p className="text-[10px] text-red-400">"From" date must be before "To" date</p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    className="flex-1 h-7 text-xs bg-primary text-primary-foreground"
                    onClick={handleApplyCustomRange}
                    disabled={!customFrom || !customTo || new Date(customFrom) > new Date(customTo)}
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Apply
                  </Button>
                  {range === 'custom' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-muted-foreground"
                      onClick={handleClearCustomRange}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active range indicator */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2"
      >
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/30 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{currentRangeLabel}</span>
        </div>
        {range === 'custom' && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleClearCustomRange}
            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
          </motion.button>
        )}
      </motion.div>

      {/* Charts */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-20"
          >
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </motion.div>
        ) : (
          <motion.div
            key={range}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Line Chart */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Link Opens Over Time</span>
              </div>
              <LineChart data={activityData} />
            </div>

            {/* Two-column charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Platform Distribution Bar Chart */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Platform Distribution</span>
                </div>
                <PlatformBarChart platforms={platforms} />
              </div>

              {/* Donut Chart */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Smartphone className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Native vs Browser</span>
                  <Globe className="h-3.5 w-3.5 text-violet-400/60" />
                </div>
                <div className="flex items-center justify-center py-2">
                  <DonutChart nativeOpens={displayData.nativeOpens} browserOpens={displayData.browserOpens} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
