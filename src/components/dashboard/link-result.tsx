'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Globe, Copy, Link2, X, Check, ArrowRight, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { useLinkStore } from '@/store/link-store'
import { PlatformBadge } from './platform-badge'
import { toast } from 'sonner'

export function LinkResult() {
  const { deepLinkResult, setDeepLinkResult, detectedPlatform } = useLinkStore()
  const [dismissed, setDismissed] = useState(false)
  const [prevUrl, setPrevUrl] = useState<string | null>(null)
  const [copiedDeepLink, setCopiedDeepLink] = useState(false)
  const [copiedShortLink, setCopiedShortLink] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Reset dismissed state when a new result comes in
  const currentUrl = deepLinkResult?.originalUrl ?? null
  const isNewResult = currentUrl !== prevUrl

  // Auto-dismiss after 30 seconds & handle new result reset
  useEffect(() => {
    if (isNewResult && currentUrl !== null) {
      queueMicrotask(() => {
        setPrevUrl(currentUrl)
        setDismissed(false)
        setShowSuccess(true)
      })
      const timer = setTimeout(() => setShowSuccess(false), 2000)
      return () => clearTimeout(timer)
    }
    if (deepLinkResult && !dismissed) {
      const timer = setTimeout(() => {
        setDismissed(true)
      }, 30000)
      return () => clearTimeout(timer)
    }
  }, [currentUrl, deepLinkResult, dismissed, isNewResult, prevUrl])

  const handleClose = useCallback(() => {
    setDismissed(true)
    setTimeout(() => setDeepLinkResult(null), 300)
  }, [setDeepLinkResult])

  const handleCopyDeepLink = useCallback(async () => {
    if (!deepLinkResult?.deepLink) return
    try {
      await navigator.clipboard.writeText(deepLinkResult.deepLink)
      setCopiedDeepLink(true)
      toast.success('Deep link copied!', {
        description: 'Ready to paste',
        duration: 2000,
      })
      setTimeout(() => setCopiedDeepLink(false), 2000)
    } catch {
      toast.error('Failed to copy deep link', {
        description: 'Could not access clipboard',
      })
    }
  }, [deepLinkResult])

  const handleCopyShortLink = useCallback(async () => {
    if (!deepLinkResult?.shortCode) return
    const shortUrl = `${window.location.origin}/s/${deepLinkResult.shortCode}`
    try {
      await navigator.clipboard.writeText(shortUrl)
      setCopiedShortLink(true)
      toast.success('Short link copied!', {
        description: 'Ready to share',
        duration: 2000,
      })
      setTimeout(() => setCopiedShortLink(false), 2000)
    } catch {
      toast.error('Failed to copy short link', {
        description: 'Could not access clipboard',
      })
    }
  }, [deepLinkResult])

  const truncateUrl = (url: string | undefined | null, maxLength: number = 50) => {
    if (!url) return ''
    if (url.length <= maxLength) return url
    return url.slice(0, maxLength) + '...'
  }

  const visible = !!deepLinkResult && !dismissed

  return (
    <AnimatePresence>
      {visible && deepLinkResult && (
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="premium-border glass-card p-4 sm:p-6 space-y-5 relative overflow-hidden"
        >
          {/* Success Ripple Animation */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-4 left-4 pointer-events-none z-20"
              >
                <div className="relative flex h-10 w-10 items-center justify-center">
                  {/* Ripple rings */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0.5 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-full border-2 border-emerald-400"
                  />
                  <motion.div
                    initial={{ scale: 0, opacity: 0.4 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-full border border-emerald-400"
                  />
                  {/* Green checkmark */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.2 }}
                    className="relative flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <motion.path
                        d="M3 8.5L6.5 12L13 4"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="animate-check-draw"
                      />
                    </svg>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors z-20"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 flex-wrap">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400"
            >
              <Check className="h-4 w-4" />
            </motion.div>
            <motion.h3
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm font-semibold text-foreground"
            >
              Link Processed Successfully
            </motion.h3>
            {detectedPlatform && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <PlatformBadge platform={detectedPlatform} />
              </motion.div>
            )}
          </div>

          {/* Comparison View: Original → Deep Link → Short Link */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            {/* Original URL */}
            <div className="group flex items-start gap-3 rounded-lg bg-background/30 p-3 border border-border/20 hover:border-border/40 transition-colors">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted-foreground/10 text-muted-foreground mt-0.5">
                <Globe className="h-3 w-3" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium">Original URL</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm text-foreground/70 font-mono break-all cursor-default mt-0.5">
                      {truncateUrl(deepLinkResult.originalUrl, 70)}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="break-all text-xs">{deepLinkResult.originalUrl}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Arrow transition */}
            <div className="flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
              >
                <ArrowRight className="h-4 w-4 text-primary/40 rotate-90" />
              </motion.div>
            </div>

            {/* Deep Link */}
            <div className="group flex items-start gap-3 rounded-lg bg-primary/5 p-3 border border-primary/20 hover:border-primary/40 transition-colors">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/15 text-primary mt-0.5">
                <Link2 className="h-3 w-3" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-primary/50 uppercase tracking-wider font-medium">Deep Link</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm text-primary font-mono break-all cursor-default mt-0.5">
                      {truncateUrl(deepLinkResult.deepLink, 70)}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="break-all text-xs">{deepLinkResult.deepLink}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Short Code */}
            {deepLinkResult.shortCode && (
              <>
                <div className="flex justify-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
                  >
                    <ArrowRight className="h-4 w-4 text-amber-400/40 rotate-90" />
                  </motion.div>
                </div>
                <div className="group flex items-start gap-3 rounded-lg bg-amber-500/5 p-3 border border-amber-500/20 hover:border-amber-500/40 transition-colors">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-amber-500/15 text-amber-400 mt-0.5">
                    <span className="text-xs font-bold">S</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-amber-400/50 uppercase tracking-wider font-medium">Short Link</span>
                    <p className="text-sm text-amber-400 font-mono mt-0.5">
                      {window?.location?.origin || 'https://link.verse'}/s/{deepLinkResult.shortCode}
                    </p>
                  </div>
                </div>
              </>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-2 pt-1"
          >
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green-sm group"
              onClick={() => {
                try {
                  window.open(deepLinkResult.deepLink, '_blank')
                } catch {
                  window.open(deepLinkResult.webUrl, '_blank')
                }
              }}
            >
              <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
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

            {/* Copy Deep Link with animated feedback */}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopyDeepLink}
              className="relative overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {copiedDeepLink ? (
                  <motion.span
                    key="copied"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    className="flex items-center gap-1.5 text-emerald-400"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Copied!
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    className="flex items-center gap-1.5"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy Deep Link
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>

            {/* Copy Short Link with animated feedback */}
            {deepLinkResult.shortCode && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyShortLink}
                className="relative overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  {copiedShortLink ? (
                    <motion.span
                      key="copied"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      className="flex items-center gap-1.5 text-emerald-400"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Copied!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      className="flex items-center gap-1.5"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      Copy Short Link
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
