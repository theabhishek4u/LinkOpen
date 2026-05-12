'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Layers, Keyboard, Zap, Shield, Activity, Search, Command, Link2, BarChart3, Clock, Radio, Settings, HeartPulse, Timer, BookOpen } from 'lucide-react'
import { SmartInput, SmartInputHandle } from './smart-input'
import { LinkResult } from './link-result'
import { QRGenerator } from './qr-generator'
import { LinkHistory } from './link-history'
import { AnalyticsCards } from './analytics-cards'
import { MiniChart } from './mini-chart'
import { AnalyticsChart } from './analytics-chart'
import { UrlSuggestions } from './url-suggestions'
import { ThemeToggle } from './theme-toggle'
import { BulkOpener } from './bulk-opener'
import { KeyboardShortcuts } from './keyboard-shortcuts'
import { PlatformQuickActions } from './platform-quick-actions'
import { ActivityFeed } from './activity-feed'
import { OnboardingOverlay } from './onboarding-overlay'
import { LinkHealthChecker } from './link-health-checker'
import { LinkScheduler } from './link-scheduler'
import { SettingsPanel } from './settings-panel'
import { ExportPanel } from './export-panel'
import { NotificationCenter } from './notification-center'
import { LinkPreviewSimulator } from './link-preview-simulator'
import { CustomAlias } from './custom-alias'
import { CategorySelector } from './link-categories'
import { DashboardSkeleton } from './dashboard-skeleton'
import { DashboardSidebar, type SidebarSection } from './dashboard-sidebar'
import { LinkComparison } from './link-comparison'
import { BatchOperationsBar } from './batch-operations'
import { PerformanceDashboard } from './performance-dashboard'
import { ApiDocsModal } from './api-docs-modal'
import { useLinkStore } from '@/store/link-store'

type SectionId = 'input' | 'analytics' | 'history' | 'tools'

const SECTIONS = [
  { id: 'input' as const, label: 'Create', icon: Link2 },
  { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
  { id: 'tools' as const, label: 'Tools', icon: Shield },
  { id: 'history' as const, label: 'History', icon: Clock },
]

// Staggered animation variants
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.08,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
}

// Background color shift per section
const sectionBgColors: Record<SectionId, string> = {
  input: '',
  analytics: 'from-violet-500/[0.02] to-transparent',
  tools: 'from-amber-500/[0.02] to-transparent',
  history: 'from-emerald-500/[0.02] to-transparent',
}

export function DashboardMain() {
  const smartInputRef = useRef<SmartInputHandle>(null)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showHealthChecker, setShowHealthChecker] = useState(false)
  const [showApiDocs, setShowApiDocs] = useState(false)
  const [activeSection, setActiveSection] = useState<SectionId>('input')
  const [isLoading, setIsLoading] = useState(true)
  const [sectionTransition, setSectionTransition] = useState<SectionId>('input')
  const { inputUrl, analytics, addNotification, history } = useLinkStore()

  // Loading skeleton with 1.5s delay
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleFocusInput = useCallback(() => {
    smartInputRef.current?.focus()
  }, [])

  const handleOpenInApp = useCallback(() => {
    smartInputRef.current?.openInApp()
  }, [])

  const handleCopyLink = useCallback(() => {
    smartInputRef.current?.copyLink()
  }, [])

  const handleGenerateQR = useCallback(() => {
    smartInputRef.current?.generateQR()
  }, [])

  // Command palette shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowCommandPalette(prev => !prev)
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Milestone notifications
  useEffect(() => {
    const linkCount = history.length
    const milestones = [1, 5, 10, 25, 50, 100]
    if (milestones.includes(linkCount)) {
      addNotification({
        type: 'milestone',
        title: '🎉 Milestone Reached!',
        description: `You've generated ${linkCount} links! Keep it up!`,
      })
    }
  }, [history.length, addNotification])

  // Quick stats for floating bar
  const totalLinks = analytics.totalLinks || 1247
  const nativeOpens = analytics.nativeOpens || 892
  const conversionRate = totalLinks > 0
    ? ((nativeOpens / (nativeOpens + (analytics.browserOpens || 355))) * 100).toFixed(1)
    : '94.2'

  // Handle section navigation with background color shift
  const handleSectionNav = useCallback((sectionId: SectionId) => {
    setActiveSection(sectionId)
    setSectionTransition(sectionId)
    document.getElementById(`section-${sectionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  // Handle sidebar section navigation
  const handleSidebarNav = useCallback((sectionId: SidebarSection) => {
    if (sectionId === 'settings') {
      setShowSettings(true)
      return
    }
    setActiveSection(sectionId)
    setSectionTransition(sectionId)
    document.getElementById(`section-${sectionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="min-h-screen w-full mesh-gradient-subtle scroll-smooth relative transition-colors duration-700">
      {/* Section background color shift */}
      <div
        className={`fixed inset-0 bg-gradient-to-b ${sectionBgColors[sectionTransition] || ''} pointer-events-none transition-opacity duration-700`}
        aria-hidden="true"
      />

      <OnboardingOverlay />

      <div className="flex">
        {/* Sidebar - visible on lg+ screens */}
        <DashboardSidebar
          activeSection={activeSection}
          onSectionChange={handleSidebarNav}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 relative z-10">
          {/* Header */}
          <motion.div
            custom={0}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-bold gradient-text">
                LinkVerse
              </h1>
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex items-center gap-2">
              {/* Command Palette Trigger */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCommandPalette(true)}
                className="animate-cmdk-glow flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus-visible-ring"
              >
                <Search className="h-3 w-3" />
                <span className="hidden sm:inline">Search commands...</span>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded bg-background/50 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground/60 border border-border/30">
                  <Command className="h-2.5 w-2.5" />K
                </kbd>
              </motion.button>
              {/* Notification Center */}
              <NotificationCenter />
              {/* API Docs Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowApiDocs(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground hover:text-foreground transition-colors focus-visible-ring"
                aria-label="API Documentation"
                title="API Docs"
              >
                <BookOpen className="h-4 w-4" />
              </motion.button>
              {/* Settings Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSettings(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground hover:text-foreground transition-colors focus-visible-ring"
                aria-label="Open settings"
              >
                <Settings className="h-4 w-4" />
              </motion.button>
              <ThemeToggle />
            </div>
          </motion.div>

          {/* Quick Stats Floating Bar */}
          <motion.div
            custom={1}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="glass-card rounded-xl p-2.5 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none"
          >
            <div className="flex items-center gap-3 sm:gap-5 text-xs shrink-0">
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span className="text-foreground font-medium">{totalLinks.toLocaleString()}</span>
                <span className="text-muted-foreground hidden sm:inline">links</span>
              </div>
              <div className="h-3 w-px bg-border/40" />
              <div className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-violet-400" />
                <span className="text-foreground font-medium">{conversionRate}%</span>
                <span className="text-muted-foreground hidden sm:inline">conversion</span>
              </div>
              <div className="h-3 w-px bg-border/40" />
              <div className="flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-medium">Live</span>
              </div>
            </div>

            {/* Section Navigation */}
            <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-0.5 shrink-0">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionNav(section.id)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all focus-visible-ring ${
                    activeSection === section.id
                      ? 'bg-accent text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <section.icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{section.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Platform Quick Actions */}
          <motion.div
            custom={2}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            <PlatformQuickActions />
          </motion.div>

          {/* Smart Input Section */}
          <motion.div
            custom={3}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            id="section-input"
            className="relative"
          >
            <SmartInput ref={smartInputRef} />

            {/* URL Suggestions (only when input is empty) */}
            <UrlSuggestions />

            {/* Category selector */}
            <div className="mt-2">
              <CategorySelector />
            </div>

            {/* Custom Alias */}
            <div className="mt-2">
              <CustomAlias />
            </div>

            {/* Extra action buttons row */}
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center gap-2 mt-3"
            >
              <button
                onClick={() => setBulkOpen(true)}
                className="btn-ghost-shine inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors focus-visible-ring"
              >
                <Layers className="h-3.5 w-3.5" />
                Bulk Open
              </button>
              <button
                onClick={() => setShowShortcuts(true)}
                className="btn-ghost-shine inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors focus-visible-ring"
              >
                <Keyboard className="h-3.5 w-3.5" />
                Shortcuts
              </button>
              <button
                onClick={() => setShowHealthChecker(!showHealthChecker)}
                className={`btn-ghost-shine inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors focus-visible-ring ${
                  showHealthChecker
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
                }`}
              >
                <HeartPulse className="h-3.5 w-3.5" />
                Health Check
              </button>
              <button
                onClick={() => setShowApiDocs(true)}
                className="btn-ghost-shine inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors focus-visible-ring"
              >
                <BookOpen className="h-3.5 w-3.5" />
                API Docs
              </button>
            </motion.div>
          </motion.div>

          {/* Link Result Section */}
          <motion.div
            custom={4}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            <LinkResult />
          </motion.div>

          {/* Link Preview Simulator */}
          <motion.div
            custom={5}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            <LinkPreviewSimulator />
          </motion.div>

          {/* Gradient Divider */}
          <div className="flex items-center justify-center py-2">
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </div>

          {/* Health Checker (toggleable) */}
          <AnimatePresence>
            {showHealthChecker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <LinkHealthChecker urlToCheck={inputUrl} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Two-Column Layout */}
          <div id="section-analytics" className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left Column (wider) */}
            <motion.div
              custom={6}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-2 space-y-4 sm:space-y-6"
            >
              <AnalyticsCards />
              <AnalyticsChart />
              <PerformanceDashboard />
              <MiniChart />
            </motion.div>

            {/* Right Column (narrower) */}
            <motion.div
              custom={7}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              id="section-history"
              className="lg:col-span-1 space-y-4 sm:space-y-6"
            >
              <LinkHistory />
              <ActivityFeed />
            </motion.div>
          </div>

          {/* Tools Section */}
          <motion.div
            custom={8}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            id="section-tools"
            className="space-y-4 sm:space-y-6"
          >
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Tools & Utilities</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <LinkComparison />
              <LinkHealthChecker />
              <LinkScheduler />
              <ExportPanel />
            </div>
          </motion.div>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center py-6 mt-auto border-t border-border/20"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary/60" />
                <span className="text-sm font-medium gradient-text-green">LinkVerse</span>
              </div>
              <p className="text-xs text-muted-foreground/40">
                Intelligent deep linking platform &middot; 13 platforms &middot; AI-powered detection
              </p>
              <p className="text-[10px] text-muted-foreground/25">
                &copy; {new Date().getFullYear()} LinkVerse. All rights reserved.
              </p>
            </div>
          </motion.footer>
        </div>
      </div>

      {/* QR Code Dialog */}
      <QRGenerator />

      {/* Bulk Opener Dialog */}
      <BulkOpener open={bulkOpen} onOpenChange={setBulkOpen} />

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts
        onShowShortcuts={showShortcuts}
        onCloseShortcuts={() => setShowShortcuts(false)}
        onFocusInput={handleFocusInput}
        onOpenInApp={handleOpenInApp}
        onCopyLink={handleCopyLink}
        onGenerateQR={handleGenerateQR}
      />

      {/* Settings Panel */}
      <SettingsPanel open={showSettings} onOpenChange={setShowSettings} />

      {/* API Docs Modal */}
      <ApiDocsModal open={showApiDocs} onOpenChange={setShowApiDocs} />

      {/* Batch Operations Bar */}
      <BatchOperationsBar />

      {/* Command Palette Modal */}
      <AnimatePresence>
        {showCommandPalette && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
              onClick={() => setShowCommandPalette(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="fixed top-[20%] left-1/2 -translate-x-1/2 z-50 w-full max-w-lg"
            >
              <div className="glass-card rounded-xl border border-border/30 overflow-hidden shadow-2xl">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border/20">
                  <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    placeholder="Type a command..."
                    className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible-ring"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setShowCommandPalette(false)
                      if (e.key === 'Enter') {
                        setShowCommandPalette(false)
                      }
                    }}
                  />
                  <kbd className="rounded bg-muted/50 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground/60 border border-border/30">
                    ESC
                  </kbd>
                </div>
                <div className="p-2 max-h-64 overflow-y-auto">
                  {[
                    { icon: Link2, label: 'Open in App', desc: 'Generate and open deep link', actionId: 'openInApp' as const },
                    { icon: Search, label: 'Focus Input', desc: 'Jump to URL input field', actionId: 'focusInput' as const },
                    { icon: Keyboard, label: 'Show Shortcuts', desc: 'View keyboard shortcuts', actionId: 'showShortcuts' as const },
                    { icon: Layers, label: 'Bulk Open', desc: 'Open multiple links at once', actionId: 'bulkOpen' as const },
                    { icon: BarChart3, label: 'View Analytics', desc: 'Open full analytics dashboard', actionId: 'viewAnalytics' as const },
                    { icon: HeartPulse, label: 'Health Check', desc: 'Check link health status', actionId: 'healthCheck' as const },
                    { icon: BookOpen, label: 'API Docs', desc: 'View API documentation', actionId: 'apiDocs' as const },
                    { icon: Settings, label: 'Settings', desc: 'Open settings panel', actionId: 'settings' as const },
                  ].map((cmd) => (
                    <button
                      key={cmd.label}
                      onClick={() => {
                        if (cmd.actionId === 'openInApp') handleOpenInApp()
                        else if (cmd.actionId === 'focusInput') handleFocusInput()
                        else if (cmd.actionId === 'showShortcuts') setShowShortcuts(true)
                        else if (cmd.actionId === 'bulkOpen') setBulkOpen(true)
                        else if (cmd.actionId === 'healthCheck') setShowHealthChecker(true)
                        else if (cmd.actionId === 'apiDocs') setShowApiDocs(true)
                        else if (cmd.actionId === 'settings') setShowSettings(true)
                        setShowCommandPalette(false)
                      }}
                      className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-accent/50 transition-colors group focus-visible-ring"
                    >
                      <cmd.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{cmd.label}</p>
                        <p className="text-[10px] text-muted-foreground/50">{cmd.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
