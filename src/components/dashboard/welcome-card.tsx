'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Link2, BarChart3, Download, Lightbulb, X, Sun, Moon, Coffee, Sunset } from 'lucide-react'
import { useLinkStore } from '@/store/link-store'

const WELCOME_DISMISSED_KEY = 'linkverse-welcome-dismissed'
const TIP_INDEX_KEY = 'linkverse-tip-index'

const TIPS = [
  'Use ⌘K to quickly access any feature with the command palette.',
  'Drag links between clusters to organize your workspace.',
  'Set link expiry dates to automatically deactivate time-sensitive URLs.',
  'Use the deep link tester to verify links work before sharing.',
  'Export your analytics data as CSV for deeper analysis in spreadsheets.',
  'Add notes to links to remember why you created them.',
  'Use tags to organize links across different projects or clients.',
  'The health checker monitors your links and alerts you if they go down.',
  'Custom aliases make short links more memorable and brand-friendly.',
  'Press Ctrl+/ to see all available keyboard shortcuts.',
  'Batch select links to delete, export, or tag multiple at once.',
  'Use the link comparison tool to see native vs browser open differences.',
]

function getGreeting(): { text: string; icon: typeof Sun; gradient: string } {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) {
    return { text: 'Good morning', icon: Sun, gradient: 'from-amber-500/10 via-orange-500/5 to-transparent' }
  }
  if (hour >= 12 && hour < 17) {
    return { text: 'Good afternoon', icon: Coffee, gradient: 'from-primary/10 via-emerald-500/5 to-transparent' }
  }
  if (hour >= 17 && hour < 21) {
    return { text: 'Good evening', icon: Sunset, gradient: 'from-violet-500/10 via-rose-500/5 to-transparent' }
  }
  return { text: 'Good night', icon: Moon, gradient: 'from-indigo-500/10 via-blue-500/5 to-transparent' }
}

function getTipIndex(): number {
  if (typeof window === 'undefined') return 0
  try {
    const stored = localStorage.getItem(TIP_INDEX_KEY)
    const idx = stored ? parseInt(stored, 10) : 0
    return idx % TIPS.length
  } catch {
    return 0
  }
}

function incrementTipIndex() {
  if (typeof window === 'undefined') return
  try {
    const current = getTipIndex()
    localStorage.setItem(TIP_INDEX_KEY, String((current + 1) % TIPS.length))
  } catch {
    // Ignore
  }
}

export interface WelcomeCardProps {
  onCreateLink?: () => void
  onViewAnalytics?: () => void
  onExportData?: () => void
}

export function WelcomeCard({ onCreateLink, onViewAnalytics, onExportData }: WelcomeCardProps) {
  const { history } = useLinkStore()
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return localStorage.getItem(WELCOME_DISMISSED_KEY) === 'true'
    } catch {
      return false
    }
  })

  // Compute initial tip index with daily rotation built in
  const [tipIndex, setTipIndex] = useState(() => {
    if (typeof window === 'undefined') return 0
    try {
      const today = new Date().toDateString()
      const lastTipDate = localStorage.getItem('linkverse-tip-date')
      if (lastTipDate !== today) {
        localStorage.setItem('linkverse-tip-date', today)
        const stored = localStorage.getItem(TIP_INDEX_KEY)
        const currentIdx = stored ? parseInt(stored, 10) : 0
        const nextIdx = (currentIdx + 1) % TIPS.length
        localStorage.setItem(TIP_INDEX_KEY, String(nextIdx))
        return nextIdx
      }
      const stored = localStorage.getItem(TIP_INDEX_KEY)
      return stored ? parseInt(stored, 10) % TIPS.length : 0
    } catch {
      return 0
    }
  })

  const greeting = useMemo(() => getGreeting(), [])
  const GreetingIcon = greeting.icon

  // Count links created today
  const todayLinks = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return history.filter((item) => new Date(item.createdAt) >= today).length
  }, [history])

  const handleDismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(WELCOME_DISMISSED_KEY, 'true')
    } catch {
      // Ignore
    }
  }

  const handleNextTip = () => {
    incrementTipIndex()
    setTipIndex(getTipIndex())
  }

  if (dismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15, height: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }}
        className={`relative glass-card rounded-xl overflow-hidden border border-border/20`}
      >
        {/* Gradient background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${greeting.gradient} pointer-events-none`}
          aria-hidden="true"
        />

        {/* Subtle animated gradient overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: 'linear-gradient(135deg, oklch(0.696 0.17 162.48 / 5%), transparent 60%)',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          aria-hidden="true"
        />

        <div className="relative p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4">
          {/* Header row */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <GreetingIcon className="h-5 w-5 text-primary" />
              </motion.div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {greeting.text} 👋
                </h2>
                <p className="text-xs text-muted-foreground">
                  {todayLinks > 0
                    ? `You've created ${todayLinks} link${todayLinks !== 1 ? 's' : ''} today`
                    : 'Ready to create some deep links?'}
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="rounded-md p-1 text-muted-foreground/50 hover:text-foreground hover:bg-accent/40 transition-colors"
              aria-label="Dismiss welcome card"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            {[
              {
                label: 'Create Link',
                icon: Link2,
                onClick: onCreateLink,
                color: 'text-primary hover:bg-primary/10',
              },
              {
                label: 'View Analytics',
                icon: BarChart3,
                onClick: onViewAnalytics,
                color: 'text-violet-400 hover:bg-violet-500/10',
              },
              {
                label: 'Export Data',
                icon: Download,
                onClick: onExportData,
                color: 'text-amber-400 hover:bg-amber-500/10',
              },
            ].map((action) => (
              <motion.button
                key={action.label}
                onClick={action.onClick}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium ${action.color} border border-border/20 transition-colors focus-visible-ring min-h-[36px]`}
              >
                <action.icon className="h-3.5 w-3.5" />
                {action.label}
              </motion.button>
            ))}
          </div>

          {/* Tip of the Day */}
          <div className="flex items-start gap-2.5 rounded-lg bg-background/30 p-3 border border-border/10">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10 shrink-0 mt-0.5">
              <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-medium text-amber-400/80 uppercase tracking-wider mb-0.5">
                Tip of the Day
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {TIPS[tipIndex]}
              </p>
            </div>
            <button
              onClick={handleNextTip}
              className="text-[10px] text-primary hover:text-primary/80 transition-colors shrink-0 mt-1"
              aria-label="Next tip"
            >
              Next →
            </button>
          </div>

          {/* Subtle sparkle decorations */}
          <Sparkles className="absolute top-3 right-12 h-3 w-3 text-primary/10" aria-hidden="true" />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
