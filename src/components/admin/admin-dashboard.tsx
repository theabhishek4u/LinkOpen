'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Link2, BarChart3, Settings, Activity, TrendingUp,
  ShieldCheck, Clock, AlertCircle, Check, Trash2, Edit3,
  Search, ChevronLeft, ChevronRight, RefreshCw, Globe,
  Zap, Server, Cpu, MemoryStick, HardDrive, Bell
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
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { AdminGuard } from './admin-guard'
import { toast } from 'sonner'

// Types
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
  openCount: number
  createdAt: string
  user?: { email: string; name: string | null } | null
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

// Animation variants
const tabVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
}

// Platform color map
const platformColors: Record<string, string> = {
  instagram: '#E4405F', youtube: '#FF0000', facebook: '#1877F2',
  tiktok: '#ff0050', telegram: '#0088cc', whatsapp: '#25D366',
  x: '#888888', snapchat: '#FFFC00', linkedin: '#0A66C2',
  pinterest: '#E60023', reddit: '#FF4500', discord: '#5865F2',
  threads: '#000000',
}

// Stat card component
function StatCard({ icon: Icon, label, value, trend, color }: {
  icon: typeof Users
  label: string
  value: string | number
  trend?: string
  color: string
}) {
  return (
    <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit">
      <Card className="glass-card border-border/20 hover:border-border/40 transition-colors">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            {trend && (
              <Badge variant="outline" className="text-[10px] border-emerald-500/25 text-emerald-400 bg-emerald-500/10">
                <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
                {trend}
              </Badge>
            )}
          </div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Overview Tab
function OverviewTab({ stats, isLoading }: { stats: AdminStats | null; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="glass-card border-border/20 animate-pulse">
            <CardContent className="p-6">
              <div className="h-10 w-10 rounded-lg bg-muted/30 mb-3" />
              <div className="h-7 w-20 bg-muted/30 rounded mb-2" />
              <div className="h-3 w-28 bg-muted/20 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats?.totalUsers ?? 0} trend="+12%" color="bg-emerald-500/15 text-emerald-400" />
        <StatCard icon={Link2} label="Total Links" value={stats?.totalLinks ?? 0} trend="+8%" color="bg-violet-500/15 text-violet-400" />
        <StatCard icon={Zap} label="Links Today" value={stats?.linksToday ?? 0} color="bg-amber-500/15 text-amber-400" />
        <StatCard icon={Activity} label="Active Users" value={stats?.activeUsers ?? 0} color="bg-cyan-500/15 text-cyan-400" />
        <StatCard icon={BarChart3} label="Total Analytics" value={stats?.totalAnalytics ?? 0} color="bg-rose-500/15 text-rose-400" />
        <StatCard icon={ShieldCheck} label="System Health" value="Operational" color="bg-emerald-500/15 text-emerald-400" />
      </div>

      {/* Platform Breakdown */}
      {stats?.platformBreakdown && stats.platformBreakdown.length > 0 && (
        <Card className="glass-card border-border/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Platform Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {stats.platformBreakdown.map((p) => (
                <div key={p.platform} className="flex items-center gap-2 p-2 rounded-lg bg-background/30 border border-border/10">
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

      {/* System Health */}
      <Card className="glass-card border-border/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Server className="h-4 w-4 text-emerald-400" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'API Server', status: 'Online', icon: Globe },
              { label: 'Database', status: 'Connected', icon: HardDrive },
              { label: 'Cache', status: 'Active', icon: MemoryStick },
              { label: 'Workers', status: 'Running', icon: Cpu },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <item.icon className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">{item.label}:</span>
                <span className="text-emerald-400 font-medium">{item.status}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Users Tab
function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [editRole, setEditRole] = useState('')
  const limit = 10

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/users?limit=${limit}&offset=${(page - 1) * limit}&search=${encodeURIComponent(search)}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.data?.users || [])
        setTotal(data.data?.total || 0)
      }
    } catch {
      toast.error('Failed to fetch users')
    } finally {
      setIsLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleUpdateRole = async () => {
    if (!editUser) return
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: editUser.id, role: editRole }),
      })
      if (res.ok) {
        toast.success(`Updated ${editUser.email} role to ${editRole}`)
        setEditUser(null)
        fetchUsers()
      } else {
        toast.error('Failed to update role')
      }
    } catch {
      toast.error('Failed to update role')
    }
  }

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete user ${email}? This action cannot be undone.`)) return
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (res.ok) {
        toast.success(`Deleted user ${email}`)
        fetchUsers()
      } else {
        toast.error('Failed to delete user')
      }
    } catch {
      toast.error('Failed to delete user')
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search users by email or name..."
            className="pl-9 h-9 text-sm bg-background/50 border-border/30"
          />
        </div>
        <Button variant="ghost" size="sm" onClick={fetchUsers} className="text-muted-foreground hover:text-foreground">
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/20 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/20 hover:bg-transparent">
              <TableHead className="text-xs">User</TableHead>
              <TableHead className="text-xs">Plan</TableHead>
              <TableHead className="text-xs">Role</TableHead>
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
                    <TableCell key={j}><div className="h-4 bg-muted/20 rounded animate-pulse" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="border-border/10 hover:bg-accent/20">
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-foreground">{user.name || '—'}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] ${
                      user.plan === 'pro' ? 'border-violet-500/25 text-violet-400 bg-violet-500/10' :
                      user.plan === 'enterprise' ? 'border-amber-500/25 text-amber-400 bg-amber-500/10' :
                      'border-emerald-500/25 text-emerald-400 bg-emerald-500/10'
                    }`}>
                      {user.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] ${
                      user.role === 'admin' ? 'border-amber-500/25 text-amber-400 bg-amber-500/10' :
                      'border-border/30 text-muted-foreground'
                    }`}>
                      {user.role === 'admin' && <ShieldCheck className="h-2.5 w-2.5 mr-0.5" />}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {user._count?.links ?? 0}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => { setEditUser(user); setEditRole(user.role) }}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-red-400"
                        onClick={() => handleDeleteUser(user.id, user.email)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs text-muted-foreground px-2">
              {page} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit Role Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="glass-card border-border/20 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">Edit User Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-xs text-muted-foreground">
              User: <span className="text-foreground font-medium">{editUser?.email}</span>
            </p>
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
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button size="sm" className="bg-primary text-primary-foreground" onClick={handleUpdateRole}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Links Tab
function LinksTab() {
  const [links, setLinks] = useState<AdminLink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  const fetchLinks = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String((page - 1) * limit),
        search: search,
        platform: platformFilter,
      })
      const res = await fetch(`/api/links?${params}`)
      if (res.ok) {
        const data = await res.json()
        setLinks(data.data || [])
        setTotal(data.pagination?.total || 0)
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
            placeholder="Search links..."
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
        <Table>
          <TableHeader>
            <TableRow className="border-border/20 hover:bg-transparent">
              <TableHead className="text-xs">URL</TableHead>
              <TableHead className="text-xs">Platform</TableHead>
              <TableHead className="text-xs">Short Code</TableHead>
              <TableHead className="text-xs">Opens</TableHead>
              <TableHead className="text-xs">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i} className="border-border/10">
                  {[...Array(5)].map((_, j) => (
                    <TableCell key={j}><div className="h-4 bg-muted/20 rounded animate-pulse" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : links.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No links found
                </TableCell>
              </TableRow>
            ) : (
              links.map((link) => (
                <TableRow key={link.id} className="border-border/10 hover:bg-accent/20">
                  <TableCell className="max-w-[200px]">
                    <p className="text-xs text-foreground truncate">{link.originalUrl}</p>
                    {link.deepLink && (
                      <p className="text-[10px] text-primary/60 truncate mt-0.5">{link.deepLink}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] border-border/30 capitalize">
                      <span
                        className="w-2 h-2 rounded-full mr-1"
                        style={{ backgroundColor: platformColors[link.platform] || '#666' }}
                      />
                      {link.platform}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-[10px] text-muted-foreground font-mono">{link.shortCode}</code>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{link.openCount}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(link.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total}
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
    </div>
  )
}

// Analytics Tab
function AnalyticsTab() {
  const [stats, setStats] = useState<{
    period: string
    totalLinks: number
    totalOpens: number
    nativeOpens: number
    browserOpens: number
    conversionRate: number
    platformBreakdown: { platform: string; count: number; percentage: number }[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState('30d')

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/stats?period=${period}`)
        if (res.ok) {
          const data = await res.json()
          setStats(data.data)
        }
      } catch {
        toast.error('Failed to fetch analytics')
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [period])

  return (
    <div className="space-y-6">
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
              <CardContent className="p-4"><div className="h-16 bg-muted/20 rounded" /></CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Link2} label="Total Links" value={stats?.totalLinks ?? 0} color="bg-emerald-500/15 text-emerald-400" />
            <StatCard icon={Activity} label="Total Opens" value={stats?.totalOpens ?? 0} color="bg-violet-500/15 text-violet-400" />
            <StatCard icon={Zap} label="Native Opens" value={stats?.nativeOpens ?? 0} color="bg-amber-500/15 text-amber-400" />
            <StatCard icon={TrendingUp} label="Conversion Rate" value={`${stats?.conversionRate ?? 0}%`} color="bg-cyan-500/15 text-cyan-400" />
          </div>

          {/* Top Platforms Chart */}
          {stats?.platformBreakdown && stats.platformBreakdown.length > 0 && (
            <Card className="glass-card border-border/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Top Platforms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.platformBreakdown.slice(0, 8).map((p) => (
                    <div key={p.platform} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-20 truncate capitalize">{p.platform}</span>
                      <div className="flex-1 h-6 bg-muted/20 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${p.percentage}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: platformColors[p.platform] || '#666', opacity: 0.7 }}
                        />
                      </div>
                      <span className="text-xs font-medium text-foreground w-16 text-right">
                        {p.count} ({p.percentage}%)
                      </span>
                    </div>
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

// Settings Tab
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
            <Switch checked={settings.allowRegistration} onCheckedChange={() => handleToggle('allowRegistration')} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Maintenance Mode</p>
              <p className="text-xs text-muted-foreground">Temporarily disable the application</p>
            </div>
            <Switch checked={settings.maintenanceMode} onCheckedChange={() => handleToggle('maintenanceMode')} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Max Links Per Day (Free)</p>
              <p className="text-xs text-muted-foreground">Daily link generation limit for free users</p>
            </div>
            <Input
              type="number"
              value={settings.maxLinksPerDay}
              onChange={(e) => setSettings(prev => ({ ...prev, maxLinksPerDay: Number(e.target.value) }))}
              className="w-20 h-8 text-sm"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Default Plan</p>
              <p className="text-xs text-muted-foreground">Plan assigned to new users</p>
            </div>
            <Select value={settings.defaultPlan} onValueChange={(v) => setSettings(prev => ({ ...prev, defaultPlan: v }))}>
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
            <Switch checked={settings.emailNotifications} onCheckedChange={() => handleToggle('emailNotifications')} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Analytics Retention</p>
              <p className="text-xs text-muted-foreground">How long to keep analytics data</p>
            </div>
            <Select value={settings.analyticsRetention} onValueChange={(v) => setSettings(prev => ({ ...prev, analyticsRetention: v }))}>
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

// Main Admin Dashboard
export function AdminDashboard() {
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

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
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Admin Dashboard</h2>
            <p className="text-xs text-muted-foreground">System administration and monitoring</p>
          </div>
          <Badge variant="outline" className="ml-auto border-amber-500/25 text-amber-400 bg-amber-500/10 text-[10px]">
            Admin Access
          </Badge>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted/30 border border-border/20 h-9 p-0.5">
            <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-accent data-[state=active]:text-foreground h-8 px-3">
              <Activity className="h-3.5 w-3.5 mr-1.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs data-[state=active]:bg-accent data-[state=active]:text-foreground h-8 px-3">
              <Users className="h-3.5 w-3.5 mr-1.5" />
              Users
            </TabsTrigger>
            <TabsTrigger value="links" className="text-xs data-[state=active]:bg-accent data-[state=active]:text-foreground h-8 px-3">
              <Link2 className="h-3.5 w-3.5 mr-1.5" />
              Links
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs data-[state=active]:bg-accent data-[state=active]:text-foreground h-8 px-3">
              <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs data-[state=active]:bg-accent data-[state=active]:text-foreground h-8 px-3">
              <Settings className="h-3.5 w-3.5 mr-1.5" />
              Settings
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="overview" className="mt-0">
              <OverviewTab stats={adminStats} isLoading={statsLoading} />
            </TabsContent>
            <TabsContent value="users" className="mt-0">
              <UsersTab />
            </TabsContent>
            <TabsContent value="links" className="mt-0">
              <LinksTab />
            </TabsContent>
            <TabsContent value="analytics" className="mt-0">
              <AnalyticsTab />
            </TabsContent>
            <TabsContent value="settings" className="mt-0">
              <SettingsTab />
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </AdminGuard>
  )
}
