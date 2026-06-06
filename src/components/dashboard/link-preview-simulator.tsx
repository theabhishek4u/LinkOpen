'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Smartphone, Tablet, Monitor, Share2, ExternalLink, Sun, Moon, QrCode, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLinkStore } from '@/store/link-store'
import { toast } from 'sonner'

type DeviceType = 'mobile' | 'tablet' | 'desktop'

const DEVICES: { id: DeviceType; label: string; icon: typeof Smartphone }[] = [
  { id: 'mobile', label: 'Mobile', icon: Smartphone },
  { id: 'tablet', label: 'Tablet', icon: Tablet },
  { id: 'desktop', label: 'Desktop', icon: Monitor },
]

// ─── Loading Skeleton ──────────────────────────────────────────────

function PreviewSkeleton({ device, isDark }: { device: DeviceType; isDark: boolean }) {
  const bgClass = isDark ? 'bg-gray-800' : 'bg-gray-200'
  const barClass = isDark ? 'bg-gray-700' : 'bg-gray-300'
  const containerBg = isDark ? 'bg-gray-900' : 'bg-white'
  const borderClass = isDark ? 'border-gray-700' : 'border-gray-200'
  const headerBg = isDark ? 'bg-gray-800' : 'bg-gray-50'

  if (device === 'mobile') {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className={`relative w-[160px] h-[300px] rounded-[24px] border-2 ${borderClass} ${containerBg} overflow-hidden shadow-lg`}>
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 ${headerBg} rounded-b-xl z-10`} />
          <div className={`h-8 ${headerBg} flex items-center justify-center`} />
          <div className="p-3 space-y-3">
            <div className="flex items-center gap-2">
              <motion.div className={`w-10 h-10 rounded-xl ${bgClass} animate-pulse`} />
            </div>
            <motion.div className={`h-3 w-20 rounded ${barClass} animate-pulse`} />
            <motion.div className={`h-2 w-full rounded ${barClass} animate-pulse`} />
            <motion.div className={`h-2 w-3/4 rounded ${barClass} animate-pulse`} />
            <motion.div className={`h-16 w-full rounded-md ${bgClass} animate-pulse`} />
          </div>
        </div>
      </div>
    )
  }

  if (device === 'tablet') {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className={`relative w-[200px] h-[260px] rounded-[16px] border-2 ${borderClass} ${containerBg} overflow-hidden shadow-lg`}>
          <div className={`absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'} z-10`} />
          <div className={`h-8 ${headerBg} flex items-center px-2 gap-1.5`}>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/40" />
            </div>
            <motion.div className={`flex-1 h-4 rounded ${bgClass} animate-pulse`} />
          </div>
          <div className="p-4 space-y-3">
            <motion.div className={`w-12 h-12 rounded-xl ${bgClass} animate-pulse mx-auto`} />
            <motion.div className={`h-3 w-24 rounded ${barClass} animate-pulse mx-auto`} />
            <motion.div className={`h-20 w-full rounded-md ${bgClass} animate-pulse`} />
          </div>
        </div>
      </div>
    )
  }

  // Desktop
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative w-[260px] h-[200px] rounded-t-[10px] border-2 border-b-0 ${borderClass} ${containerBg} overflow-hidden shadow-lg`}>
        <div className={`h-6 ${headerBg} flex items-center px-2 gap-1.5`}>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-400/40" />
            <div className="w-2 h-2 rounded-full bg-amber-400/40" />
            <div className="w-2 h-2 rounded-full bg-emerald-400/40" />
          </div>
          <motion.div className={`flex-1 h-4 rounded ${bgClass} animate-pulse mx-2`} />
        </div>
        <div className="p-4 space-y-3">
          <motion.div className={`w-14 h-14 rounded-xl ${bgClass} animate-pulse mx-auto`} />
          <motion.div className={`h-3 w-32 rounded ${barClass} animate-pulse mx-auto`} />
          <motion.div className={`h-16 w-full rounded-md ${bgClass} animate-pulse`} />
        </div>
      </div>
      <div className={`w-16 h-3 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded-b-sm`} />
      <div className={`w-24 h-1.5 ${isDark ? 'bg-gray-600' : 'bg-gray-200'} rounded-full`} />
    </div>
  )
}

// ─── QR Code Overlay ───────────────────────────────────────────────

function QROverlay({ onClose }: { onClose: () => void }) {
  // Generate a simple QR-like pattern using SVG
  const size = 80
  const cellSize = 4
  const cells = 20

  // Deterministic pattern for visual effect
  const pattern = Array.from({ length: cells * cells }, (_, i) => {
    const row = Math.floor(i / cells)
    const col = i % cells
    // Corner markers
    if ((row < 5 && col < 5) || (row < 5 && col >= cells - 5) || (row >= cells - 5 && col < 5)) {
      if (row === 0 || row === 4 || col === 0 || col === 4 || col === cells - 1 || col === cells - 5 || row === cells - 1 || row === cells - 5) return 1
      if (row >= 2 && row <= 2 && col >= 2 && col <= 2) return 1
      if (row >= 2 && row <= 2 && col >= cells - 3 && col <= cells - 3) return 1
      if (row >= cells - 3 && row <= cells - 3 && col >= 2 && col <= 2) return 1
      if ((row >= 1 && row <= 3) && (col >= 1 && col <= 3)) return 1
      if ((row >= 1 && row <= 3) && (col >= cells - 4 && col <= cells - 2)) return 1
      if ((row >= cells - 4 && row <= cells - 2) && (col >= 1 && col <= 3)) return 1
      return 0
    }
    // Data area - pseudo-random but deterministic
    return ((row * 7 + col * 13 + row * col) % 3 === 0) ? 1 : 0
  })

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-[inherit]"
      onClick={onClose}
    >
      <div className="bg-white p-3 rounded-lg shadow-lg">
        <svg width={size} height={size}>
          {pattern.map((filled, i) => {
            const row = Math.floor(i / cells)
            const col = i % cells
            return (
              <rect
                key={i}
                x={col * cellSize}
                y={row * cellSize}
                width={cellSize}
                height={cellSize}
                fill={filled ? '#000' : '#fff'}
              />
            )
          })}
        </svg>
      </div>
      <span className="text-[9px] text-muted-foreground mt-2">Tap to close QR overlay</span>
    </motion.div>
  )
}

// ─── Device Mockups ────────────────────────────────────────────────

function MobileMockup({
  deepLink,
  platform,
  isDark,
  linkMeta,
}: {
  deepLink: string
  platform: { name: string; icon: string; color: string } | null
  isDark: boolean
  linkMeta: { title: string; description: string }
}) {
  const textClass = isDark ? 'text-gray-200' : 'text-gray-800'
  const subtextClass = isDark ? 'text-gray-400' : 'text-gray-500'
  const bgContent = isDark ? 'bg-gray-900' : 'bg-white'
  const cardBg = isDark ? 'bg-gray-800' : 'bg-gray-100'
  const borderClass = isDark ? 'border-gray-700' : 'border-gray-200'
  const headerBg = isDark ? 'bg-gray-800' : 'bg-gray-50'
  const notchClass = isDark ? 'bg-gray-950' : 'bg-gray-200'

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative w-[160px] h-[300px] rounded-[24px] border-2 ${borderClass} ${bgContent} overflow-hidden shadow-lg transition-colors duration-500`}>
        {/* Notch */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 ${notchClass} rounded-b-xl z-10`} />
        {/* Status bar */}
        <div className={`h-8 ${headerBg} flex items-center justify-center transition-colors duration-500`}>
          <span className={`text-[8px] ${subtextClass}`}>9:41</span>
        </div>
        {/* App header */}
        <div className={`h-10 flex items-center px-3 gap-2 border-b ${borderClass} transition-colors duration-500`}>
          <span className="text-sm">{platform?.icon || '🔗'}</span>
          <span className={`text-[10px] font-medium truncate ${textClass} transition-colors duration-500`}>{platform?.name || 'App'}</span>
        </div>
        {/* App content */}
        <div className="flex-1 flex flex-col items-center justify-center p-3 gap-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ backgroundColor: `${platform?.color || '#10b981'}20` }}
          >
            {platform?.icon || '🔗'}
          </motion.div>

          {/* Link metadata */}
          <span className={`text-[9px] font-medium ${textClass} transition-colors duration-500`}>
            {linkMeta.title || 'Opening via Deep Link'}
          </span>
          {linkMeta.description && (
            <span className={`text-[7px] ${subtextClass} text-center line-clamp-2 transition-colors duration-500`}>
              {linkMeta.description}
            </span>
          )}

          <div className={`w-full rounded-md ${cardBg} px-2 py-1.5 mt-1 transition-colors duration-500`}>
            <p className="text-[7px] font-mono text-emerald-500/70 break-all line-clamp-2">
              {deepLink || 'scheme://path'}
            </p>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[7px] text-emerald-400">Native app detected</span>
          </div>
        </div>
        {/* Home indicator */}
        <div className="h-4 flex items-center justify-center pb-1">
          <div className={`w-20 h-1 rounded-full ${notchClass}`} />
        </div>
      </div>
    </div>
  )
}

function TabletMockup({
  deepLink,
  platform,
  isDark,
  linkMeta,
}: {
  deepLink: string
  platform: { name: string; icon: string; color: string } | null
  isDark: boolean
  linkMeta: { title: string; description: string }
}) {
  const textClass = isDark ? 'text-gray-200' : 'text-gray-800'
  const subtextClass = isDark ? 'text-gray-400' : 'text-gray-500'
  const bgContent = isDark ? 'bg-gray-900' : 'bg-white'
  const borderClass = isDark ? 'border-gray-700' : 'border-gray-200'
  const headerBg = isDark ? 'bg-gray-800' : 'bg-gray-100'
  const inputBg = isDark ? 'bg-gray-700' : 'bg-white'
  const cameraClass = isDark ? 'bg-gray-800' : 'bg-gray-300'

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative w-[200px] h-[260px] rounded-[16px] border-2 ${borderClass} ${bgContent} overflow-hidden shadow-lg transition-colors duration-500`}>
        {/* Camera */}
        <div className={`absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${cameraClass} z-10`} />
        {/* Browser bar */}
        <div className={`h-8 ${headerBg} flex items-center px-2 gap-1.5 transition-colors duration-500`}>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" />
          </div>
          <div className={`flex-1 rounded px-2 py-0.5 ${inputBg}`}>
            <span className={`text-[7px] ${subtextClass} truncate block`}>
              linkverse.app/s/abc123
            </span>
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 gap-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: `${platform?.color || '#10b981'}20` }}
          >
            {platform?.icon || '🔗'}
          </motion.div>
          <span className={`text-[10px] font-medium ${textClass} transition-colors duration-500`}>
            {linkMeta.title || platform?.name || 'App'}
          </span>
          {linkMeta.description && (
            <span className={`text-[8px] ${subtextClass} text-center line-clamp-2 transition-colors duration-500`}>
              {linkMeta.description}
            </span>
          )}
          <div className={`w-full rounded-md ${isDark ? 'bg-gray-800' : 'bg-gray-50'} border ${borderClass} px-2 py-1.5`}>
            <p className="text-[7px] font-mono text-emerald-500/80 break-all line-clamp-2">
              {deepLink || 'scheme://path'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function DesktopMockup({
  deepLink,
  platform,
  isDark,
  linkMeta,
}: {
  deepLink: string
  platform: { name: string; icon: string; color: string } | null
  isDark: boolean
  linkMeta: { title: string; description: string }
}) {
  const textClass = isDark ? 'text-gray-200' : 'text-gray-800'
  const subtextClass = isDark ? 'text-gray-400' : 'text-gray-500'
  const bgContent = isDark ? 'bg-gray-900' : 'bg-white'
  const borderClass = isDark ? 'border-gray-700' : 'border-gray-200'
  const headerBg = isDark ? 'bg-gray-800' : 'bg-gray-100'
  const inputBg = isDark ? 'bg-gray-700' : 'bg-white'

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative w-[260px] h-[200px] rounded-t-[10px] border-2 border-b-0 ${borderClass} ${bgContent} overflow-hidden shadow-lg transition-colors duration-500`}>
        {/* Title bar */}
        <div className={`h-6 ${headerBg} flex items-center px-2 gap-1.5 transition-colors duration-500`}>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-400/60" />
            <div className="w-2 h-2 rounded-full bg-amber-400/60" />
            <div className="w-2 h-2 rounded-full bg-emerald-400/60" />
          </div>
          <div className={`flex-1 rounded px-3 py-0.5 mx-2 ${inputBg}`}>
            <span className={`text-[8px] ${subtextClass} truncate block`}>
              linkverse.app — {linkMeta.title || 'Deep Link Preview'}
            </span>
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-4 gap-4">
          <motion.div
            initial={{ scale: 0, x: -20 }}
            animate={{ scale: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
            className="flex flex-col items-center gap-2"
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${platform?.color || '#10b981'}20` }}
            >
              {platform?.icon || '🔗'}
            </div>
            <span className={`text-[9px] font-medium ${textClass} transition-colors duration-500`}>{platform?.name || 'App'}</span>
          </motion.div>
          <motion.div
            initial={{ scale: 0, x: 20 }}
            animate={{ scale: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.4 }}
            className="flex flex-col gap-1.5 max-w-[120px]"
          >
            {linkMeta.title && (
              <span className={`text-[9px] font-medium ${textClass} transition-colors duration-500`}>{linkMeta.title}</span>
            )}
            {linkMeta.description && (
              <span className={`text-[7px] ${subtextClass} line-clamp-2 transition-colors duration-500`}>{linkMeta.description}</span>
            )}
            <div className={`rounded-md ${isDark ? 'bg-gray-800' : 'bg-gray-50'} border ${borderClass} px-2 py-1.5`}>
              <p className="text-[7px] font-mono text-emerald-500/80 break-all line-clamp-3">
                {deepLink || 'scheme://path'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[7px] text-emerald-400/80">Redirecting to native app</span>
            </div>
          </motion.div>
        </div>
      </div>
      {/* Monitor stand */}
      <div className={`w-16 h-3 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded-b-sm`} />
      <div className={`w-24 h-1.5 ${isDark ? 'bg-gray-600' : 'bg-gray-200'} rounded-full`} />
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────

export function LinkPreviewSimulator() {
  const { deepLinkResult, detectedPlatform } = useLinkStore()
  const [activeDevice, setActiveDevice] = useState<DeviceType>('mobile')
  const [isDark, setIsDark] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [copied, setCopied] = useState(false)

  const deepLink = deepLinkResult?.deepLink || ''
  const platform = detectedPlatform || null

  // Extract link metadata from the URL and platform
  const linkMeta = (() => {
    if (!deepLinkResult) return { title: '', description: '' }
    const url = deepLinkResult.originalUrl || ''
    const pName = platform?.name || 'Unknown App'
    const title = platform ? `Open in ${pName}` : 'Deep Link Preview'
    const description = url
      ? `Redirecting ${url.length > 40 ? url.slice(0, 40) + '...' : url} to the native ${pName} app`
      : 'This link will open directly in the native application'
    return { title, description }
  })()

  const handleSharePreview = async () => {
    const description = `LinkVerse Deep Link Preview\n\nPlatform: ${platform?.name || 'Unknown'}\nDeep Link: ${deepLink || 'N/A'}\nShort Code: ${deepLinkResult?.shortCode || 'N/A'}\nPreview on: ${activeDevice}\nMode: ${isDark ? 'Dark' : 'Light'}\n\nGenerated by LinkVerse`
    try {
      await navigator.clipboard.writeText(description)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('Preview description copied!')
    } catch {
      toast.error('Failed to copy preview')
    }
  }

  const mockupProps = { deepLink, platform, isDark, linkMeta }

  return (
    <div className="glass-card rounded-xl p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ExternalLink className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Link Preview</h3>
        </div>
        <div className="flex items-center gap-1.5">
          {/* QR Overlay toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowQR(!showQR)}
            className={`text-xs transition-colors ${showQR ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <QrCode className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline">QR</span>
          </Button>
          {/* Dark mode toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDark(!isDark)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {isDark ? <Sun className="h-3.5 w-3.5 mr-1" /> : <Moon className="h-3.5 w-3.5 mr-1" />}
            <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
          </Button>
          {/* Share Preview */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSharePreview}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {copied ? <Check className="h-3.5 w-3.5 mr-1 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
          </Button>
        </div>
      </div>

      {/* Device selector */}
      <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-0.5">
        {DEVICES.map((device) => (
          <button
            key={device.id}
            onClick={() => setActiveDevice(device.id)}
            className={`flex items-center gap-1.5 flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all ${
              activeDevice === device.id
                ? 'bg-accent text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <device.icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{device.label}</span>
          </button>
        ))}
      </div>

      {/* Device preview */}
      <div className="flex items-center justify-center min-h-[220px] sm:min-h-[280px] relative">
        <AnimatePresence mode="wait">
          {!deepLink ? (
            <motion.div
              key={`skeleton-${activeDevice}-${isDark}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <PreviewSkeleton device={activeDevice} isDark={isDark} />
            </motion.div>
          ) : (
            <motion.div
              key={`preview-${activeDevice}-${isDark}-${deepLink}`}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative"
            >
              {activeDevice === 'mobile' && <MobileMockup {...mockupProps} />}
              {activeDevice === 'tablet' && <TabletMockup {...mockupProps} />}
              {activeDevice === 'desktop' && <DesktopMockup {...mockupProps} />}

              {/* QR Code overlay */}
              <AnimatePresence>
                {showQR && deepLink && (
                  <QROverlay onClose={() => setShowQR(false)} />
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Link metadata display */}
      {deepLink && linkMeta.title && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          {/* Metadata card */}
          <div className={`rounded-lg p-3 ${isDark ? 'bg-gray-800/50' : 'bg-muted/30'} transition-colors duration-500`}>
            <div className="flex items-start gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                style={{ backgroundColor: `${platform?.color || '#10b981'}20` }}
              >
                {platform?.icon || '🔗'}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-[11px] font-medium truncate ${isDark ? 'text-gray-200' : 'text-foreground'} transition-colors duration-500`}>
                  {linkMeta.title}
                </p>
                <p className={`text-[9px] line-clamp-2 ${isDark ? 'text-gray-400' : 'text-muted-foreground'} transition-colors duration-500`}>
                  {linkMeta.description}
                </p>
              </div>
            </div>
          </div>

          {/* Platform info badge */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/10 px-3 py-1.5">
              <span className="text-[10px] text-muted-foreground">Opens in</span>
              <span className="text-xs font-medium text-primary">{platform?.name || 'Native App'}</span>
              <span className="text-[10px] text-muted-foreground">via deep link</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {!deepLink && (
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            Generate a deep link to see how it would appear on different devices
          </p>
        </div>
      )}
    </div>
  )
}
