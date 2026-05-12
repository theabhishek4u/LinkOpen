'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Link2, ExternalLink, BarChart3, ArrowRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ONBOARDING_KEY = 'linkverse-onboarding-complete'

interface OnboardingStep {
  title: string
  description: string
  icon: React.ReactNode
  accent: string
}

const STEPS: OnboardingStep[] = [
  {
    title: 'Welcome to LinkVerse',
    description:
      'The AI-powered deep linking platform that connects your social media links directly to native apps. No more browser redirects.',
    icon: (
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute"
        >
          <div className="h-20 w-20 rounded-full border border-primary/20 border-dashed" />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles className="h-10 w-10 text-primary" />
        </motion.div>
        {/* Floating mini icons */}
        <motion.div
          className="absolute -top-2 -right-4"
          animate={{ y: [-3, 3, -3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-lg">📸</span>
        </motion.div>
        <motion.div
          className="absolute -bottom-2 -left-4"
          animate={{ y: [3, -3, 3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-lg">▶️</span>
        </motion.div>
        <motion.div
          className="absolute top-1 -left-6"
          animate={{ y: [-2, 2, -2] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          <span className="text-lg">💬</span>
        </motion.div>
        <motion.div
          className="absolute bottom-1 -right-6"
          animate={{ y: [2, -2, 2] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        >
          <span className="text-lg">🎵</span>
        </motion.div>
      </div>
    ),
    accent: '#10b981',
  },
  {
    title: 'Paste Any Link',
    description:
      'Simply paste a social media URL into the smart input field. Our AI instantly detects the platform and prepares a deep link for you.',
    icon: (
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{ scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="glass-card p-4 rounded-xl"
        >
          <Link2 className="h-10 w-10 text-primary" />
        </motion.div>
        {/* Cursor-like animation */}
        <motion.div
          className="absolute top-0 right-0"
          animate={{ opacity: [0, 1, 1, 0], y: [0, 5, 5, 10] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-3 h-5 bg-foreground/80 rounded-sm" style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }} />
        </motion.div>
      </div>
    ),
    accent: '#8b5cf6',
  },
  {
    title: 'Open in Native App',
    description:
      'With one click, your link opens directly in the native app — Instagram, YouTube, TikTok, and 10+ more platforms supported.',
    icon: (
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ExternalLink className="h-10 w-10 text-emerald-400" />
        </motion.div>
        {/* Orbiting dots */}
        <motion.div
          className="absolute h-3 w-3 rounded-full bg-emerald-400/60"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '28px center' }}
        />
        <motion.div
          className="absolute h-2 w-2 rounded-full bg-violet-400/60"
          animate={{ rotate: -360 }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '32px center' }}
        />
      </div>
    ),
    accent: '#10b981',
  },
  {
    title: 'Track Everything',
    description:
      'Monitor your link performance with real-time analytics. See native vs browser opens, platform distribution, and conversion rates.',
    icon: (
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <BarChart3 className="h-10 w-10 text-amber-400" />
        </motion.div>
        {/* Mini chart bars animating */}
        <div className="absolute -bottom-3 flex items-end gap-0.5">
          {[6, 10, 8, 14, 11, 16, 12].map((h, i) => (
            <motion.div
              key={i}
              className="w-1 rounded-t bg-emerald-400/50"
              animate={{ height: [h * 0.5, h, h * 0.5] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.12,
              }}
            />
          ))}
        </div>
      </div>
    ),
    accent: '#f59e0b',
  },
]

export function OnboardingOverlay() {
  const [show, setShow] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    // Check if onboarding has been completed
    try {
      const completed = localStorage.getItem(ONBOARDING_KEY)
      if (!completed) {
        // Delay showing to let the page load
        const timer = setTimeout(() => setShow(true), 800)
        return () => clearTimeout(timer)
      }
    } catch {
      // If localStorage is not available, don't show
    }
  }, [])

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }, [currentStep])

  const handleSkip = useCallback(() => {
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true')
    } catch {
      // ignore
    }
    setShow(false)
  }, [])

  const handleGetStarted = useCallback(() => {
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true')
    } catch {
      // ignore
    }
    setShow(false)
  }, [])

  if (!show) return null

  const step = STEPS[currentStep]
  const isLastStep = currentStep === STEPS.length - 1

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleSkip}
          />

          {/* Content Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative z-10 glass-card p-6 sm:p-8 rounded-2xl max-w-md w-full space-y-6"
          >
            {/* Skip Button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 text-center"
              >
                {/* Icon / Illustration */}
                <div className="flex justify-center py-4">
                  {step.icon}
                </div>

                {/* Title */}
                <h2 className="text-xl sm:text-2xl font-bold gradient-text">
                  {step.title}
                </h2>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Progress Dots */}
            <div className="flex items-center justify-center gap-2">
              {STEPS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className="transition-all duration-300"
                >
                  <motion.div
                    animate={{
                      width: idx === currentStep ? 24 : 8,
                      backgroundColor:
                        idx === currentStep
                          ? step.accent
                          : idx < currentStep
                          ? 'rgba(255,255,255,0.3)'
                          : 'rgba(255,255,255,0.1)',
                    }}
                    className="h-2 rounded-full"
                    transition={{ duration: 0.3 }}
                  />
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Skip
              </Button>

              {isLastStep ? (
                <Button
                  onClick={handleGetStarted}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green-sm btn-glow gap-2"
                >
                  Get Started
                  <Sparkles className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  variant="outline"
                  className="gap-2 border-border/30 glass-card"
                >
                  Next
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
