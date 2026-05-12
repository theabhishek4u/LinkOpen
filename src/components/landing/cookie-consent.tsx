'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, ShieldCheck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'linkverse-cookies-accepted'

export function CookieConsent() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return !stored
    } catch {
      return true
    }
  })
  const [dismissed, setDismissed] = useState(false)

  const handleAccept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'accepted')
    } catch {
      // Ignore storage errors
    }
    setDismissed(true)
    setTimeout(() => setVisible(false), 400)
  }

  const handleDecline = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'declined')
    } catch {
      // Ignore storage errors
    }
    setDismissed(true)
    setTimeout(() => setVisible(false), 400)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
        >
          <div
            className={`mx-auto max-w-2xl glass-card rounded-xl p-4 sm:p-5 shadow-2xl border border-border/30 transition-opacity duration-400 ${
              dismissed ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Icon & Message */}
              <div className="flex items-start gap-3 flex-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <Cookie className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-foreground">We use cookies</h4>
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500/60" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    We use cookies to enhance your experience, remember your preferences, and analyze usage patterns.
                    By continuing to use LinkVerse, you agree to our cookie policy.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <Button
                  onClick={handleDecline}
                  variant="ghost"
                  size="sm"
                  className="flex-1 sm:flex-initial text-xs text-muted-foreground hover:text-foreground h-8"
                >
                  Decline
                </Button>
                <Button
                  onClick={handleAccept}
                  size="sm"
                  className="flex-1 sm:flex-initial text-xs h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-sm shadow-emerald-500/25"
                >
                  Accept All
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
