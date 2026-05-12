'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Smartphone, Tablet, Monitor, Share2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLinkStore } from '@/store/link-store'
import { toast } from 'sonner'

type DeviceType = 'mobile' | 'tablet' | 'desktop'

const DEVICES: { id: DeviceType; label: string; icon: typeof Smartphone }[] = [
  { id: 'mobile', label: 'Mobile', icon: Smartphone },
  { id: 'tablet', label: 'Tablet', icon: Tablet },
  { id: 'desktop', label: 'Desktop', icon: Monitor },
]

function MobileMockup({ deepLink, platform }: { deepLink: string; platform: { name: string; icon: string; color: string } | null }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-[160px] h-[300px] rounded-[24px] border-2 border-border/40 bg-background/60 overflow-hidden shadow-lg">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-foreground/10 rounded-b-xl z-10" />
        {/* Status bar */}
        <div className="h-8 bg-background/40 flex items-center justify-center">
          <span className="text-[8px] text-muted-foreground">9:41</span>
        </div>
        {/* App header */}
        <div className="h-10 flex items-center px-3 gap-2 border-b border-border/20">
          <span className="text-sm">{platform?.icon || '🔗'}</span>
          <span className="text-[10px] font-medium text-foreground truncate">{platform?.name || 'App'}</span>
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
          <span className="text-[9px] text-foreground font-medium">Opening via Deep Link</span>
          <div className="w-full rounded-md bg-primary/10 px-2 py-1.5 mt-1">
            <p className="text-[7px] font-mono text-primary/70 break-all line-clamp-2">
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
          <div className="w-20 h-1 rounded-full bg-foreground/10" />
        </div>
      </div>
    </div>
  )
}

function TabletMockup({ deepLink, platform }: { deepLink: string; platform: { name: string; icon: string; color: string } | null }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-[200px] h-[260px] rounded-[16px] border-2 border-border/40 bg-background/60 overflow-hidden shadow-lg">
        {/* Camera */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-foreground/10 z-10" />
        {/* Browser bar */}
        <div className="h-8 bg-muted/40 flex items-center px-2 gap-1.5">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" />
          </div>
          <div className="flex-1 bg-background/50 rounded px-2 py-0.5">
            <span className="text-[7px] text-muted-foreground truncate block">
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
          <span className="text-[10px] text-foreground font-medium">{platform?.name || 'App'}</span>
          <div className="w-full rounded-md bg-primary/5 border border-primary/10 px-2 py-1.5">
            <p className="text-[7px] font-mono text-primary/60 break-all line-clamp-2">
              {deepLink || 'scheme://path'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function DesktopMockup({ deepLink, platform }: { deepLink: string; platform: { name: string; icon: string; color: string } | null }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-[260px] h-[200px] rounded-t-[10px] border-2 border-b-0 border-border/40 bg-background/60 overflow-hidden shadow-lg">
        {/* Title bar */}
        <div className="h-6 bg-muted/40 flex items-center px-2 gap-1.5">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-400/60" />
            <div className="w-2 h-2 rounded-full bg-amber-400/60" />
            <div className="w-2 h-2 rounded-full bg-emerald-400/60" />
          </div>
          <div className="flex-1 bg-background/50 rounded px-3 py-0.5 mx-2">
            <span className="text-[8px] text-muted-foreground truncate block">
              linkverse.app — Deep Link Preview
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
            <span className="text-[9px] text-foreground font-medium">{platform?.name || 'App'}</span>
          </motion.div>
          <motion.div
            initial={{ scale: 0, x: 20 }}
            animate={{ scale: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.4 }}
            className="flex flex-col gap-1 max-w-[120px]"
          >
            <div className="rounded-md bg-primary/5 border border-primary/10 px-2 py-1.5">
              <p className="text-[7px] font-mono text-primary/60 break-all line-clamp-3">
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
      <div className="w-16 h-3 bg-border/30 rounded-b-sm" />
      <div className="w-24 h-1.5 bg-border/20 rounded-full" />
    </div>
  )
}

export function LinkPreviewSimulator() {
  const { deepLinkResult, detectedPlatform } = useLinkStore()
  const [activeDevice, setActiveDevice] = useState<DeviceType>('mobile')

  const deepLink = deepLinkResult?.deepLink || ''
  const platform = detectedPlatform || null

  const handleSharePreview = async () => {
    const description = `LinkVerse Deep Link Preview\n\nPlatform: ${platform?.name || 'Unknown'}\nDeep Link: ${deepLink || 'N/A'}\nShort Code: ${deepLinkResult?.shortCode || 'N/A'}\nPreview on: ${activeDevice}\n\nGenerated by LinkVerse`
    try {
      await navigator.clipboard.writeText(description)
      toast.success('Preview description copied!')
    } catch {
      toast.error('Failed to copy preview')
    }
  }

  return (
    <div className="glass-card rounded-xl p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ExternalLink className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Link Preview</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSharePreview}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          <Share2 className="h-3 w-3 mr-1" />
          Share Preview
        </Button>
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
      <div className="flex items-center justify-center min-h-[220px] sm:min-h-[280px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDevice}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {activeDevice === 'mobile' && <MobileMockup deepLink={deepLink} platform={platform} />}
            {activeDevice === 'tablet' && <TabletMockup deepLink={deepLink} platform={platform} />}
            {activeDevice === 'desktop' && <DesktopMockup deepLink={deepLink} platform={platform} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Deep link info */}
      {deepLink && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/10 px-3 py-1.5">
            <span className="text-[10px] text-muted-foreground">Opens in</span>
            <span className="text-xs font-medium text-primary">{platform?.name || 'Native App'}</span>
            <span className="text-[10px] text-muted-foreground">via deep link</span>
          </div>
        </div>
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
