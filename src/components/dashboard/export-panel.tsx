'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download, FileJson, FileSpreadsheet, Share2, Eye,
  Link2, BarChart3, Loader2, X, Copy, Check, CheckCircle2,
  FileCode, FileText, Table, FileBarChart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useLinkStore } from '@/store/link-store'
import { toast } from 'sonner'

type ExportFormat = 'csv' | 'json'
type ExportType = 'history' | 'analytics'

// Format selection card with hover glow
function FormatCard({
  icon,
  title,
  subtitle,
  disabled,
  onClick,
  accentColor,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  disabled: boolean
  onClick: () => void
  accentColor: string
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className="format-card-glow flex items-center gap-2 rounded-lg p-2.5 bg-background/40 border border-border/30 hover:border-primary/30 hover:bg-accent/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-left w-full"
      style={{
        ['--glow-color' as string]: accentColor,
      }}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div
        className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
        style={{ backgroundColor: `${accentColor}15` }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-medium text-foreground">{title}</p>
        <p className="text-[9px] text-muted-foreground">{subtitle}</p>
      </div>
    </motion.button>
  )
}

// Success checkmark animation
function SuccessCheckmark() {
  return (
    <motion.div
      className="export-check-pop"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
    >
      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
    </motion.div>
  )
}

export function ExportPanel() {
  const { history, analytics } = useLinkStore()
  const [exporting, setExporting] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [previewFormat, setPreviewFormat] = useState<ExportFormat>('json')
  const [showPreview, setShowPreview] = useState(false)
  const [copied, setCopied] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [exportStep, setExportStep] = useState<0 | 1 | 2 | 3>(0) // 0=idle, 1=preparing, 2=generating, 3=ready

  const handleExport = useCallback(async (format: ExportFormat, type: ExportType) => {
    setExporting(true)
    setDownloadProgress(0)
    setExportSuccess(false)
    setExportStep(1) // Preparing

    // Simulate progress
    const progressInterval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + Math.random() * 20
      })
    }, 200)

    setTimeout(() => setExportStep(2), 400) // Generating

    try {
      let data: unknown[]
      if (type === 'history') {
        data = history.map((item) => ({
          originalUrl: item.originalUrl,
          platform: item.platform.name,
          deepLink: item.deepLink,
          shortCode: item.shortCode || '',
          isFavorite: item.isFavorite,
          openCount: item.openCount,
          createdAt: item.createdAt,
          expiry: item.expiry || '',
        }))
      } else {
        data = analytics.topPlatforms.map((p) => ({
          platform: p.platform,
          count: p.count,
          color: p.color,
        }))
      }

      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, data, type }),
      })

      if (!res.ok) throw new Error('Export failed')

      const json = await res.json()

      clearInterval(progressInterval)
      setDownloadProgress(100)
      setExportStep(3) // Ready

      // Small delay to show 100% before completing
      await new Promise((resolve) => setTimeout(resolve, 300))

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = json.filename || `linkverse-${type}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        const blob = new Blob([json.data], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = json.filename || `linkverse-${type}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }

      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 2000)
      toast.success(`Exported ${type} as ${format.toUpperCase()}`)
    } catch {
      clearInterval(progressInterval)
      toast.error('Export failed')
    } finally {
      setExporting(false)
      setDownloadProgress(0)
      setExportStep(0)
    }
  }, [history, analytics])

  const handlePreview = useCallback(async (format: ExportFormat, type: ExportType) => {
    try {
      let data: unknown[]
      if (type === 'history') {
        data = history.slice(0, 5).map((item) => ({
          originalUrl: item.originalUrl,
          platform: item.platform.name,
          deepLink: item.deepLink,
          shortCode: item.shortCode || '',
          isFavorite: item.isFavorite,
          openCount: item.openCount,
          createdAt: item.createdAt,
          expiry: item.expiry || '',
        }))
      } else {
        data = analytics.topPlatforms.map((p) => ({
          platform: p.platform,
          count: p.count,
          color: p.color,
        }))
      }

      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, data, type }),
      })

      if (!res.ok) throw new Error('Preview failed')

      const json = await res.json()

      if (format === 'json') {
        setPreview(JSON.stringify(json.data, null, 2))
      } else {
        setPreview(json.data)
      }

      setPreviewFormat(format)
      setShowPreview(true)
    } catch {
      toast.error('Preview failed')
    }
  }, [history, analytics])

  const handleShareStats = useCallback(async () => {
    const summary = [
      `📊 LinkVerse Stats Summary`,
      `━━━━━━━━━━━━━━━━━`,
      `🔗 Total Links: ${history.length}`,
      `⭐ Favorites: ${history.filter(h => h.isFavorite).length}`,
      `📱 Platforms: ${[...new Set(history.map(h => h.platform.name))].join(', ') || 'None'}`,
      `📈 Native Opens: ${analytics.nativeOpens || 0}`,
      `🌐 Browser Opens: ${analytics.browserOpens || 0}`,
      `━━━━━━━━━━━━━━━━━`,
      `Generated by LinkVerse`,
    ].join('\n')

    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('Stats summary copied to clipboard!')
    } catch {
      toast.error('Failed to copy stats')
    }
  }, [history, analytics])

  return (
    <div className="glass-card p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Download className="h-4 w-4 text-primary" />
          </motion.div>
          <h3 className="text-sm font-semibold text-foreground">Export & Share</h3>
        </div>
        {exportSuccess && <SuccessCheckmark />}
      </div>

      {/* Download progress indicator with step steps */}
      <AnimatePresence>
        {exporting && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-2">
              {/* Step indicator */}
              <div className="export-step-indicator">
                <div className={`step-dot ${exportStep >= 1 ? (exportStep > 1 ? 'completed' : 'active') : ''}`}>
                  {exportStep > 1 ? '✓' : '1'}
                </div>
                <div className={`step-line ${exportStep > 1 ? 'completed' : ''}`} />
                <div className={`step-dot ${exportStep >= 2 ? (exportStep > 2 ? 'completed' : 'active') : ''}`}>
                  {exportStep > 2 ? '✓' : '2'}
                </div>
                <div className={`step-line ${exportStep > 2 ? 'completed' : ''}`} />
                <div className={`step-dot ${exportStep >= 3 ? 'completed' : ''}`}>
                  {exportStep >= 3 ? '✓' : '3'}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  {exportStep === 1 ? 'Preparing...' : exportStep === 2 ? 'Generating...' : 'Ready!'}
                </span>
                <span className="text-[10px] text-primary font-medium">{Math.round(downloadProgress)}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted/20 overflow-hidden">
                <motion.div
                  className="h-full rounded-full download-progress-bar"
                  style={{
                    background: 'linear-gradient(90deg, oklch(0.696 0.17 162.48), oklch(0.488 0.243 264.376 / 60%), oklch(0.696 0.17 162.48))',
                    backgroundSize: '200% 100%',
                  }}
                  animate={{ width: `${downloadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export format cards with format-specific icons */}
      <div className="grid grid-cols-2 gap-2">
        <FormatCard
          icon={<FileCode className="h-4 w-4 text-primary/70" />}
          title="History"
          subtitle="JSON format"
          disabled={exporting || history.length === 0}
          onClick={() => handleExport('json', 'history')}
          accentColor="#10b981"
        />
        <FormatCard
          icon={<Table className="h-4 w-4 text-primary/70" />}
          title="History"
          subtitle="CSV format"
          disabled={exporting || history.length === 0}
          onClick={() => handleExport('csv', 'history')}
          accentColor="#10b981"
        />
        <FormatCard
          icon={<FileBarChart className="h-4 w-4 text-violet-400/70" />}
          title="Analytics"
          subtitle="JSON report"
          disabled={exporting || analytics.topPlatforms.length === 0}
          onClick={() => handleExport('json', 'analytics')}
          accentColor="#8b5cf6"
        />
        <FormatCard
          icon={<FileText className="h-4 w-4 text-violet-400/70" />}
          title="Analytics"
          subtitle="CSV report"
          disabled={exporting || analytics.topPlatforms.length === 0}
          onClick={() => handleExport('csv', 'analytics')}
          accentColor="#8b5cf6"
        />
      </div>

      {/* Preview & Share Row */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 h-7 text-[10px] gap-1.5 text-muted-foreground"
          onClick={() => handlePreview('json', 'history')}
          disabled={history.length === 0}
        >
          <Eye className="h-3 w-3" />
          Preview Export
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 h-7 text-[10px] gap-1.5 text-muted-foreground"
          onClick={handleShareStats}
        >
          {copied ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <Check className="h-3 w-3 text-emerald-400" />
            </motion.div>
          ) : (
            <Share2 className="h-3 w-3" />
          )}
          {copied ? 'Copied!' : 'Share Stats'}
        </Button>
      </div>

      {/* Export Stats */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground/40">
        <span>{history.length} links available</span>
        {exporting && (
          <span className="flex items-center gap-1 text-primary">
            <Loader2 className="h-2.5 w-2.5 animate-spin" />
            Exporting...
          </span>
        )}
      </div>

      {/* Preview Modal with slide-in animation */}
      <AnimatePresence>
        {showPreview && preview && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
              onClick={() => setShowPreview(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
            >
              <div className="glass-card rounded-xl border border-border/30 overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
                  <div className="flex items-center gap-2">
                    <motion.div
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Eye className="h-4 w-4 text-primary" />
                    </motion.div>
                    <span className="text-sm font-medium text-foreground">
                      Preview ({previewFormat.toUpperCase()})
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPreview(false)}
                    className="h-7 w-7"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <ScrollArea className="max-h-80">
                  <pre className="p-4 text-[10px] font-mono text-foreground/80 whitespace-pre-wrap break-all code-preview">
                    {preview}
                  </pre>
                </ScrollArea>
                <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border/20">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs gap-1.5"
                    onClick={async () => {
                      await navigator.clipboard.writeText(preview)
                      toast.success('Preview copied!')
                    }}
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => {
                      setShowPreview(false)
                      handleExport(previewFormat, 'history')
                    }}
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
