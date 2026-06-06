'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link2, BarChart3, Shield, Clock, Settings, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'

export type SidebarSection = 'input' | 'analytics' | 'tools' | 'history' | 'settings' | 'admin'

interface DashboardSidebarProps {
  activeSection: SidebarSection
  onSectionChange: (section: SidebarSection) => void
}

const baseSidebarItems: { id: SidebarSection; label: string; icon: typeof Link2; gradient: string; progress: number; adminOnly?: boolean }[] = [
  { id: 'input', label: 'Create', icon: Link2, gradient: 'from-emerald-500/20 to-emerald-500/5', progress: 85 },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, gradient: 'from-violet-500/20 to-violet-500/5', progress: 60 },
  { id: 'tools', label: 'Tools', icon: Shield, gradient: 'from-amber-500/20 to-amber-500/5', progress: 40 },
  { id: 'history', label: 'History', icon: Clock, gradient: 'from-emerald-500/20 to-emerald-500/5', progress: 70 },
  { id: 'admin', label: 'Admin', icon: ShieldCheck, gradient: 'from-amber-500/20 to-amber-500/5', progress: 100, adminOnly: true },
  { id: 'settings', label: 'Settings', icon: Settings, gradient: 'from-violet-500/20 to-violet-500/5', progress: 30 },
]

export function DashboardSidebar({ activeSection, onSectionChange }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { user } = useAuthStore()

  // Filter sidebar items based on user role
  const sidebarItems = baseSidebarItems.filter(item => !item.adminOnly || user?.role === 'admin')

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 68 : 240 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const }}
      className="hidden lg:flex flex-col h-[calc(100vh-4rem)] sticky top-16 bg-background/40 backdrop-blur-2xl rounded-2xl border border-border/40 shadow-xl overflow-hidden shrink-0 z-20"
    >
      {/* Toggle button */}
      <div className="flex items-center justify-end p-3 border-b border-border/10">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all focus-visible-ring"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 p-3 space-y-2" role="navigation" aria-label="Dashboard sidebar navigation">
        {sidebarItems.map((item) => {
          const isActive = activeSection === item.id
          const Icon = item.icon

          return (
            <motion.button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 rounded-xl transition-all duration-300 focus-visible-ring group relative overflow-hidden ${
                collapsed ? 'justify-center px-0 py-3' : 'px-4 py-3'
              } ${
                isActive
                  ? `sidebar-active-pill text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border border-emerald-500/20`
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 border border-transparent'
              }`}
              aria-current={isActive ? 'page' : undefined}
              title={collapsed ? item.label : undefined}
            >
              {/* Premium glass hover effect for inactive items */}
              {!isActive && (
                <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              )}

              {/* Active indicator pill with animated gradient */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill-indicator"
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
                  style={{
                    background: 'linear-gradient(180deg, oklch(0.696 0.17 162.48), oklch(0.488 0.243 264.376))',
                    boxShadow: '0 0 12px 2px oklch(0.696 0.17 162.48 / 40%)'
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}

              {/* Icon Container with subtle glow on active */}
              <div className="relative">
                {isActive && (
                   <div className="absolute inset-0 bg-emerald-400/20 blur-md rounded-full pointer-events-none" />
                )}
                <Icon
                  className={`w-5 h-5 shrink-0 transition-all duration-300 relative z-10 ${
                    isActive
                      ? 'text-emerald-400 scale-110'
                      : 'text-muted-foreground group-hover:text-emerald-400/80 group-hover:scale-105'
                  }`}
                />
              </div>

              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`text-sm font-medium whitespace-nowrap overflow-hidden flex-1 text-left ${isActive ? 'text-emerald-400 tracking-wide' : ''}`}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Mini progress indicator (only when expanded and inactive) */}
              {!collapsed && !isActive && (
                <div className="ml-auto w-10 h-1.5 rounded-full bg-muted/40 overflow-hidden shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.progress}%`,
                      background: 'oklch(0.696 0.17 162.48 / 50%)',
                    }}
                  />
                </div>
              )}
            </motion.button>
          )
        })}
      </nav>

      {/* Bottom info */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="p-3 border-t border-border/10"
        >
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="text-[10px] text-muted-foreground">13 platforms active</span>
          </div>
        </motion.div>
      )}
    </motion.aside>
  )
}
