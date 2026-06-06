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
      animate={{ width: collapsed ? 56 : 180 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const }}
      className="hidden lg:flex flex-col h-[calc(100vh-4rem)] sticky top-16 glass-card rounded-xl border border-border/10 overflow-hidden shrink-0"
    >
      {/* Toggle button */}
      <div className="flex items-center justify-end p-2 border-b border-border/10">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors focus-visible-ring"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 p-2 space-y-1" role="navigation" aria-label="Dashboard sidebar navigation">
        {sidebarItems.map((item) => {
          const isActive = activeSection === item.id
          const Icon = item.icon

          return (
            <motion.button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              whileHover={{ scale: 1.03, x: 2 }}
              whileTap={{ scale: 0.97 }}
              className={`w-full flex items-center gap-2.5 rounded-lg transition-all duration-200 focus-visible-ring group relative ${
                collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'
              } ${
                isActive
                  ? `sidebar-active-pill gradient-trail text-emerald-400 border border-emerald-500/20 bg-gradient-to-r ${item.gradient}`
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/40 border border-transparent'
              }`}
              aria-current={isActive ? 'page' : undefined}
              title={collapsed ? item.label : undefined}
            >
              {/* Active indicator pill with animated gradient */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                  style={{
                    background: 'linear-gradient(180deg, oklch(0.696 0.17 162.48), oklch(0.488 0.243 264.376))',
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}

              <Icon
                className={`w-4 h-4 shrink-0 transition-all duration-300 ${
                  isActive
                    ? 'text-emerald-400 scale-110'
                    : 'text-muted-foreground group-hover:text-emerald-400/70 group-hover:scale-105'
                }`}
              />

              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs font-medium whitespace-nowrap overflow-hidden flex-1"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Mini progress indicator */}
              {!collapsed && !isActive && (
                <div className="ml-auto w-8 h-1 rounded-full bg-muted/30 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.progress}%`,
                      background: 'oklch(0.696 0.17 162.48 / 40%)',
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
