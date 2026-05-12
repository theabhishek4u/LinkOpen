'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Globe, Copy, Link2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { useLinkStore } from '@/store/link-store'
import { PlatformBadge } from './platform-badge'
import { toast } from 'sonner'

export function LinkResult() {
  const { deepLinkResult, setDeepLinkResult, detectedPlatform } = useLinkStore()
  const [dismissed, setDismissed] = useState(false)
  const [prevUrl, setPrevUrl] = useState<string | null>(null)

  // Reset dismissed state when a new result comes in (adjusting state based on store changes)
  const currentUrl = deepLinkResult?.originalUrl ?? null
  if (currentUrl !== prevUrl) {
    setPrevUrl(currentUrl)
    setDismissed(false)
  }

  // Auto-dismiss after 30 seconds (setState in setTimeout callback is fine)
  useEffect(() => {
    if (deepLinkResult && !dismissed) {
      const timer = setTimeout(() => {
        setDismissed(true)
      }, 30000)
      return () => clearTimeout(timer)
    }
  }, [deepLinkResult, dismissed])

  const handleClose = useCallback(() => {
    setDismissed(true)
    setTimeout(() => setDeepLinkResult(null), 300) // Wait for exit animation
  }, [setDeepLinkResult])

  const handleCopyDeepLink = useCallback(async () => {
    if (!deepLinkResult?.deepLink) return
    try {
      await navigator.clipboard.writeText(deepLinkResult.deepLink)
      toast.success('Deep link copied!')
    } catch {
      toast.error('Failed to copy')
    }
  }, [deepLinkResult])

  const handleCopyShortLink = useCallback(async () => {
    if (!deepLinkResult?.shortCode) return
    const shortUrl = `${window.location.origin}/s/${deepLinkResult.shortCode}`
    try {
      await navigator.clipboard.writeText(shortUrl)
      toast.success('Short link copied!')
    } catch {
      toast.error('Failed to copy')
    }
  }, [deepLinkResult])

  const truncateUrl = (url: string, maxLength: number = 50) => {
    if (url.length <= maxLength) return url
    return url.slice(0, maxLength) + '...'
  }

  const visible = !!deepLinkResult && !dismissed

  return (
    <AnimatePresence>
      {visible && deepLinkResult && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="premium-border glass-card p-4 sm:p-6 space-y-4 relative"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Link2 className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Link Processed</h3>
            {detectedPlatform && <PlatformBadge platform={detectedPlatform} />}
          </div>

          {/* Link Details */}
          <div className="space-y-3">
            {/* Original URL */}
            <div className="flex items-start gap-2">
              <span className="text-xs text-muted-foreground w-20 pt-0.5 shrink-0">Original</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm text-foreground/80 font-mono break-all cursor-default">
                    {truncateUrl(deepLinkResult.originalUrl, 60)}
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p className="break-all text-xs">{deepLinkResult.originalUrl}</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Deep Link */}
            <div className="flex items-start gap-2">
              <span className="text-xs text-muted-foreground w-20 pt-0.5 shrink-0">Deep Link</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm text-primary font-mono break-all cursor-default">
                    {truncateUrl(deepLinkResult.deepLink, 60)}
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p className="break-all text-xs">{deepLinkResult.deepLink}</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Short Code */}
            {deepLinkResult.shortCode && (
              <div className="flex items-start gap-2">
                <span className="text-xs text-muted-foreground w-20 pt-0.5 shrink-0">Short Code</span>
                <span className="text-sm text-amber-400 font-mono">
                  {deepLinkResult.shortCode}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green-sm"
              onClick={() => {
                try {
                  window.open(deepLinkResult.deepLink, '_blank')
                } catch {
                  window.open(deepLinkResult.webUrl, '_blank')
                }
              }}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open in App
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => window.open(deepLinkResult.webUrl, '_blank')}
            >
              <Globe className="h-3.5 w-3.5" />
              Open in Browser
            </Button>

            <Button size="sm" variant="ghost" onClick={handleCopyDeepLink}>
              <Copy className="h-3.5 w-3.5" />
              Copy Deep Link
            </Button>

            {deepLinkResult.shortCode && (
              <Button size="sm" variant="ghost" onClick={handleCopyShortLink}>
                <Link2 className="h-3.5 w-3.5" />
                Copy Short Link
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
