'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Link2, Smartphone, Globe, TrendingUp, Download, BarChart3 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useLinkStore } from '@/store/link-store'

// Generate 30 days of mock data
function generate30DayData() {
  const data = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dayStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    data.push({
      date: dayStr,
      opens: Math.floor(Math.random() * 60) + 15 + Math.floor((30 - i) * 0.8),
      nativeOpens: Math.floor(Math.random() * 45) + 10 + Math.floor((30 - i) * 0.6),
      browserOpens: Math.floor(Math.random() * 20) + 3,
    })
  }
  return data
}

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: '#E4405F',
  YouTube: '#FF0000',
  Facebook: '#1877F2',
  TikTok: '#000000',
  Telegram: '#26A5E4',
  WhatsApp: '#25D366',
  'X (Twitter)': '#000000',
  Snapchat: '#FFFC00',
  LinkedIn: '#0A66C2',
  Pinterest: '#E60023',
  Reddit: '#FF4500',
  Discord: '#5865F2',
  Threads: '#000000',
}

function generatePlatformData() {
  return [
    { name: 'Instagram', value: 342, color: PLATFORM_COLORS.Instagram },
    { name: 'YouTube', value: 278, color: PLATFORM_COLORS.YouTube },
    { name: 'Facebook', value: 156, color: PLATFORM_COLORS.Facebook },
    { name: 'TikTok', value: 134, color: PLATFORM_COLORS.TikTok },
    { name: 'Telegram', value: 98, color: PLATFORM_COLORS.Telegram },
    { name: 'WhatsApp', value: 87, color: PLATFORM_COLORS.WhatsApp },
    { name: 'X (Twitter)', value: 72, color: '#1DA1F2' },
    { name: 'LinkedIn', value: 54, color: PLATFORM_COLORS.LinkedIn },
    { name: 'Reddit', value: 43, color: PLATFORM_COLORS.Reddit },
    { name: 'Discord', value: 38, color: PLATFORM_COLORS.Discord },
    { name: 'Snapchat', value: 26, color: '#FFFC00' },
    { name: 'Pinterest', value: 19, color: PLATFORM_COLORS.Pinterest },
    { name: 'Threads', value: 12, color: '#333' },
  ]
}

interface LinkStatsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function StatCardLarge({
  title,
  value,
  suffix,
  subtitle,
  icon,
  iconBg,
  iconColor,
  delay,
}: {
  title: string
  value: number
  suffix?: string
  subtitle: string
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass-card p-4 rounded-xl space-y-2"
    >
      <div className="flex items-center gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: iconBg }}
        >
          <span style={{ color: iconColor }}>{icon}</span>
        </div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
      </div>
      <div className="text-2xl font-bold text-foreground">
        {value.toLocaleString()}
        {suffix}
      </div>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </motion.div>
  )
}

// Custom tooltip for recharts
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="glass-card p-3 rounded-lg border border-border/50 text-xs">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} className="font-medium" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

export function LinkStatsModal({ open, onOpenChange }: LinkStatsModalProps) {
  const { analytics } = useLinkStore()

  const thirtyDayData = useMemo(() => generate30DayData(), [])
  const platformData = useMemo(() => generatePlatformData(), [])
  const nativeVsBrowserData = useMemo(() => {
    return thirtyDayData.slice(-14).map((d) => ({
      date: d.date,
      Native: d.nativeOpens,
      Browser: d.browserOpens,
    }))
  }, [thirtyDayData])

  const totalLinks = analytics.totalLinks || 1247
  const nativeOpens = analytics.nativeOpens || 892
  const browserOpens = analytics.browserOpens || 355
  const conversionRate = ((nativeOpens / (nativeOpens + browserOpens)) * 100).toFixed(1)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-4xl max-h-[90vh] overflow-y-auto border-border/30 sm:max-w-4xl p-0">
        <div className="p-6 space-y-6">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold gradient-text">
                  Full Analytics
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  Detailed insights into your deep link performance
                </DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs glass-card border-border/30"
                onClick={() => {}}
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
            </div>
          </DialogHeader>

          {/* Stats Summary Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCardLarge
              title="Total Links"
              value={totalLinks}
              subtitle="+12.3% from last week"
              icon={<Link2 className="h-4 w-4" />}
              iconBg="rgba(16, 185, 129, 0.15)"
              iconColor="#10b981"
              delay={0}
            />
            <StatCardLarge
              title="Native Opens"
              value={nativeOpens}
              subtitle="71.5% of total opens"
              icon={<Smartphone className="h-4 w-4" />}
              iconBg="rgba(139, 92, 246, 0.15)"
              iconColor="#8b5cf6"
              delay={0.05}
            />
            <StatCardLarge
              title="Browser Opens"
              value={browserOpens}
              subtitle="-3.2% from last week"
              icon={<Globe className="h-4 w-4" />}
              iconBg="rgba(59, 130, 246, 0.15)"
              iconColor="#3b82f6"
              delay={0.1}
            />
            <StatCardLarge
              title="Conversion"
              value={parseFloat(conversionRate)}
              suffix="%"
              subtitle="Above industry avg"
              icon={<TrendingUp className="h-4 w-4" />}
              iconBg="rgba(245, 158, 11, 0.15)"
              iconColor="#f59e0b"
              delay={0.15}
            />
          </div>

          {/* Area Chart - Link opens over 30 days */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card p-4 rounded-xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Link Opens (30 Days)</h3>
              <span className="text-xs text-muted-foreground">Daily trend</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={thirtyDayData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="50%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#888' }}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    interval={4}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#888' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="opens"
                    name="Total Opens"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#emeraldGradient)"
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                  <Area
                    type="monotone"
                    dataKey="nativeOpens"
                    name="Native Opens"
                    stroke="#8b5cf6"
                    strokeWidth={1.5}
                    fill="url(#purpleGradient)"
                    animationDuration={1500}
                    animationEasing="ease-out"
                    animationBegin={300}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Two charts side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pie Chart - Platform Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass-card p-4 rounded-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Platform Distribution</h3>
                <span className="text-xs text-muted-foreground">By opens</span>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={platformData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      animationDuration={1200}
                      animationEasing="ease-out"
                    >
                      {platformData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="transparent"
                          opacity={0.85}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '10px', color: '#888' }}
                      formatter={(value: string) => (
                        <span className="text-xs text-muted-foreground">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Bar Chart - Native vs Browser */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="glass-card p-4 rounded-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Native vs Browser
                </h3>
                <span className="text-xs text-muted-foreground">Last 14 days</span>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={nativeVsBrowserData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 9, fill: '#888' }}
                      tickLine={false}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      interval={3}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#888' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="Native"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      animationDuration={1200}
                      animationEasing="ease-out"
                      opacity={0.9}
                    />
                    <Bar
                      dataKey="Browser"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                      animationDuration={1200}
                      animationEasing="ease-out"
                      animationBegin={200}
                      opacity={0.9}
                    />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '10px' }}
                      formatter={(value: string) => (
                        <span className="text-xs text-muted-foreground">{value}</span>
                      )}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
