'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Layers, Keyboard, Zap, Shield, Activity, Search, Command, Link2, BarChart3, Clock, Radio, Settings, HeartPulse, Timer, BookOpen, Bell, Moon, Download, Globe, GitBranch, Gauge, Wrench, Share2, ShieldCheck } from 'lucide-react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
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
import { KeyboardShortcuts, ShortcutsHelpButton } from './keyboard-shortcuts'
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
import { LinkInsights } from './link-insights'
import { LinkSearch } from './link-search'
import { DeepLinkTester } from './deep-link-tester'
import { LinkClusters } from './link-clusters'
import { WelcomeCard } from './welcome-card'
import { LinkHeatmap } from './link-heatmap'
import { UrlBuilder } from './url-builder'
import { RedirectChain } from './redirect-chain'
import { UsageQuota } from './usage-quota'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { useLinkStore } from '@/store/link-store'
import { useAuthStore } from '@/store/auth-store'
import { useTheme } from 'next-themes'

type SectionId = 'input' | 'analytics' | 'history' | 'tools' | 'admin' | 'settings'

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
      ease: [0.25, 0.46, 0.45, 0.94] as const,
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
  settings: 'from-violet-500/[0.02] to-transparent',
  admin: 'from-amber-500/[0.02] to-transparent',
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
  const [whatsNewDismissed, setWhatsNewDismissed] = useState(false)
  const [statGlowKey, setStatGlowKey] = useState(0)
  const { inputUrl, analytics, addNotification, history } = useLinkStore()
  const { user } = useAuthStore()
  const { theme, setTheme } = useTheme()

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

  const handleToggleDarkMode = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  const handleExportData = useCallback(() => {
    setShowSettings(true)
  }, [])

  // Command palette shortcut (Cmd+K / Ctrl+K)
  // Note: Other shortcuts are handled by KeyboardShortcuts component
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

  // Trigger stat glow when values change
  const prevTotalLinks = useRef(totalLinks)
  const prevConversionRate = useRef(conversionRate)
  useEffect(() => {
    if (prevTotalLinks.current !== totalLinks || prevConversionRate.current !== conversionRate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatGlowKey(k => k + 1)
      prevTotalLinks.current = totalLinks
      prevConversionRate.current = conversionRate
    }
  }, [totalLinks, conversionRate])

  // Handle section navigation with background color shift
  const handleSectionNav = useCallback((sectionId: SectionId) => {
    setActiveSection(sectionId)
    setSectionTransition(sectionId)
    document.getElementById(`section-${sectionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const handleViewAnalytics = useCallback(() => {
    handleSectionNav('analytics')
  }, [handleSectionNav])

  const handleViewHistory = useCallback(() => {
    handleSectionNav('history')
  }, [handleSectionNav])

  const handleNewLink = useCallback(() => {
    handleFocusInput()
  }, [handleFocusInput])

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
    <div className="min-h-screen w-full mesh-gradient scroll-smooth relative transition-colors duration-700">
      {/* Dot pattern background */}
      <div className="fixed inset-0 dot-grid opacity-50 pointer-events-none" aria-hidden="true" />

      {/* Section background color shift */}
      <div
        className={`fixed inset-0 bg-linear-to-b ${sectionBgColors[sectionTransition] || ''} pointer-events-none transition-opacity duration-700`}
        aria-hidden="true"
      />

      {/* Quick Tips tooltip on first visit */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.5 }}
          className="fixed bottom-6 left-6 z-30 max-w-xs hidden lg:block"
        >
          <div className="glass-card p-3 rounded-lg border-glow">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-xs font-semibold text-foreground">Quick Tip</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Press <kbd className="px-1 py-0.5 rounded bg-muted/60 text-[9px] font-mono border border-border/30">⌘K</kbd> to open the command palette for quick actions.
            </p>
          </div>
        </motion.div>
      )}

      <OnboardingOverlay />

      <div className="flex">
        {/* Sidebar - visible on lg+ screens */}
        <DashboardSidebar
          activeSection={activeSection}
          onSectionChange={handleSidebarNav}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0 mx-auto max-w-6xl px-3 sm:px-6 lg:px-8 py-4 sm:py-10 space-y-4 sm:space-y-8 relative z-10">
          {/* Header */}
          <motion.div
            custom={0}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4"
          >
            <div className="flex items-center gap-2 hover-lift cursor-default">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold gradient-text tracking-tight">
                LinkVerse
              </h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {/* Command Palette Trigger */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCommandPalette(true)}
                className="animate-cmdk-glow flex items-center gap-2 rounded-xl bg-background/50 border border-white/10 dark:border-white/5 shadow-sm hover:shadow-md px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-all cursor-pointer focus-visible-ring min-h-[40px] hover-lift"
              >
                <Search className="h-4 w-4 text-primary/70" />
                <span className="hidden sm:inline tracking-wide">Search commands...</span>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground/80 border border-border/30">
                  <Command className="h-3 w-3" />K
                </kbd>
              </motion.button>
              {/* Notification Center */}
              <NotificationCenter />
              {/* API Docs Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowApiDocs(true)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground hover:text-foreground transition-colors focus-visible-ring"
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
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground hover:text-foreground transition-colors focus-visible-ring"
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
            className="glass-card rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 overflow-x-auto scrollbar-none gradient-stat-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/10 dark:border-white/5 hover-lift"
          >
            <div className="flex items-center gap-3 sm:gap-5 text-xs shrink-0">
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <motion.span
                  key={`links-${statGlowKey}`}
                  className="text-foreground font-medium animate-stat-glow"
                  initial={false}
                >
                  {totalLinks.toLocaleString()}
                </motion.span>
                <span className="text-muted-foreground hidden sm:inline">links</span>
              </div>
              <div className="h-3 w-px bg-border/40 hidden sm:block" />
              <div className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-violet-400" />
                <motion.span
                  key={`conv-${statGlowKey}`}
                  className="text-foreground font-medium animate-stat-glow"
                  initial={false}
                >
                  {conversionRate}%
                </motion.span>
                <span className="text-muted-foreground hidden sm:inline">conversion</span>
              </div>
              <div className="h-3 w-px bg-border/40 hidden sm:block" />
              <div className="flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-medium">Live</span>
              </div>
            </div>

            {/* What's New badge + Section Navigation (Mobile Only) */}
            <div className="flex items-center gap-2 shrink-0">
              {!whatsNewDismissed && (
                <Popover>
                  <PopoverTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="animate-whats-new-pulse flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary border border-primary/20 cursor-pointer focus-visible-ring"
                    >
                      <Bell className="h-3 w-3" />
                      What&apos;s New
                    </motion.button>
                  </PopoverTrigger>
                  <PopoverContent className="glass-card w-72 p-3 space-y-2" sideOffset={8}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">Recent Updates</span>
                      <button
                        onClick={() => setWhatsNewDismissed(true)}
                        className="text-[10px] text-muted-foreground hover:text-foreground transition-colors focus-visible-ring"
                      >
                        Dismiss
                      </button>
                    </div>
                    <div className="space-y-2">
                      {[
                        { title: 'Link Health Checker', desc: 'Monitor your link health in real-time', icon: HeartPulse },
                        { title: 'Link Scheduling', desc: 'Set expiry dates on generated links', icon: Timer },
                        { title: 'Export Dashboard', desc: 'Export your data in CSV or JSON format', icon: Layers },
                      ].map((item) => (
                        <div key={item.title} className="flex items-start gap-2 rounded-lg p-1.5 hover:bg-accent/30 transition-colors">
                          <item.icon className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[11px] font-medium text-foreground">{item.title}</p>
                            <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
              <div className="lg:hidden flex items-center gap-1 bg-muted/30 rounded-lg p-0.5">
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
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* --- CREATE SECTION --- */}
            {activeSection === 'input' && (
              <motion.div
                key="section-input"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 sm:space-y-8"
              >
                {/* Welcome Card */}
                <WelcomeCard
                  onCreateLink={handleFocusInput}
                  onViewAnalytics={handleViewAnalytics}
                  onExportData={handleExportData}
                />

                {/* Platform Quick Actions */}
                <PlatformQuickActions />

                {/* Smart Input Section */}
                <div id="section-input-area" className="relative">
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
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <button
                      onClick={() => setBulkOpen(true)}
                      className="btn-ghost-shine inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors focus-visible-ring min-h-[36px]"
                    >
                      <Layers className="h-3.5 w-3.5" />
                      Bulk Open
                    </button>
                    <button
                      onClick={() => setShowShortcuts(true)}
                      className="btn-ghost-shine inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors focus-visible-ring min-h-[36px]"
                    >
                      <Keyboard className="h-3.5 w-3.5" />
                      Shortcuts
                    </button>
                    <button
                      onClick={() => setShowHealthChecker(!showHealthChecker)}
                      className={`btn-ghost-shine inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs transition-colors focus-visible-ring min-h-[36px] ${
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
                      className="btn-ghost-shine inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors focus-visible-ring min-h-[36px]"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      API Docs
                    </button>
                  </div>
                </div>

                {/* Link Result Section */}
                <LinkResult />

                {/* Link Insights */}
                <LinkInsights />

                {/* Link Preview Simulator */}
                <LinkPreviewSimulator />

                {/* Gradient Divider */}
                <div className="flex items-center justify-center py-2">
                  <div className="h-px w-32 bg-linear-to-r from-transparent via-primary/30 to-transparent" />
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

                {/* Link Search & Filter */}
                <LinkSearch />
              </motion.div>
            )}

            {/* --- ANALYTICS SECTION --- */}
            {activeSection === 'analytics' && (
              <motion.div
                key="section-analytics"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-2"
              >
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-violet-400" />
                    <h2 className="text-lg font-semibold text-foreground">Analytics Overview</h2>
                  </div>
                  <AnalyticsCards />
                  <LinkHeatmap />
                  <LinkClusters />
                  <AnalyticsChart />
                  <PerformanceDashboard />
                  <MiniChart />
                </div>
              </motion.div>
            )}

            {/* --- HISTORY SECTION --- */}
            {activeSection === 'history' && (
              <motion.div
                key="section-history"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-2"
              >
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-emerald-400" />
                    <h2 className="text-lg font-semibold text-foreground">Link History</h2>
                  </div>
                  <LinkHistory />
                </div>
                <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-5 w-5 text-emerald-400" />
                    <h2 className="text-lg font-semibold text-foreground">Activity Feed</h2>
                  </div>
                  <ActivityFeed />
                </div>
              </motion.div>
            )}

            {/* --- TOOLS SECTION --- */}
            {activeSection === 'tools' && (
              <motion.div
                key="section-tools"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 sm:space-y-6 mt-2"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-amber-400" />
                  <h2 className="text-lg font-semibold text-foreground">Tools & Utilities</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <UrlBuilder />
                  <RedirectChain />
                  <UsageQuota />
                  <LinkComparison />
                  <LinkHealthChecker />
                  <LinkScheduler />
                  <ExportPanel />
                  <DeepLinkTester />
                </div>
              </motion.div>
            )}

            {/* --- ADMIN SECTION --- */}
            {activeSection === 'admin' && user?.role === 'admin' && (
              <motion.div
                key="section-admin"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 sm:space-y-6 mt-2"
              >
                 <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-5 w-5 text-amber-400" />
                  <h2 className="text-lg font-semibold text-foreground">Admin Console</h2>
                </div>
                <AdminDashboard />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden glass-card border-t border-border/20 safe-area-bottom">
            <nav className="flex items-center justify-around px-2 py-1" role="navigation" aria-label="Mobile dashboard navigation">
              {SECTIONS.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionNav(section.id)}
                    className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors min-w-[56px] ${
                      activeSection === section.id
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    aria-current={activeSection === section.id ? 'page' : undefined}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[10px] font-medium">{section.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Enhanced Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-auto border-t border-border/20 pt-6 pb-20 lg:pb-8"
          >
            <div className="flex flex-col items-center gap-4">
              {/* Brand row */}
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary/60" />
                <span className="text-sm font-semibold gradient-text-green">LinkVerse</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono">v2.0</span>
              </div>

              {/* Feature badges */}
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground/50">
                <span className="flex items-center gap-1">
                  <Link2 className="h-2.5 w-2.5" />
                  13 Platforms
                </span>
                <span className="text-border/40">·</span>
                <span className="flex items-center gap-1">
                  <Zap className="h-2.5 w-2.5" />
                  AI-Powered
                </span>
                <span className="text-border/40">·</span>
                <span className="flex items-center gap-1">
                  <Shield className="h-2.5 w-2.5" />
                  SOC 2
                </span>
              </div>

              {/* Social links */}
              <div className="flex items-center gap-4">
                {[
                  { label: 'GitHub', icon: '⌘' },
                  { label: 'Twitter', icon: '𝕏' },
                  { label: 'Discord', icon: '◆' },
                  { label: 'Docs', icon: '📖' },
                ].map((social) => (
                  <button
                    key={social.label}
                    className="footer-social-link text-muted-foreground/40 hover:text-emerald-400 text-xs focus-visible-ring rounded"
                    aria-label={social.label}
                  >
                    <span className="text-sm">{social.icon}</span>
                  </button>
                ))}
              </div>

              {/* Copyright */}
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
        onViewAnalytics={handleViewAnalytics}
        onExportData={handleExportData}
        onToggleDarkMode={handleToggleDarkMode}
        onViewHistory={handleViewHistory}
        onNewLink={handleNewLink}
      />

      {/* Shortcuts Help Button */}
      <ShortcutsHelpButton onClick={() => setShowShortcuts(true)} />

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
                    { icon: Moon, label: 'Toggle Theme', desc: 'Switch light/dark mode', actionId: 'toggleDarkMode' as const },
                    { icon: Download, label: 'Export Data', desc: 'Export links and analytics', actionId: 'exportData' as const },
                    { icon: Globe, label: 'Link Clusters', desc: 'View link groups by platform', actionId: 'viewClusters' as const },
                    { icon: Wrench, label: 'URL Builder', desc: 'Build deep link URLs visually', actionId: 'urlBuilder' as const },
                    { icon: GitBranch, label: 'Redirect Tracer', desc: 'Trace URL redirect chains', actionId: 'redirectTracer' as const },
                    { icon: Gauge, label: 'Usage Quota', desc: 'View usage and plan limits', actionId: 'usageQuota' as const },
                    { icon: Share2, label: 'Share Link', desc: 'Create a shareable link URL', actionId: 'shareLink' as const },
                  ].map((cmd) => (
                    <button
                      key={cmd.label}
                      onClick={() => {
                        if (cmd.actionId === 'openInApp') handleOpenInApp()
                        else if (cmd.actionId === 'focusInput') handleFocusInput()
                        else if (cmd.actionId === 'showShortcuts') setShowShortcuts(true)
                        else if (cmd.actionId === 'bulkOpen') setBulkOpen(true)
                        else if (cmd.actionId === 'viewAnalytics') handleViewAnalytics()
                        else if (cmd.actionId === 'healthCheck') setShowHealthChecker(true)
                        else if (cmd.actionId === 'apiDocs') setShowApiDocs(true)
                        else if (cmd.actionId === 'settings') setShowSettings(true)
                        else if (cmd.actionId === 'toggleDarkMode') handleToggleDarkMode()
                        else if (cmd.actionId === 'exportData') handleExportData()
                        else if (cmd.actionId === 'viewClusters') handleSectionNav('analytics')
                        else if (cmd.actionId === 'urlBuilder' || cmd.actionId === 'redirectTracer' || cmd.actionId === 'usageQuota' || cmd.actionId === 'shareLink') handleSectionNav('tools')
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
