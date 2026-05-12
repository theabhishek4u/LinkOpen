'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Keyboard, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface KeyboardShortcutsProps {
  onShowShortcuts: boolean
  onCloseShortcuts: () => void
  onFocusInput: () => void
  onOpenInApp: () => void
  onCopyLink: () => void
  onGenerateQR: () => void
}

const SHORTCUTS = [
  { keys: ['Ctrl', 'K'], description: 'Focus input' },
  { keys: ['Ctrl', '↵'], description: 'Open in app' },
  { keys: ['Ctrl', 'C'], description: 'Copy link' },
  { keys: ['Ctrl', 'Q'], description: 'Generate QR code' },
  { keys: ['Ctrl', '/'], description: 'Show shortcuts' },
]

export function KeyboardShortcuts({
  onShowShortcuts,
  onCloseShortcuts,
  onFocusInput,
  onOpenInApp,
  onCopyLink,
  onGenerateQR,
}: KeyboardShortcutsProps) {
  const [toggledByKeyboard, setToggledByKeyboard] = useState(false)

  const visible = onShowShortcuts || toggledByKeyboard

  const handleClose = useCallback(() => {
    setToggledByKeyboard(false)
    onCloseShortcuts()
  }, [onCloseShortcuts])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey

      if (mod && e.key === 'k') {
        e.preventDefault()
        onFocusInput()
      } else if (mod && e.key === 'Enter') {
        e.preventDefault()
        onOpenInApp()
      } else if (mod && e.key === 'q') {
        e.preventDefault()
        onGenerateQR()
      } else if (mod && e.key === '/') {
        e.preventDefault()
        setToggledByKeyboard((prev) => !prev)
      } else if (e.key === 'Escape' && visible) {
        handleClose()
      }
    },
    [onFocusInput, onOpenInApp, onGenerateQR, visible, handleClose]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="glass-card p-6 w-full max-w-sm pointer-events-auto space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Keyboard className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Keyboard Shortcuts</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Shortcuts List */}
              <div className="space-y-2">
                {SHORTCUTS.map((shortcut) => (
                  <div
                    key={shortcut.description}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/30 transition-colors"
                  >
                    <span className="text-sm text-foreground/80">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <kbd className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-md border border-border/50 bg-muted/50 px-1.5 text-[10px] font-mono text-muted-foreground">
                            {key}
                          </kbd>
                          {i < shortcut.keys.length - 1 && (
                            <span className="text-muted-foreground/40 text-xs">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[10px] text-muted-foreground/50 text-center">
                Press <kbd className="inline-flex h-4 items-center rounded border border-border/30 bg-muted/30 px-1 text-[9px] font-mono">Ctrl</kbd> + <kbd className="inline-flex h-4 items-center rounded border border-border/30 bg-muted/30 px-1 text-[9px] font-mono">/</kbd> to toggle
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
