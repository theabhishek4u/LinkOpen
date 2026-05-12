'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Keyboard, X, RotateCcw, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const SHORTCUTS_STORAGE_KEY = 'linkverse-shortcuts'

export interface ShortcutBinding {
  id: string
  keys: string[]
  description: string
}

export const DEFAULT_SHORTCUTS: ShortcutBinding[] = [
  { id: 'focusInput', keys: ['Ctrl', 'K'], description: 'Focus input' },
  { id: 'openInApp', keys: ['Ctrl', '↵'], description: 'Open in app' },
  { id: 'copyLink', keys: ['Ctrl', 'C'], description: 'Copy link' },
  { id: 'generateQR', keys: ['Ctrl', 'Q'], description: 'Generate QR code' },
  { id: 'showShortcuts', keys: ['Ctrl', '/'], description: 'Show shortcuts' },
]

function loadCustomShortcuts(): ShortcutBinding[] {
  if (typeof window === 'undefined') return DEFAULT_SHORTCUTS
  try {
    const stored = localStorage.getItem(SHORTCUTS_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as ShortcutBinding[]
      // Merge with defaults to ensure new shortcuts are included
      return DEFAULT_SHORTCUTS.map((def) => {
        const custom = parsed.find((p) => p.id === def.id)
        return custom || def
      })
    }
  } catch {
    // Ignore
  }
  return DEFAULT_SHORTCUTS
}

function saveCustomShortcuts(shortcuts: ShortcutBinding[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SHORTCUTS_STORAGE_KEY, JSON.stringify(shortcuts))
  } catch {
    // Ignore
  }
}

function getKeyDisplay(key: string): string {
  if (key === '↵') return 'Enter'
  if (key === '/') return '/'
  if (key === 'Escape') return 'Esc'
  return key
}

interface KeyboardShortcutsProps {
  onShowShortcuts: boolean
  onCloseShortcuts: () => void
  onFocusInput: () => void
  onOpenInApp: () => void
  onCopyLink: () => void
  onGenerateQR: () => void
}

function KeyBindingButton({
  shortcut,
  isRecording,
  onRecordStart,
  conflictKeys,
}: {
  shortcut: ShortcutBinding
  isRecording: boolean
  onRecordStart: (id: string) => void
  conflictKeys: string[]
}) {
  const hasConflict = conflictKeys.length > 1

  return (
    <div className="flex items-center gap-1 relative">
      {isRecording ? (
        <span className="inline-flex h-6 min-w-[60px] items-center justify-center rounded-md border border-primary/50 bg-primary/10 px-2 text-[10px] font-mono text-primary animate-pulse">
          Press keys...
        </span>
      ) : (
        <>
          {shortcut.keys.map((key, i) => (
            <span key={i} className="flex items-center gap-1">
              <button
                onClick={() => onRecordStart(shortcut.id)}
                className={`inline-flex h-6 min-w-[24px] items-center justify-center rounded-md border px-1.5 text-[10px] font-mono transition-colors hover:bg-accent/50 ${
                  hasConflict
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-500'
                    : 'border-border/50 bg-muted/50 text-muted-foreground'
                }`}
                title="Click to remap"
              >
                {getKeyDisplay(key)}
              </button>
              {i < shortcut.keys.length - 1 && (
                <span className="text-muted-foreground/40 text-xs">+</span>
              )}
            </span>
          ))}
        </>
      )}
      {hasConflict && !isRecording && (
        <AlertTriangle className="h-3 w-3 text-amber-500 ml-1" />
      )}
    </div>
  )
}

export function KeyboardShortcuts({
  onShowShortcuts,
  onCloseShortcuts,
  onFocusInput,
  onOpenInApp,
  onCopyLink,
  onGenerateQR,
}: KeyboardShortcutsProps) {
  const [toggledByKeyboard, setToggledByKeyboard] = useState(false)
  const [shortcuts, setShortcuts] = useState<ShortcutBinding[]>(() => loadCustomShortcuts())
  const [recordingId, setRecordingId] = useState<string | null>(null)

  const visible = onShowShortcuts || toggledByKeyboard

  const handleClose = useCallback(() => {
    setToggledByKeyboard(false)
    setRecordingId(null)
    onCloseShortcuts()
  }, [onCloseShortcuts])

  const getShortcutKeys = useCallback((id: string): string[] => {
    const s = shortcuts.find((s) => s.id === id)
    return s ? s.keys : []
  }, [shortcuts])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // If recording a shortcut
      if (recordingId) {
        e.preventDefault()
        e.stopPropagation()

        const key = e.key === 'Enter' ? '↵' : e.key === 'Escape' ? 'Escape' : e.key
        const mod = e.metaKey || e.ctrlKey

        // Only accept modified keys or specific keys
        if (mod || ['/', '↵'].includes(key)) {
          const newKeys = mod ? ['Ctrl', key] : [key]
          setShortcuts((prev) => {
            const updated = prev.map((s) =>
              s.id === recordingId ? { ...s, keys: newKeys } : s
            )
            saveCustomShortcuts(updated)
            return updated
          })
          setRecordingId(null)
        } else if (key === 'Escape') {
          setRecordingId(null)
        }
        return
      }

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
    [onFocusInput, onOpenInApp, onGenerateQR, visible, handleClose, recordingId]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleRecordStart = useCallback((id: string) => {
    setRecordingId(id)
  }, [])

  const handleResetToDefaults = useCallback(() => {
    setShortcuts(DEFAULT_SHORTCUTS)
    saveCustomShortcuts(DEFAULT_SHORTCUTS)
    setRecordingId(null)
  }, [])

  // Detect conflicts
  const conflicts = useMemo(() => {
    const keyMap = new Map<string, string[]>()
    shortcuts.forEach((s) => {
      const keyStr = s.keys.join('+')
      const existing = keyMap.get(keyStr) || []
      existing.push(s.id)
      keyMap.set(keyStr, existing)
    })
    const conflictMap = new Map<string, string[]>()
    keyMap.forEach((ids) => {
      if (ids.length > 1) {
        ids.forEach((id) => conflictMap.set(id, ids))
      }
    })
    return conflictMap
  }, [shortcuts])

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
            <div className="glass-card p-6 w-full max-w-md pointer-events-auto space-y-4" onClick={(e) => e.stopPropagation()}>
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

              {/* Tabs */}
              <Tabs defaultValue="shortcuts" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="shortcuts" className="text-xs flex-1">Shortcuts</TabsTrigger>
                  <TabsTrigger value="customize" className="text-xs flex-1">Customize</TabsTrigger>
                </TabsList>

                {/* Shortcuts Tab */}
                <TabsContent value="shortcuts" className="mt-3">
                  <div className="space-y-2">
                    {shortcuts.map((shortcut) => (
                      <div
                        key={shortcut.id}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/30 transition-colors"
                      >
                        <span className="text-sm text-foreground/80">{shortcut.description}</span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, i) => (
                            <span key={i} className="flex items-center gap-1">
                              <kbd className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-md border border-border/50 bg-muted/50 px-1.5 text-[10px] font-mono text-muted-foreground">
                                {getKeyDisplay(key)}
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
                </TabsContent>

                {/* Customize Tab */}
                <TabsContent value="customize" className="mt-3">
                  <>
                      {/* Conflict Warning */}
                      {conflicts.size > 0 && (
                        <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 mb-3">
                          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                          <div className="text-xs text-amber-600 dark:text-amber-400">
                            <p className="font-medium">Shortcut conflict detected</p>
                            <p className="text-amber-500/80 mt-0.5">
                              Multiple actions use the same key binding. Click a key to remap it.
                            </p>
                          </div>
                        </div>
                      )}

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-[10px] h-8">Action</TableHead>
                            <TableHead className="text-[10px] h-8">Key Binding</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {shortcuts.map((shortcut) => {
                            const keyStr = shortcut.keys.join('+')
                            const conflictIds = conflicts.get(shortcut.id) || []
                            return (
                              <TableRow key={shortcut.id}>
                                <TableCell className="text-xs text-foreground/80 py-1.5">
                                  {shortcut.description}
                                </TableCell>
                                <TableCell className="py-1.5">
                                  <KeyBindingButton
                                    shortcut={shortcut}
                                    isRecording={recordingId === shortcut.id}
                                    onRecordStart={handleRecordStart}
                                    conflictKeys={conflictIds}
                                  />
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>

                      {/* Recording hint */}
                      {recordingId && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-[10px] text-primary/70 text-center mt-2"
                        >
                          Press Ctrl + key to set a new shortcut, or Esc to cancel
                        </motion.p>
                      )}

                      {/* Reset to Defaults */}
                      <div className="flex justify-end mt-3 pt-2 border-t border-border/20">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[10px] text-muted-foreground hover:text-foreground h-6 gap-1"
                          onClick={handleResetToDefaults}
                        >
                          <RotateCcw className="h-3 w-3" />
                          Reset to Defaults
                        </Button>
                      </div>
                    </>
                </TabsContent>
              </Tabs>

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
