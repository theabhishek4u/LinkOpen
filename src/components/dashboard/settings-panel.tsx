'use client'

import { useCallback, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings, X, Monitor, Sparkles, Copy, QrCode,
  Bell, Volume2, Shield, Trash2, Download, Palette, Zap, Keyboard, RotateCcw, AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useLinkStore } from '@/store/link-store'
import { toast } from 'sonner'
import { DEFAULT_SHORTCUTS, type ShortcutBinding } from './keyboard-shortcuts'
import { ThemeCustomizer } from './theme-customizer'

interface SettingsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SHORTCUTS_STORAGE_KEY = 'linkverse-shortcuts'

function loadCustomShortcuts(): ShortcutBinding[] {
  if (typeof window === 'undefined') return DEFAULT_SHORTCUTS
  try {
    const stored = localStorage.getItem(SHORTCUTS_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as ShortcutBinding[]
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

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
  const { settings, updateSettings, clearHistory, history } = useLinkStore()
  const [exporting, setExporting] = useState(false)
  const [shortcuts, setShortcuts] = useState<ShortcutBinding[]>(DEFAULT_SHORTCUTS)
  const [recordingId, setRecordingId] = useState<string | null>(null)

  // Load custom shortcuts
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setShortcuts(loadCustomShortcuts())
    setMounted(true)
  }, [])

  // Handle keyboard recording
  useEffect(() => {
    if (!recordingId) return

    const handleKeyDown = (e: KeyboardEvent) => {
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
    }

    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [recordingId])

  const handleClearHistory = useCallback(() => {
    clearHistory()
    toast.success('History cleared')
  }, [clearHistory])

  const handleClearAnalytics = useCallback(() => {
    // Clear localStorage analytics data
    try {
      localStorage.removeItem('linkverse-analytics-cache')
      toast.success('Analytics data cleared')
    } catch {
      toast.error('Failed to clear analytics data')
    }
  }, [])

  const handleExportData = useCallback(async () => {
    setExporting(true)
    try {
      const exportData = {
        history: history,
        settings: settings,
        exportedAt: new Date().toISOString(),
      }

      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'json',
          data: exportData,
          type: 'full-backup',
        }),
      })

      if (!res.ok) throw new Error('Export failed')

      const json = await res.json()
      const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = json.filename || 'linkverse-export.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Data exported successfully!')
    } catch {
      toast.error('Failed to export data')
    } finally {
      setExporting(false)
    }
  }, [history, settings])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
        onClick={() => onOpenChange(false)}
      />

      {/* Settings Panel */}
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md overflow-y-auto"
      >
        <div className="min-h-full glass-card rounded-none border-l border-border/30 p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Settings</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Appearance Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary/70" />
              <h3 className="text-sm font-medium text-foreground">Appearance</h3>
            </div>

            <div className="space-y-3 pl-6">
              {/* Compact Mode */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-foreground">Compact Mode</p>
                    <p className="text-[10px] text-muted-foreground">Reduce spacing and padding</p>
                  </div>
                </div>
                <Switch
                  checked={settings.compactMode}
                  onCheckedChange={(checked) => updateSettings({ compactMode: checked })}
                  className="data-[state=checked]:bg-primary animated-toggle-thumb"
                />
              </div>

              {/* Animations */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-foreground">Animations</p>
                    <p className="text-[10px] text-muted-foreground">Enable motion and transitions</p>
                  </div>
                </div>
                <Switch
                  checked={settings.animationsEnabled}
                  onCheckedChange={(checked) => updateSettings({ animationsEnabled: checked })}
                  className="data-[state=checked]:bg-primary animated-toggle-thumb"
                />
              </div>
            </div>
          </div>

          <Separator className="bg-border/30 gradient-section-divider" />

          {/* Accent Color Section */}
          <ThemeCustomizer />

          <Separator className="bg-border/30 gradient-section-divider" />

          {/* Default Behavior Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary/70" />
              <h3 className="text-sm font-medium text-foreground">Default Behavior</h3>
            </div>

            <div className="space-y-3 pl-6">
              {/* Default Open Method */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-foreground">Open Method</p>
                  <p className="text-[10px] text-muted-foreground">Default way to open links</p>
                </div>
                <Select
                  value={settings.defaultOpenMethod}
                  onValueChange={(value: 'native' | 'browser') =>
                    updateSettings({ defaultOpenMethod: value })
                  }
                >
                  <SelectTrigger className="h-7 w-24 text-[10px] bg-background/40 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="native">Native App</SelectItem>
                    <SelectItem value="browser">Browser</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Auto Copy */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-foreground">Auto-copy on Generate</p>
                    <p className="text-[10px] text-muted-foreground">Copy deep link to clipboard automatically</p>
                  </div>
                </div>
                <Switch
                  checked={settings.autoCopyOnGenerate}
                  onCheckedChange={(checked) => updateSettings({ autoCopyOnGenerate: checked })}
                  className="data-[state=checked]:bg-primary animated-toggle-thumb"
                />
              </div>

              {/* Show QR After Generate */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QrCode className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-foreground">Show QR after Generate</p>
                    <p className="text-[10px] text-muted-foreground">Auto-display QR code dialog</p>
                  </div>
                </div>
                <Switch
                  checked={settings.showQrAfterGenerate}
                  onCheckedChange={(checked) => updateSettings({ showQrAfterGenerate: checked })}
                  className="data-[state=checked]:bg-primary animated-toggle-thumb"
                />
              </div>
            </div>
          </div>

          <Separator className="bg-border/30 gradient-section-divider" />

          {/* Notifications Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary/70" />
              <h3 className="text-sm font-medium text-foreground">Notifications</h3>
            </div>

            <div className="space-y-3 pl-6">
              {/* Toast Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-foreground">Toast Notifications</p>
                    <p className="text-[10px] text-muted-foreground">Show pop-up notifications</p>
                  </div>
                </div>
                <Switch
                  checked={settings.toastNotifications}
                  onCheckedChange={(checked) => updateSettings({ toastNotifications: checked })}
                  className="data-[state=checked]:bg-primary animated-toggle-thumb"
                />
              </div>

              {/* Sound Effects */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-foreground">Sound Effects</p>
                    <p className="text-[10px] text-muted-foreground">Play sounds on actions</p>
                  </div>
                </div>
                <Switch
                  checked={settings.soundEffects}
                  onCheckedChange={(checked) => updateSettings({ soundEffects: checked })}
                  className="data-[state=checked]:bg-primary animated-toggle-thumb"
                />
              </div>
            </div>
          </div>

          <Separator className="bg-border/30 gradient-section-divider" />

          {/* Shortcuts Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Keyboard className="h-4 w-4 text-primary/70" />
              <h3 className="text-sm font-medium text-foreground">Keyboard Shortcuts</h3>
            </div>

            <div className="space-y-2 pl-6">
              {/* Conflict Warning */}
              {(() => {
                const keyMap = new Map<string, string[]>()
                shortcuts.forEach((s) => {
                  const keyStr = s.keys.join('+')
                  const existing = keyMap.get(keyStr) || []
                  existing.push(s.id)
                  keyMap.set(keyStr, existing)
                })
                const hasConflicts = Array.from(keyMap.values()).some((ids) => ids.length > 1)
                if (!hasConflicts) return null
                return (
                  <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-[10px] text-amber-600 dark:text-amber-400">
                      <p className="font-medium">Shortcut conflict</p>
                      <p className="text-amber-500/80">Multiple actions use the same key binding.</p>
                    </div>
                  </div>
                )
              })()}

              {shortcuts.map((shortcut) => (
                <div key={shortcut.id} className="flex items-center justify-between">
                  <p className="text-xs text-foreground">{shortcut.description}</p>
                  <div className="flex items-center gap-1">
                    {recordingId === shortcut.id ? (
                      <span className="inline-flex h-6 min-w-[60px] items-center justify-center rounded-md border border-primary/50 bg-primary/10 px-2 text-[10px] font-mono text-primary animate-pulse">
                        Press keys...
                      </span>
                    ) : (
                      shortcut.keys.map((key, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <button
                            onClick={() => setRecordingId(shortcut.id)}
                            className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-md border border-border/50 bg-muted/50 px-1.5 text-[10px] font-mono text-muted-foreground hover:bg-accent/50 transition-colors"
                            title="Click to remap"
                          >
                            {key === '↵' ? 'Enter' : key}
                          </button>
                          {i < shortcut.keys.length - 1 && (
                            <span className="text-muted-foreground/40 text-xs">+</span>
                          )}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              ))}

              {/* Recording hint */}
              {recordingId && (
                <p className="text-[10px] text-primary/70 text-center">
                  Press Ctrl + key to set, or Esc to cancel
                </p>
              )}

              {/* Reset to Defaults */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-8 text-xs text-muted-foreground hover:text-foreground gap-2"
                onClick={() => {
                  setShortcuts(DEFAULT_SHORTCUTS)
                  saveCustomShortcuts(DEFAULT_SHORTCUTS)
                  setRecordingId(null)
                  toast.success('Shortcuts reset to defaults')
                }}
              >
                <RotateCcw className="h-3.5 w-3.5 reset-confirm-shake" />
                Reset to Defaults
              </Button>
            </div>
          </div>

          <Separator className="bg-border/30 gradient-section-divider" />

          {/* Privacy Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary/70" />
              <h3 className="text-sm font-medium text-foreground">Privacy & Data</h3>
            </div>

            <div className="space-y-2 pl-6">
              {/* Clear History */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-8 text-xs text-muted-foreground hover:text-destructive gap-2"
                    disabled={history.length === 0}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear All History ({history.length} links)
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="glass-card border-border/50">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all history?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all {history.length} links from your history.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearHistory}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Clear All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Clear Analytics */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-8 text-xs text-muted-foreground hover:text-destructive gap-2"
                onClick={handleClearAnalytics}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear Analytics Data
              </Button>

              {/* Export Data */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-8 text-xs text-muted-foreground hover:text-primary gap-2"
                onClick={handleExportData}
                disabled={exporting}
              >
                <Download className="h-3.5 w-3.5" />
                {exporting ? 'Exporting...' : 'Export Data as JSON'}
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 text-center">
            <p className="text-[10px] text-muted-foreground/40">
              Settings are saved locally in your browser
            </p>
          </div>
        </div>
      </motion.div>
    </>
  )
}
