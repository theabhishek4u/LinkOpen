'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { SmartInput } from './smart-input'
import { LinkResult } from './link-result'
import { QRGenerator } from './qr-generator'
import { LinkHistory } from './link-history'
import { AnalyticsCards } from './analytics-cards'
import { MiniChart } from './mini-chart'

export function DashboardMain() {
  return (
    <div className="min-h-screen w-full mesh-gradient-subtle">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-2"
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">
              LinkVerse
            </h1>
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            AI-powered deep linking for every social platform
          </p>
        </motion.div>

        {/* Smart Input Section */}
        <SmartInput />

        {/* Link Result Section */}
        <LinkResult />

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
          className="text-center py-4 mt-auto"
        >
          <p className="text-xs text-muted-foreground/50">
            LinkVerse &mdash; Deep linking made simple
          </p>
        </motion.footer>
      </div>

      {/* QR Code Dialog */}
      <QRGenerator />
    </div>
  )
}
