'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Keyboard, X, RotateCcw, AlertTriangle, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'

const SHORTCUTS_STORAGE_KEY = 'linkverse-shortcuts'
const SHORTCUTS_ENABLED_KEY = 'linkverse-shortcuts-enabled'

export type ShortcutCategory = 'navigation' | 'link_operations' | 'analytics' | 'general'

export interface ShortcutBinding {
  id: string
  keys: string[]
  description: string
  category: ShortcutCategory
  enabled: boolean
}

export const CATEGORY_LABELS: Record<ShortcutCategory, { label: string; icon: string }> = {
  navigation: { label: 'Navigation', icon: '🧭' },
  link_operations: { label: 'Link Operations', icon: '🔗' },
  analytics: { label: 'Analytics', icon: '📊' },
  general: { label: 'General', icon: '⚙️' },
}

export const DEFAULT_SHORTCUTS: ShortcutBinding[] = [
  // Navigation
  { id: 'focusInput', keys: ['Ctrl', 'L'], description: 'Focus input', category: 'navigation', enabled: true },
  { id: 'commandPalette', keys: ['Ctrl', 'K'], description: 'Command palette', category: 'navigation', enabled: true },
  { id: 'showHistory', keys: ['Ctrl', 'H'], description: 'View history', category: 'navigation', enabled: true },
  { id: 'showShortcuts', keys: ['Ctrl', '/'], description: 'Show shortcuts', category: 'navigation', enabled: true },
  // Link Operations
  { id: 'openInApp', keys: ['Ctrl', '↵'], description: 'Open in app', category: 'link_operations', enabled: true },
  { id: 'copyLink', keys: ['Ctrl', 'C'], description: 'Copy link', category: 'link_operations', enabled: true },
  { id: 'generateQR', keys: ['Ctrl', 'Q'], description: 'Generate QR code', category: 'link_operations', enabled: true },
  { id: 'newLink', keys: ['Ctrl', 'N'], description: 'New link (focus input)', category: 'link_operations', enabled: true },
  // Analytics
  { id: 'viewAnalytics', keys: ['Ctrl', 'A'], description: 'View analytics', category: 'analytics', enabled: true },
  { id: 'exportData', keys: ['Ctrl', 'E'], description: 'Export data', category: 'analytics', enabled: true },
  // General
  { id: 'toggleDarkMode', keys: ['Ctrl', 'D'], description: 'Toggle dark mode', category: 'general', enabled: true },
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
        if (custom) {
          return { ...def, ...custom, category: def.category }
        }
        return def
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

function loadEnabledStates(): Record<string, boolean> {
  if (typeof window === 'undefined') return {}
  try {
    const stored = localStorage.getItem(SHORTCUTS_ENABLED_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function saveEnabledStates(states: Record<string, boolean>) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SHORTCUTS_ENABLED_KEY, JSON.stringify(states))
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

function getKeyBadge(key: string, size: 'sm' | 'md' = 'md') {
  const display = getKeyDisplay(key)
  const sizeClasses = size === 'sm' ? 'h-5 min-w-[20px] text-[9px] px-1' : 'h-6 min-w-[24px] text-[10px] px-1.5'

  // Special rendering for modifier keys
  if (key === 'Ctrl') {
    const isMac = typeof navigator !== 'undefined' && /Mac|iPhone/.test(navigator.userAgent)
    return (
      <kbd
        key={key}
        className={`inline-flex items-center justify-center rounded-md border border-border/50 bg-muted/50 font-mono text-muted-foreground ${sizeClasses}`}
      >
        {isMac ? '⌘' : 'Ctrl'}
      </kbd>
    )
  }
  if (key === 'Shift') {
    return (
      <kbd
        key={key}
        className={`inline-flex items-center justify-center rounded-md border border-border/50 bg-muted/50 font-mono text-muted-foreground ${sizeClasses}`}
      >
        ⇧
      </kbd>
    )
  }
  if (key === 'Alt') {
    return (
      <kbd
        key={key}
        className={`inline-flex items-center justify-center rounded-md border border-border/50 bg-muted/50 font-mono text-muted-foreground ${sizeClasses}`}
      >
        ⌥
      </kbd>
    )
  }
  if (key === 'Meta') {
    return (
      <kbd
        key={key}
        className={`inline-flex items-center justify-center rounded-md border border-border/50 bg-muted/50 font-mono text-muted-foreground ${sizeClasses}`}
      >
        ⊞
      </kbd>
    )
  }

  return (
    <kbd
      key={key}
      className={`inline-flex items-center justify-center rounded-md border border-border/50 bg-muted/50 font-mono text-muted-foreground ${sizeClasses}`}
    >
      {display}
    </kbd>
  )
}

interface KeyboardShortcutsProps {
  onShowShortcuts: boolean
  onCloseShortcuts: () => void
  onFocusInput: () => void
  onOpenInApp: () => void
  onCopyLink: () => void
  onGenerateQR: () => void
  onViewAnalytics?: () => void
  onExportData?: () => void
  onToggleDarkMode?: () => void
  onViewHistory?: () => void
  onNewLink?: () => void
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

// Floating help button component
export function ShortcutsHelpButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary shadow-lg shadow-primary/10 hover:bg-primary/20 transition-colors focus-visible-ring"
      aria-label="Keyboard shortcuts"
      title="Keyboard shortcuts (Ctrl+/)"
    >
      <HelpCircle className="h-5 w-5" />
    </motion.button>
  )
}

export function KeyboardShortcuts({
  onShowShortcuts,
  onCloseShortcuts,
  onFocusInput,
  onOpenInApp,
  onCopyLink,
  onGenerateQR,
  onViewAnalytics,
  onExportData,
  onToggleDarkMode,
  onViewHistory,
  onNewLink,
}: KeyboardShortcutsProps) {
  const [toggledByKeyboard, setToggledByKeyboard] = useState(false)
  const [shortcuts, setShortcuts] = useState<ShortcutBinding[]>(() => loadCustomShortcuts())
  const [recordingId, setRecordingId] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<ShortcutCategory | 'all'>('all')
  const [enabledOverrides, setEnabledOverrides] = useState<Record<string, boolean>>(() => loadEnabledStates())

  const visible = onShowShortcuts || toggledByKeyboard

  // Merge enabled state from overrides
  const effectiveShortcuts = useMemo(() =>
    shortcuts.map((s) => ({
      ...s,
      enabled: enabledOverrides[s.id] !== undefined ? enabledOverrides[s.id] : s.enabled,
    })),
    [shortcuts, enabledOverrides]
  )

  const handleClose = useCallback(() => {
    setToggledByKeyboard(false)
    setRecordingId(null)
    onCloseShortcuts()
  }, [onCloseShortcuts])

  const handleToggleEnabled = useCallback((id: string) => {
    setEnabledOverrides((prev) => {
      const current = prev[id] !== undefined ? prev[id] : true
      const updated = { ...prev, [id]: !current }
      saveEnabledStates(updated)
      return updated
    })
  }, [])

  const handleRecordStart = useCallback((id: string) => {
    setRecordingId(id)
  }, [])

  const handleResetToDefaults = useCallback(() => {
    setShortcuts(DEFAULT_SHORTCUTS)
    saveCustomShortcuts(DEFAULT_SHORTCUTS)
    setEnabledOverrides({})
    saveEnabledStates({})
    setRecordingId(null)
  }, [])

  // Detect conflicts
  const conflicts = useMemo(() => {
    const keyMap = new Map<string, string[]>()
    effectiveShortcuts
      .filter((s) => s.enabled)
      .forEach((s) => {
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
  }, [effectiveShortcuts])

  // Global keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If recording a shortcut
      if (recordingId) {
        e.preventDefault()
        e.stopPropagation()

        const key = e.key === 'Enter' ? '↵' : e.key === 'Escape' ? 'Escape' : e.key
        const mod = e.metaKey || e.ctrlKey

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
      const shortcut = effectiveShortcuts.find((s) => {
        if (!s.enabled) return false
        if (s.keys.length === 2 && s.keys[0] === 'Ctrl' && mod) {
          const targetKey = s.keys[1]
          if (targetKey === '↵' && e.key === 'Enter') return true
          if (targetKey.toLowerCase() === e.key.toLowerCase()) return true
        }
        if (s.keys.length === 1 && !mod) {
          if (s.keys[0] === '/' && e.key === '/') return true
        }
        return false
      })

      if (shortcut) {
        e.preventDefault()
        switch (shortcut.id) {
          case 'focusInput':
            onFocusInput()
            break
          case 'commandPalette':
            // Handled by dashboard-main.tsx
            break
          case 'showHistory':
            onViewHistory?.()
            document.getElementById('section-history')?.scrollIntoView({ behavior: 'smooth' })
            break
          case 'showShortcuts':
            setToggledByKeyboard((prev) => !prev)
            break
          case 'openInApp':
            onOpenInApp()
            break
          case 'copyLink':
            onCopyLink()
            break
          case 'generateQR':
            onGenerateQR()
            break
          case 'newLink':
            onNewLink?.()
            onFocusInput()
            break
          case 'viewAnalytics':
            onViewAnalytics?.()
            document.getElementById('section-analytics')?.scrollIntoView({ behavior: 'smooth' })
            break
          case 'exportData':
            onExportData?.()
            break
          case 'toggleDarkMode':
            onToggleDarkMode?.()
            break
        }
      }

      if (e.key === 'Escape' && visible) {
        handleClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    effectiveShortcuts,
    recordingId,
    onFocusInput,
    onOpenInApp,
    onCopyLink,
    onGenerateQR,
    onViewAnalytics,
    onExportData,
    onToggleDarkMode,
    onViewHistory,
    onNewLink,
    visible,
    handleClose,
  ])

  // Filter shortcuts by category
  const filteredShortcuts = activeCategory === 'all'
    ? effectiveShortcuts
    : effectiveShortcuts.filter((s) => s.category === activeCategory)

  // Group by category for display
  const groupedShortcuts = useMemo(() => {
    const groups: Record<ShortcutCategory, ShortcutBinding[]> = {
      navigation: [],
      link_operations: [],
      analytics: [],
      general: [],
    }
    filteredShortcuts.forEach((s) => {
      groups[s.category].push(s)
    })
    return groups
  }, [filteredShortcuts])

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
            <div
              className="glass-card p-6 w-full max-w-lg pointer-events-auto space-y-4 max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between sticky top-0 bg-inherit z-10 pb-2">
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

              {/* Category filter pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`rounded-full px-3 py-1 text-[10px] font-medium transition-colors ${
                    activeCategory === 'all'
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
                  }`}
                >
                  All
                </button>
                {(Object.keys(CATEGORY_LABELS) as ShortcutCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`rounded-full px-3 py-1 text-[10px] font-medium transition-colors flex items-center gap-1 ${
                      activeCategory === cat
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
                    }`}
                  >
                    <span>{CATEGORY_LABELS[cat].icon}</span>
                    {CATEGORY_LABELS[cat].label}
                  </button>
                ))}
              </div>

              {/* Conflict Warning */}
              {conflicts.size > 0 && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-600 dark:text-amber-400">
                    <p className="font-medium">Shortcut conflict detected</p>
                    <p className="text-amber-500/80 mt-0.5">
                      Multiple actions use the same key binding. Click a key to remap it.
                    </p>
                  </div>
                </div>
              )}

              {/* Shortcuts grouped by category */}
              <div className="space-y-4">
                {(Object.entries(groupedShortcuts) as [ShortcutCategory, ShortcutBinding[]][]).map(
                  ([category, categoryShortcuts]) => {
                    if (categoryShortcuts.length === 0) return null
                    return (
                      <div key={category}>
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-sm">{CATEGORY_LABELS[category].icon}</span>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {CATEGORY_LABELS[category].label}
                          </h4>
                        </div>
                        <div className="space-y-1">
                          {categoryShortcuts.map((shortcut) => {
                            const keyStr = shortcut.keys.join('+')
                            const conflictIds = conflicts.get(shortcut.id) || []
                            return (
                              <div
                                key={shortcut.id}
                                className={`flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${
                                  !shortcut.enabled
                                    ? 'opacity-40'
                                    : 'hover:bg-accent/30'
                                }`}
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <Switch
                                    checked={shortcut.enabled}
                                    onCheckedChange={() => handleToggleEnabled(shortcut.id)}
                                    className="scale-75 origin-left"
                                    aria-label={`Toggle ${shortcut.description} shortcut`}
                                  />
                                  <span className="text-sm text-foreground/80 truncate">
                                    {shortcut.description}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                  {recordingId === shortcut.id ? (
                                    <span className="inline-flex h-6 min-w-[60px] items-center justify-center rounded-md border border-primary/50 bg-primary/10 px-2 text-[10px] font-mono text-primary animate-pulse">
                                      Press keys...
                                    </span>
                                  ) : (
                                    shortcut.keys.map((key, i) => (
                                      <span key={i} className="flex items-center gap-1">
                                        <button
                                          onClick={() => handleRecordStart(shortcut.id)}
                                          className={`inline-flex h-6 min-w-[24px] items-center justify-center rounded-md border px-1.5 text-[10px] font-mono transition-colors hover:bg-accent/50 ${
                                            conflictIds.length > 1
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
                                    ))
                                  )}
                                  {conflictIds.length > 1 && recordingId !== shortcut.id && (
                                    <AlertTriangle className="h-3 w-3 text-amber-500 ml-1" />
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  }
                )}
              </div>

              {/* Customize section with full table */}
              <details className="group">
                <summary className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <span className="group-open:rotate-90 transition-transform">▶</span>
                  Customize key bindings
                </summary>
                <div className="mt-3 space-y-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[10px] h-8">Action</TableHead>
                        <TableHead className="text-[10px] h-8">Key Binding</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {effectiveShortcuts.map((shortcut) => {
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

                  {recordingId && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[10px] text-primary/70 text-center"
                    >
                      Press Ctrl + key to set a new shortcut, or Esc to cancel
                    </motion.p>
                  )}

                  <div className="flex justify-end pt-2 border-t border-border/20">
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
                </div>
              </details>

              <p className="text-[10px] text-muted-foreground/50 text-center">
                Press{' '}
                {getKeyBadge('Ctrl', 'sm')}
                {' + '}
                {getKeyBadge('/', 'sm')}
                {' '}to toggle
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
