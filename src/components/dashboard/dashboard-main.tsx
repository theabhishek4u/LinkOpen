'use client'

import { useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Layers, Keyboard, Zap, Shield, Activity } from 'lucide-react'
import { SmartInput, SmartInputHandle } from './smart-input'
import { LinkResult } from './link-result'
import { QRGenerator } from './qr-generator'
import { LinkHistory } from './link-history'
import { AnalyticsCards } from './analytics-cards'
import { MiniChart } from './mini-chart'
import { ThemeToggle } from './theme-toggle'
import { BulkOpener } from './bulk-opener'
import { KeyboardShortcuts } from './keyboard-shortcuts'
import { useLinkStore } from '@/store/link-store'

export function DashboardMain() {
  const smartInputRef = useRef<SmartInputHandle>(null)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const { inputUrl } = useLinkStore()

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

  return (
    <div className="min-h-screen w-full mesh-gradient-subtle scroll-smooth">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
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
            <ThemeToggle />
          </div>
        </motion.div>

        {/* Quick Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-muted-foreground"
        >
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span>13 Platforms</span>
          </div>
          <div className="h-3 w-px bg-border/40" />
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            <span>AI-Powered</span>
          </div>
          <div className="h-3 w-px bg-border/40" />
          <div className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-amber-400" />
            <span>Real-time Detection</span>
          </div>
          <div className="h-3 w-px bg-border/40" />
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-emerald-400" />
            <span>Secure</span>
          </div>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto text-center"
        >
          AI-powered deep linking for every social platform
        </motion.p>

        {/* Smart Input Section */}
        <div className="relative">
          <SmartInput ref={smartInputRef} />

          {/* Extra action buttons row */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-2 mt-3"
          >
            <button
              onClick={() => setBulkOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
            >
              <Layers className="h-3.5 w-3.5" />
              Bulk Open
            </button>
            <button
              onClick={() => setShowShortcuts(true)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
            >
              <Keyboard className="h-3.5 w-3.5" />
              Shortcuts
            </button>
          </motion.div>
        </div>

        {/* Link Result Section */}
        <LinkResult />

        {/* Gradient Divider */}
        <div className="flex items-center justify-center py-2">
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column (wider) */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <AnalyticsCards />
            <MiniChart />
          </div>

          {/* Right Column (narrower) */}
          <div className="lg:col-span-1">
            <LinkHistory />
          </div>
        </div>

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
    </div>
  )
}
