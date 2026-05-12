'use client'

import { useLinkStore } from '@/store/link-store'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/components/landing/navbar'
import Hero from '@/components/landing/hero'
import Platforms from '@/components/landing/platforms'
import Features from '@/components/landing/features'
import AIRouting from '@/components/landing/ai-routing'
import DashboardPreview from '@/components/landing/dashboard-preview'
import AnalyticsPreview from '@/components/landing/analytics-preview'
import Pricing from '@/components/landing/pricing'
import Testimonials from '@/components/landing/testimonials'
import FAQ from '@/components/landing/faq'
import Footer from '@/components/landing/footer'
import { DashboardMain } from '@/components/dashboard/dashboard-main'
import { ThemeToggle } from '@/components/dashboard/theme-toggle'
import { ArrowLeft, Sparkles, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CookieConsent } from '@/components/landing/cookie-consent'

function SectionDivider() {
  return <div className="section-divider mx-auto max-w-4xl" />
}

function LandingView({ onSwitchToDashboard }: { onSwitchToDashboard: () => void }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar onGetStarted={onSwitchToDashboard} />
      <main className="flex-1">
        <Hero onTryNow={onSwitchToDashboard} />
        <SectionDivider />
        <div id="platforms">
          <Platforms />
        </div>
        <SectionDivider />
        <div id="features">
          <Features />
        </div>
        <SectionDivider />
        <AIRouting />
        <SectionDivider />
        <DashboardPreview />
        <SectionDivider />
        <AnalyticsPreview />
        <SectionDivider />
        <div id="pricing">
          <Pricing />
        </div>
        <SectionDivider />
        <Testimonials />
        <SectionDivider />
        <div id="faq">
          <FAQ />
        </div>
      </main>
      <Footer />
      <CookieConsent />
    </div>
  )
}

function DashboardView({ onSwitchToLanding }: { onSwitchToLanding: () => void }) {
  return (
    <div className="min-h-screen flex flex-col bg-background mesh-gradient-subtle">
      {/* Dashboard header with gradient bottom border */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/80 gradient-border-bottom">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSwitchToLanding}
              className="btn-ghost-shine text-muted-foreground hover:text-foreground focus-visible-ring"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div className="h-6 w-px bg-border" />
            {/* Shared logo element with layoutId for morph animation */}
            <motion.div layoutId="linkverse-logo" className="flex items-center gap-2">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25">
                <Link2 className="size-4 text-emerald-400" />
              </div>
              <h1 className="text-lg font-semibold gradient-text">LinkVerse</h1>
            </motion.div>
            <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium">AI Active</span>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <DashboardMain />
      </main>
    </div>
  )
}

export default function Home() {
  const { activeView, setActiveView } = useLinkStore()

  return (
    <AnimatePresence mode="wait">
      {activeView === 'landing' ? (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <LandingView onSwitchToDashboard={() => setActiveView('dashboard')} />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <DashboardView onSwitchToLanding={() => setActiveView('landing')} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
