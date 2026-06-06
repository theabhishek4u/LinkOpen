'use client'

import { useLinkStore } from '@/store/link-store'
import { useAuthStore } from '@/store/auth-store'
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
import { ArrowLeft, Sparkles, Link2, ShieldCheck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
// CookieConsent is handled within the Footer component
import { UserMenu } from '@/components/auth/user-menu'
import { LoginForm } from '@/components/auth/login-form'
import { RegisterForm } from '@/components/auth/register-form'
import { AdminPanel } from '@/components/admin/admin-panel'
import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

function SectionDivider() {
  return <div className="section-divider mx-auto max-w-4xl" />
}

function LandingView({ onSwitchToDashboard }: { onSwitchToDashboard: () => void }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar onGetStarted={onSwitchToDashboard} />
      <main className="flex-1 shrink-0">
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
    </div>
  )
}


function DashboardView({ onSwitchToLanding }: { onSwitchToLanding: () => void }) {
  const { isAuthenticated, checkSession, user } = useAuthStore()
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [isChecking, setIsChecking] = useState(true)
  const [showAdminPanel, setShowAdminPanel] = useState(false)

  useEffect(() => {
    const verify = async () => {
      await checkSession()
      setIsChecking(false)
    }
    verify()
  }, [checkSession])

  // Loading state while checking session
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background mesh-gradient-subtle">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <div className="absolute -inset-2 rounded-2xl bg-emerald-500/10 animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium gradient-text">LinkVerse</p>
            <p className="text-xs text-muted-foreground">Checking authentication...</p>
          </div>
        </motion.div>
      </div>
    )
  }

  // If not authenticated, show auth forms
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background mesh-gradient-subtle p-4">
        <div className="w-full max-w-md">
          {/* Back to home button */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onSwitchToLanding}
              className="text-muted-foreground hover:text-foreground -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Home
            </Button>
          </motion.div>

          <AnimatePresence mode="wait">
            {authMode === 'login' ? (
              <LoginForm
                key="login"
                onSwitchToRegister={() => setAuthMode('register')}
              />
            ) : (
              <RegisterForm
                key="register"
                onSwitchToLogin={() => setAuthMode('login')}
              />
            )}
          </AnimatePresence>

          {/* Background decoration */}
          <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    )
  }

  // Authenticated: show the full dashboard
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
            <span className="text-xs text-emerald-400 font-medium hidden sm:inline">AI Active</span>
            {user?.role === 'admin' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdminPanel(true)}
                className="hidden sm:flex items-center gap-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 h-8 px-2.5 text-xs font-medium"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin
              </Button>
            )}
            <ThemeToggle />
            <UserMenu onOpenAdmin={() => setShowAdminPanel(true)} />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <DashboardMain />
      </main>

      {/* Admin Panel Overlay */}
      <AnimatePresence>
        {showAdminPanel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60]"
              onClick={() => setShowAdminPanel(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 260, damping: 25 }}
              className="fixed inset-2 sm:inset-4 lg:inset-8 z-[61] bg-background/95 backdrop-blur-xl rounded-xl border border-border/30 shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border/20 bg-background/80 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-semibold text-foreground">Admin Panel</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowAdminPanel(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                <AdminPanel onClose={() => setShowAdminPanel(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Home() {
  const { activeView, setActiveView } = useLinkStore()

  const handleSwitchToDashboard = () => {
    // DashboardView will handle auth checking and show login if needed
    setActiveView('dashboard')
  }

  const handleSwitchToLanding = () => {
    setActiveView('landing')
  }

  return (
    <AnimatePresence mode="wait">
      {activeView === 'landing' ? (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const }}
        >
          <LandingView onSwitchToDashboard={handleSwitchToDashboard} />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const }}
        >
          <DashboardView onSwitchToLanding={handleSwitchToLanding} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
