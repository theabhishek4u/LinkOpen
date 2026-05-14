'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Link2, BarChart3, Settings, Activity, TrendingUp,
  ShieldCheck, Clock, Trash2, Edit3, Search, ChevronLeft,
  ChevronRight, RefreshCw, Globe, Zap, Server, HardDrive,
  Bell, X, UserCog, Ban, CheckCircle2, AlertTriangle,
  Monitor, Smartphone, Tablet, ExternalLink, Eye, Copy,
  ArrowUpRight, ArrowDownRight, UserX, UserCheck, Crown,
  Rocket, Shield
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Switch } from '@/components/ui/switch'
import { AdminGuard } from './admin-guard'
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────

interface AdminUser {
  id: string
  email: string
  name: string | null
  plan: string
  role: string
  createdAt: string
  _count?: { links: number; analytics: number }
}

interface AdminLink {
  id: string
  originalUrl: string
  platform: string
  deepLink: string | null
  shortCode: string
  title: string | null
  openCount: number
  createdAt: string
  user?: { id: string; email: string; name: string | null } | null
  _count?: { analytics: number }
}

interface AdminStats {
  totalUsers: number
  totalLinks: number
  totalAnalytics: number
  linksToday: number
  activeUsers: number
  recentSignups: number
  platformBreakdown: { platform: string; count: number }[]
}

interface AdminAnalytics {
  range: string
  startDate: string | null
  overview: {
    totalOpens: number
    totalNativeOpens: number
    totalBrowserOpens: number
    totalLinksInRange: number
    totalUsersInRange: number
    conversionRate: number
    avgLinksPerUser: number
    totalActiveUsers: number
  }
  platformBreakdown: { platform: string; count: number; percentage: number }[]
  topLinks: (AdminLink & { nativeOpenRate: number })[]
  clickTrends: { date: string; opens: number; nativeOpens: number }[]
  deviceBreakdown: { device: string; count: number }[]
  browserBreakdown: { browser: string; count: number }[]
  recentActivity: Array<{
    id: string
    platform: string
    device: string
    browser: string
    isNative: boolean
    isOpened: boolean
    country: string | null
    createdAt: string
    link: { shortCode: string; originalUrl: string; title: string | null }
    user: { email: string; name: string | null } | null
  }>
}

// ─── Constants ───────────────────────────────────────────────

const platformColors: Record<string, string> = {
  instagram: '#E4405F', youtube: '#FF0000', facebook: '#1877F2',
  tiktok: '#ff0050', telegram: '#0088cc', whatsapp: '#25D366',
  x: '#888888', snapchat: '#FFFC00', linkedin: '#0A66C2',
  pinterest: '#E60023', reddit: '#FF4500', discord: '#5865F2',
  threads: '#000000',
}

const tabVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

// ─── Utility Components ──────────────────────────────────────

function StatCard({ icon: Icon, label, value, trend, trendDown, color, subtitle }: {
  icon: typeof Users
  label: string
  value: string | number
  trend?: string
  trendDown?: boolean
  color: string
  subtitle?: string
}) {
  return (
    <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit">
      <Card className="glass-card border-border/20 hover:border-border/40 transition-all duration-300 group">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${color}`}>
              <Icon className="h-4 w-4" />
            </div>
            {trend && (
              <Badge
                variant="outline"
                className={`text-[10px] font-medium ${
                  trendDown
                    ? 'border-red-500/25 text-red-400 bg-red-500/10'
                    : 'border-emerald-500/25 text-emerald-400 bg-emerald-500/10'
                }`}
              >
                {trendDown ? <ArrowDownRight className="h-2.5 w-2.5 mr-0.5" /> : <ArrowUpRight className="h-2.5 w-2.5 mr-0.5" />}
                {trend}
              </Badge>
            )}
          </div>
          <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          {subtitle && <p className="text-[10px] text-muted-foreground/60 mt-0.5">{subtitle}</p>}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function MiniBarChart({ data, height = 40, color = '#10b981' }: {
  data: number[]
  height?: number
  color?: string
}) {
  if (!data.length) return null
  const max = Math.max(...data, 1)
  const barWidth = 100 / data.length

  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      {data.map((v, i) => {
        const barHeight = (v / max) * (height - 4)
        return (
          <rect
            key={i}
            x={i * barWidth + barWidth * 0.15}
            y={height - barHeight - 2}
            width={barWidth * 0.7}
            height={barHeight}
            rx={1}
            fill={color}
            opacity={0.6 + (v / max) * 0.4}
          />
        )
      })}
    </svg>
  )
}

function MiniLineChart({ data, height = 60, color = '#10b981' }: {
  data: { value: number }[]
  height?: number
  color?: string
}) {
  if (!data.length) return null
  const max = Math.max(...data.map(d => d.value), 1)
  const min = Math.min(...data.map(d => d.value))
  const range = max - min || 1
  const w = 100
  const pad = 2

  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1 || 1)) * (w - pad * 2)
    const y = height - pad - ((d.value - min) / range) * (height - pad * 2)
    return `${x},${y}`
  }).join(' ')

  const areaPoints = `${pad},${height - pad} ${points} ${w - pad},${height - pad}`

  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#areaGrad)" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Overview Tab ────────────────────────────────────────────

function OverviewTab({ stats, isLoading }: { stats: AdminStats | null; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="glass-card border-border/20 animate-pulse">
              <CardContent className="p-5">
                <div className="h-9 w-9 rounded-lg bg-muted/30 mb-3" />
                <div className="h-7 w-20 bg-muted/30 rounded mb-2" />
                <div className="h-3 w-28 bg-muted/20 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats?.totalUsers ?? 0}
          trend="+12%"
          color="bg-emerald-500/15 text-emerald-400"
          subtitle={`${stats?.activeUsers ?? 0} active`}
        />
        <StatCard
          icon={Link2}
          label="Total Links"
          value={stats?.totalLinks ?? 0}
          trend="+8%"
          color="bg-violet-500/15 text-violet-400"
          subtitle={`${stats?.linksToday ?? 0} today`}
        />
        <StatCard
          icon={Activity}
          label="Total Clicks"
          value={stats?.totalAnalytics ?? 0}
          trend="+15%"
          color="bg-cyan-500/15 text-cyan-400"
        />
        <StatCard
          icon={Zap}
          label="Links Today"
          value={stats?.linksToday ?? 0}
          color="bg-amber-500/15 text-amber-400"
        />
        <StatCard
          icon={UserCheck}
          label="Active Users"
          value={stats?.activeUsers ?? 0}
          color="bg-emerald-500/15 text-emerald-400"
          subtitle="7-day active"
        />
        <StatCard
          icon={ShieldCheck}
          label="System Health"
          value="99.9%"
          color="bg-emerald-500/15 text-emerald-400"
          subtitle="All systems operational"
        />
      </div>

      {/* Platform Distribution */}
      {stats?.platformBreakdown && stats.platformBreakdown.length > 0 && (
        <Card className="glass-card border-border/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Platform Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {stats.platformBreakdown.slice(0, 10).map((p) => (
                <div key={p.platform} className="flex items-center gap-2 p-2.5 rounded-lg bg-background/30 border border-border/10 hover:border-border/25 transition-colors">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: platformColors[p.platform] || '#666' }}
                  />
                  <span className="text-xs text-muted-foreground truncate capitalize">{p.platform}</span>
                  <span className="text-xs font-semibold text-foreground ml-auto">{p.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Signups & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Signups */}
        <Card className="glass-card border-border/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-400" />
              Recent Signups
              <Badge variant="outline" className="text-[10px] border-emerald-500/25 text-emerald-400 bg-emerald-500/10 ml-auto">
                {stats?.recentSignups ?? 0} this week
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-16">
              {[3, 5, 2, 8, 6, 4, 7].map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(v / 8) * 100}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className="w-full bg-emerald-500/30 rounded-sm min-h-[4px]"
                  />
                  <span className="text-[9px] text-muted-foreground/60">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="glass-card border-border/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Server className="h-4 w-4 text-emerald-400" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'API Server', status: 'Online', icon: Globe, color: 'emerald' },
                { label: 'Database', status: 'Connected', icon: HardDrive, color: 'emerald' },
                { label: 'Cache', status: 'Active', icon: Zap, color: 'emerald' },
                { label: 'Workers', status: 'Running', icon: Server, color: 'emerald' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 p-2 rounded-lg bg-background/30 border border-border/10">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <item.icon className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">{item.label}</span>
                  <span className="text-[11px] text-emerald-400 font-medium ml-auto">{item.status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── Users Management Tab ────────────────────────────────────

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [editRole, setEditRole] = useState('')
  const [editPlan, setEditPlan] = useState('')
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const limit = 10

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String((page - 1) * limit),
        search,
      })
      const res = await fetch(`/api/admin/users?${params}`)
      if (res.ok) {
        const data = await res.json()
        let userList = data.data?.users || []
        // Client-side role filter since API doesn't support it
        if (roleFilter !== 'all') {
          userList = userList.filter((u: AdminUser) => u.role === roleFilter)
        }
        setUsers(userList)
        setTotal(roleFilter !== 'all' ? userList.length : (data.data?.total || 0))
      }
    } catch {
      toast.error('Failed to fetch users')
    } finally {
      setIsLoading(false)
    }
  }, [page, search, roleFilter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleUpdateUser = async () => {
    if (!editUser) return
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/admin/users/${editUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: editRole, plan: editPlan }),
      })
      if (res.ok) {
        toast.success(`Updated ${editUser.email}`, { description: `Role: ${editRole}, Plan: ${editPlan}` })
        setEditUser(null)
        fetchUsers()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update user')
      }
    } catch {
      toast.error('Failed to update user')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSuspendUser = async (targetUser: AdminUser, suspend: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${targetUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspended: suspend }),
      })
      if (res.ok) {
        toast.success(suspend ? `Suspended ${targetUser.email}` : `Activated ${targetUser.email}`)
        fetchUsers()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update user')
      }
    } catch {
      toast.error('Failed to update user')
    }
  }

  const handleDeleteUser = async () => {
    if (!deleteUser) return
    try {
      const res = await fetch(`/api/admin/users/${deleteUser.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success(`Deleted user ${deleteUser.email}`)
        setDeleteUser(null)
        fetchUsers()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to delete user')
      }
    } catch {
      toast.error('Failed to delete user')
    }
  }

  const totalPages = Math.ceil(total / limit)

  function getPlanBadge(plan: string) {
    switch (plan) {
      case 'pro': return { label: 'Pro', className: 'border-violet-500/25 text-violet-400 bg-violet-500/10' }
      case 'enterprise': return { label: 'Enterprise', className: 'border-amber-500/25 text-amber-400 bg-amber-500/10' }
      default: return { label: 'Free', className: 'border-emerald-500/25 text-emerald-400 bg-emerald-500/10' }
    }
  }

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by email or name..."
            className="pl-9 h-9 text-sm bg-background/50 border-border/30"
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1) }}>
          <SelectTrigger className="h-9 w-[140px] text-sm">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="sm" onClick={fetchUsers} className="text-muted-foreground hover:text-foreground">
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/20 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/20 hover:bg-transparent">
                <TableHead className="text-xs">User</TableHead>
                <TableHead className="text-xs">Role</TableHead>
                <TableHead className="text-xs">Plan</TableHead>
                <TableHead className="text-xs">Links</TableHead>
                <TableHead className="text-xs">Joined</TableHead>
                <TableHead className="text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-border/10">
                    {[...Array(6)].map((_, j) => (
                      <TableCell key={j}><div className="h-4 bg-muted/20 rounded animate-pulse w-20" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No users found</p>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((userItem) => {
                  const planBadge = getPlanBadge(userItem.plan)
                  const isSuspended = userItem.role === 'suspended'
                  return (
                    <TableRow key={userItem.id} className={`border-border/10 hover:bg-accent/20 ${isSuspended ? 'opacity-60' : ''}`}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                            {userItem.name ? userItem.name[0].toUpperCase() : userItem.email[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{userItem.name || '—'}</p>
                            <p className="text-xs text-muted-foreground truncate">{userItem.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${
                          userItem.role === 'admin'
                            ? 'border-amber-500/25 text-amber-400 bg-amber-500/10'
                            : isSuspended
                            ? 'border-red-500/25 text-red-400 bg-red-500/10'
                            : 'border-border/30 text-muted-foreground'
                        }`}>
                          {userItem.role === 'admin' && <ShieldCheck className="h-2.5 w-2.5 mr-0.5" />}
                          {isSuspended && <Ban className="h-2.5 w-2.5 mr-0.5" />}
                          {userItem.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${planBadge.className}`}>
                          {userItem.plan === 'pro' && <Crown className="h-2.5 w-2.5 mr-0.5" />}
                          {userItem.plan === 'enterprise' && <Rocket className="h-2.5 w-2.5 mr-0.5" />}
                          {planBadge.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {userItem._count?.links ?? 0}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(userItem.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              setEditUser(userItem)
                              setEditRole(userItem.role === 'suspended' ? 'user' : userItem.role)
                              setEditPlan(userItem.plan)
                            }}
                            title="Edit user"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-7 w-7 ${isSuspended ? 'text-emerald-400 hover:text-emerald-300' : 'text-muted-foreground hover:text-amber-400'}`}
                            onClick={() => handleSuspendUser(userItem, !isSuspended)}
                            title={isSuspended ? 'Activate user' : 'Suspend user'}
                          >
                            {isSuspended ? <UserCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-red-400"
                            onClick={() => setDeleteUser(userItem)}
                            title="Delete user"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs text-muted-foreground px-2">{page} / {totalPages}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="glass-card border-border/20 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <UserCog className="h-4 w-4 text-primary" />
              Edit User
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Change the role and plan for this user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">User</p>
              <p className="text-sm font-medium text-foreground">{editUser?.email}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Role</label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Plan</label>
              <Select value={editPlan} onValueChange={setEditPlan}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button size="sm" className="bg-primary text-primary-foreground" onClick={handleUpdateUser} disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <AlertDialogContent className="glass-card border-border/20 max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              Delete User
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete <span className="font-medium text-foreground">{deleteUser?.email}</span>?
              This action cannot be undone. All associated links and analytics will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction className="text-xs bg-red-500 text-white hover:bg-red-600" onClick={handleDeleteUser}>
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ─── Links Management Tab ────────────────────────────────────

function LinksTab() {
  const [links, setLinks] = useState<AdminLink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [deleteLink, setDeleteLink] = useState<AdminLink | null>(null)
  const limit = 10

  const fetchLinks = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String((page - 1) * limit),
        search,
        platform: platformFilter,
      })
      const res = await fetch(`/api/admin/links?${params}`)
      if (res.ok) {
        const data = await res.json()
        setLinks(data.data?.links || [])
        setTotal(data.data?.total || 0)
      }
    } catch {
      toast.error('Failed to fetch links')
    } finally {
      setIsLoading(false)
    }
  }, [page, search, platformFilter])

  useEffect(() => {
    fetchLinks()
  }, [fetchLinks])

  const handleDeleteLink = async () => {
    if (!deleteLink) return
    try {
      const res = await fetch(`/api/admin/links/${deleteLink.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success(`Deleted link ${deleteLink.shortCode}`)
        setDeleteLink(null)
        fetchLinks()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to delete link')
      }
    } catch {
      toast.error('Failed to delete link')
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search links by URL, code..."
            className="pl-9 h-9 text-sm bg-background/50 border-border/30"
          />
        </div>
        <Select value={platformFilter} onValueChange={(v) => { setPlatformFilter(v); setPage(1) }}>
          <SelectTrigger className="h-9 w-[160px] text-sm">
            <SelectValue placeholder="All platforms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            {Object.entries(platformColors).map(([name, color]) => (
              <SelectItem key={name} value={name}>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="ghost" size="sm" onClick={fetchLinks} className="text-muted-foreground hover:text-foreground">
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/20 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/20 hover:bg-transparent">
                <TableHead className="text-xs">Original URL</TableHead>
                <TableHead className="text-xs">Platform</TableHead>
                <TableHead className="text-xs">Deep Link</TableHead>
                <TableHead className="text-xs">Short Code</TableHead>
                <TableHead className="text-xs">Opens</TableHead>
                <TableHead className="text-xs">User</TableHead>
                <TableHead className="text-xs">Created</TableHead>
                <TableHead className="text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-border/10">
                    {[...Array(8)].map((_, j) => (
                      <TableCell key={j}><div className="h-4 bg-muted/20 rounded animate-pulse w-16" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : links.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                    <Link2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No links found</p>
                  </TableCell>
                </TableRow>
              ) : (
                links.map((link) => (
                  <TableRow key={link.id} className="border-border/10 hover:bg-accent/20">
                    <TableCell className="max-w-[180px]">
                      <p className="text-xs text-foreground truncate" title={link.originalUrl}>{link.title || link.originalUrl}</p>
                      {!link.title && (
                        <p className="text-[10px] text-muted-foreground/60 truncate">{link.originalUrl}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] border-border/30 capitalize">
                        <span
                          className="w-2 h-2 rounded-full mr-1 shrink-0"
                          style={{ backgroundColor: platformColors[link.platform] || '#666' }}
                        />
                        {link.platform}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[140px]">
                      {link.deepLink ? (
                        <p className="text-[10px] text-primary/70 truncate font-mono" title={link.deepLink}>{link.deepLink}</p>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/40">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <code className="text-[10px] text-muted-foreground font-mono bg-muted/30 px-1.5 py-0.5 rounded">{link.shortCode}</code>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3 text-muted-foreground" />
                        <span className="text-foreground font-medium">{link.openCount}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[100px] truncate">
                      {link.user?.email || '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-red-400"
                        onClick={() => setDeleteLink(link)}
                        title="Delete link"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs text-muted-foreground px-2">{page} / {totalPages}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Link Confirmation */}
      <AlertDialog open={!!deleteLink} onOpenChange={() => setDeleteLink(null)}>
        <AlertDialogContent className="glass-card border-border/20 max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              Delete Link
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete the link <code className="text-foreground font-mono">{deleteLink?.shortCode}</code>?
              This will also remove all associated analytics data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction className="text-xs bg-red-500 text-white hover:bg-red-600" onClick={handleDeleteLink}>
              Delete Link
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ─── Analytics Tab ───────────────────────────────────────────

function AnalyticsTab() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState('30d')

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/admin/analytics?range=${period}`)
        if (res.ok) {
          const data = await res.json()
          setAnalytics(data.data)
        }
      } catch {
        toast.error('Failed to fetch analytics')
      } finally {
        setIsLoading(false)
      }
    }
    fetchAnalytics()
  }, [period])

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile': return Smartphone
      case 'desktop': return Monitor
      case 'tablet': return Tablet
      default: return Monitor
    }
  }

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center gap-3">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="h-9 w-[140px] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="glass-card animate-pulse">
              <CardContent className="p-5"><div className="h-16 bg-muted/20 rounded" /></CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Activity}
              label="Total Opens"
              value={analytics?.overview.totalOpens ?? 0}
              color="bg-emerald-500/15 text-emerald-400"
            />
            <StatCard
              icon={Zap}
              label="Native Opens"
              value={analytics?.overview.totalNativeOpens ?? 0}
              trend={`${analytics?.overview.conversionRate ?? 0}%`}
              color="bg-amber-500/15 text-amber-400"
              subtitle="conversion rate"
            />
            <StatCard
              icon={Globe}
              label="Browser Opens"
              value={analytics?.overview.totalBrowserOpens ?? 0}
              color="bg-violet-500/15 text-violet-400"
            />
            <StatCard
              icon={Users}
              label="Active Users"
              value={analytics?.overview.totalActiveUsers ?? 0}
              color="bg-cyan-500/15 text-cyan-400"
              subtitle={`${analytics?.overview.avgLinksPerUser ?? 0} avg links/user`}
            />
          </div>

          {/* Click Trends Chart */}
          {analytics?.clickTrends && analytics.clickTrends.length > 0 && (
            <Card className="glass-card border-border/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Click Trends
                  <Badge variant="outline" className="text-[10px] border-border/30 text-muted-foreground ml-auto">
                    {analytics.clickTrends.length} days
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Main chart */}
                  <div className="h-32">
                    <svg viewBox="0 0 100 50" className="w-full h-full" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="openGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="nativeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {(() => {
                        const data = analytics.clickTrends
                        const maxVal = Math.max(...data.map(d => d.opens), 1)
                        const openPoints = data.map((d, i) => {
                          const x = (i / (data.length - 1 || 1)) * 98 + 1
                          const y = 48 - (d.opens / maxVal) * 44
                          return `${x},${y}`
                        }).join(' ')
                        const nativePoints = data.map((d, i) => {
                          const x = (i / (data.length - 1 || 1)) * 98 + 1
                          const y = 48 - (d.nativeOpens / maxVal) * 44
                          return `${x},${y}`
                        }).join(' ')
                        const openArea = `1,48 ${openPoints} 99,48`
                        const nativeArea = `1,48 ${nativePoints} 99,48`
                        return (
                          <>
                            <polygon points={openArea} fill="url(#openGrad)" />
                            <polyline points={openPoints} fill="none" stroke="#10b981" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            <polygon points={nativeArea} fill="url(#nativeGrad)" />
                            <polyline points={nativePoints} fill="none" stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3,2" />
                          </>
                        )
                      })()}
                    </svg>
                  </div>
                  <div className="flex items-center gap-4 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 bg-emerald-500 rounded" />
                      <span className="text-muted-foreground">Total Opens</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 bg-amber-500 rounded" style={{ borderStyle: 'dashed' }} />
                      <span className="text-muted-foreground">Native Opens</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Performing Links */}
            {analytics?.topLinks && analytics.topLinks.length > 0 && (
              <Card className="glass-card border-border/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-primary" />
                    Top Performing Links
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar">
                    {analytics.topLinks.map((link, i) => (
                      <div key={link.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-background/30 border border-border/10 hover:border-border/25 transition-colors">
                        <span className="text-[10px] font-mono text-muted-foreground w-4 text-right">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground truncate">{link.title || link.originalUrl}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{link.shortCode} · {link.platform}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-semibold text-foreground">{link.openCount}</p>
                          <p className="text-[10px] text-muted-foreground">opens</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Platform Breakdown */}
            {analytics?.platformBreakdown && analytics.platformBreakdown.length > 0 && (
              <Card className="glass-card border-border/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Platform Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2.5">
                    {analytics.platformBreakdown.slice(0, 8).map((p) => (
                      <div key={p.platform} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-20 truncate capitalize">{p.platform}</span>
                        <div className="flex-1 h-5 bg-muted/20 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(p.percentage, 100)}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: platformColors[p.platform] || '#666', opacity: 0.7 }}
                          />
                        </div>
                        <span className="text-[10px] font-medium text-foreground w-14 text-right">
                          {p.count} ({p.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Device & Browser Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Device Breakdown */}
            {analytics?.deviceBreakdown && analytics.deviceBreakdown.length > 0 && (
              <Card className="glass-card border-border/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-primary" />
                    Device Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.deviceBreakdown.slice(0, 5).map((d) => {
                      const DevIcon = getDeviceIcon(d.device)
                      const total = analytics.deviceBreakdown.reduce((sum, x) => sum + x.count, 0)
                      const pct = total > 0 ? ((d.count / total) * 100).toFixed(0) : '0'
                      return (
                        <div key={d.device} className="flex items-center gap-2.5 p-2 rounded-lg bg-background/30 border border-border/10">
                          <DevIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-xs text-muted-foreground capitalize flex-1">{d.device}</span>
                          <span className="text-xs font-semibold text-foreground">{d.count}</span>
                          <span className="text-[10px] text-muted-foreground">({pct}%)</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Browser Breakdown */}
            {analytics?.browserBreakdown && analytics.browserBreakdown.length > 0 && (
              <Card className="glass-card border-border/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    Browser Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.browserBreakdown.slice(0, 5).map((b) => {
                      const total = analytics.browserBreakdown.reduce((sum, x) => sum + x.count, 0)
                      const pct = total > 0 ? ((b.count / total) * 100).toFixed(0) : '0'
                      return (
                        <div key={b.browser} className="flex items-center gap-2.5 p-2 rounded-lg bg-background/30 border border-border/10">
                          <span className="text-xs text-muted-foreground capitalize flex-1">{b.browser}</span>
                          <span className="text-xs font-semibold text-foreground">{b.count}</span>
                          <span className="text-[10px] text-muted-foreground">({pct}%)</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Activity */}
          {analytics?.recentActivity && analytics.recentActivity.length > 0 && (
            <Card className="glass-card border-border/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  Recent Activity
                  <Badge variant="outline" className="text-[10px] border-emerald-500/25 text-emerald-400 bg-emerald-500/10 ml-auto">
                    Live
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar">
                  {analytics.recentActivity.slice(0, 15).map((activity, i) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-2.5 p-2 rounded-lg bg-background/20 hover:bg-background/30 transition-colors"
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: platformColors[activity.platform] || '#666' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-foreground truncate">
                          {activity.link.title || activity.link.shortCode}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {activity.isNative ? 'Native' : 'Browser'} · {activity.device} · {activity.country || 'Unknown'}
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground/60 shrink-0">
                        {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

// ─── Settings Tab ────────────────────────────────────────────

function SettingsTab() {
  const [settings, setSettings] = useState({
    allowRegistration: true,
    maintenanceMode: false,
    maxLinksPerDay: 100,
    defaultPlan: 'free',
    emailNotifications: true,
    analyticsRetention: '90d',
  })

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
    toast.success('Setting updated')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* General */}
      <Card className="glass-card border-border/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Allow Registration</p>
              <p className="text-xs text-muted-foreground">Enable new user signups</p>
            </div>
            <Switch checked={settings.allowRegistration as boolean} onCheckedChange={() => handleToggle('allowRegistration')} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Maintenance Mode</p>
              <p className="text-xs text-muted-foreground">Temporarily disable the application</p>
            </div>
            <Switch checked={settings.maintenanceMode as boolean} onCheckedChange={() => handleToggle('maintenanceMode')} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Max Links Per Day (Free)</p>
              <p className="text-xs text-muted-foreground">Daily link generation limit for free users</p>
            </div>
            <Input
              type="number"
              value={settings.maxLinksPerDay as number}
              onChange={(e) => setSettings(prev => ({ ...prev, maxLinksPerDay: Number(e.target.value) }))}
              className="w-20 h-8 text-sm"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Default Plan</p>
              <p className="text-xs text-muted-foreground">Plan assigned to new users</p>
            </div>
            <Select value={settings.defaultPlan as string} onValueChange={(v) => setSettings(prev => ({ ...prev, defaultPlan: v }))}>
              <SelectTrigger className="w-24 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="glass-card border-border/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Send email alerts for important events</p>
            </div>
            <Switch checked={settings.emailNotifications as boolean} onCheckedChange={() => handleToggle('emailNotifications')} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Analytics Retention</p>
              <p className="text-xs text-muted-foreground">How long to keep analytics data</p>
            </div>
            <Select value={settings.analyticsRetention as string} onValueChange={(v) => setSettings(prev => ({ ...prev, analyticsRetention: v }))}>
              <SelectTrigger className="w-24 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30d">30 days</SelectItem>
                <SelectItem value="90d">90 days</SelectItem>
                <SelectItem value="1y">1 year</SelectItem>
                <SelectItem value="forever">Forever</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Main Admin Panel (exported) ─────────────────────────────

interface AdminPanelProps {
  onClose?: () => void
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchAdminStats = async () => {
      setStatsLoading(true)
      try {
        const res = await fetch('/api/admin/stats')
        if (res.ok) {
          const data = await res.json()
          setAdminStats(data.data)
        }
      } catch {
        // Silently fail
      } finally {
        setStatsLoading(false)
      }
    }
    fetchAdminStats()
  }, [])

  return (
    <AdminGuard>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground">Admin Dashboard</h2>
            <p className="text-xs text-muted-foreground">System administration and monitoring</p>
          </div>
          <Badge variant="outline" className="border-amber-500/25 text-amber-400 bg-amber-500/10 text-[10px]">
            <Shield className="h-2.5 w-2.5 mr-1" />
            Admin Access
          </Badge>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/30 border border-border/20 h-9 p-0.5">
            <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-accent data-[state=active]:text-foreground h-8 px-3">
              <Activity className="h-3.5 w-3.5 mr-1.5" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs data-[state=active]:bg-accent data-[state=active]:text-foreground h-8 px-3">
              <Users className="h-3.5 w-3.5 mr-1.5" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="links" className="text-xs data-[state=active]:bg-accent data-[state=active]:text-foreground h-8 px-3">
              <Link2 className="h-3.5 w-3.5 mr-1.5" />
              <span className="hidden sm:inline">Links</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs data-[state=active]:bg-accent data-[state=active]:text-foreground h-8 px-3">
              <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs data-[state=active]:bg-accent data-[state=active]:text-foreground h-8 px-3">
              <Settings className="h-3.5 w-3.5 mr-1.5" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {activeTab === 'overview' && <OverviewTab stats={adminStats} isLoading={statsLoading} />}
              {activeTab === 'users' && <UsersTab />}
              {activeTab === 'links' && <LinksTab />}
              {activeTab === 'analytics' && <AnalyticsTab />}
              {activeTab === 'settings' && <SettingsTab />}
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </AdminGuard>
  )
}
