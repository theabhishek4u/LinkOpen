'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, ExternalLink, Copy, Share2, QrCode, Loader2, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLinkStore } from '@/store/link-store'
import { detectPlatform, validateUrl } from '@/lib/platform-detect'
import { PlatformBadge } from './platform-badge'
import { toast } from 'sonner'

export function SmartInput() {
  const {
    inputUrl,
    setInputUrl,
    detectedPlatform,
    setDetectedPlatform,
    deepLinkResult,
    setDeepLinkResult,
    isProcessing,
    setIsProcessing,
    setShowQRCode,
    addToHistory,
    setQrCodeDataUrl,
  } = useLinkStore()

  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounced platform detection
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (!inputUrl.trim()) {
      setDetectedPlatform(null)
      setError(null)
      return
    }

    debounceRef.current = setTimeout(() => {
      const platform = detectPlatform(inputUrl)
      setDetectedPlatform(platform)
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [inputUrl, setDetectedPlatform])

  const handleOpenInApp = useCallback(async () => {
    const validation = validateUrl(inputUrl)
    if (!validation.valid) {
      setError(validation.error || 'Invalid URL')
      toast.error(validation.error || 'Invalid URL')
      return
    }

    setError(null)
    setIsProcessing(true)

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: validation.normalizedUrl }),
      })

      if (!res.ok) {
        throw new Error('Failed to process link')
      }

      const json = await res.json()
      const result = json.data || json

      // Set deep link result for display
      setDeepLinkResult({
        originalUrl: result.originalUrl,
        deepLink: result.deepLink,
        webUrl: result.webUrl,
        fallbackUrl: result.fallbackUrl,
        shortCode: result.shortCode,
      })

      // Try to open the deep link
      try {
        const iframe = document.createElement('iframe')
        iframe.style.display = 'none'
        document.body.appendChild(iframe)
        iframe.contentWindow?.location.assign(result.deepLink)

        setTimeout(() => {
          document.body.removeChild(iframe)
        }, 2000)
      } catch {
        window.open(result.webUrl, '_blank')
      }

      // Record analytics (best-effort)
      try {
        await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            linkId: result.shortCode || 'unknown',
            platform: result.platform?.id || 'unknown',
            isNative: true,
          }),
        })
      } catch {
        // Analytics recording is best-effort
      }

      // Add to history
      addToHistory({
        id: crypto.randomUUID(),
        originalUrl: validation.normalizedUrl,
        platform: result.platform || { id: 'unknown', name: 'Unknown', icon: '🔗', color: '#666' },
        deepLink: result.deepLink,
        shortCode: result.shortCode,
        isFavorite: false,
        openCount: 1,
        createdAt: new Date().toISOString(),
      })

      toast.success('Deep link generated successfully!', {
        description: `Opened via ${result.platform?.name || 'app'}`,
      })
    } catch (err) {
      setError('Failed to process link. Please try again.')
      toast.error('Failed to process link')
    } finally {
      setIsProcessing(false)
    }
  }, [inputUrl, setDeepLinkResult, setIsProcessing, addToHistory])

  const handleOpenInBrowser = useCallback(() => {
    const validation = validateUrl(inputUrl)
    if (!validation.valid) {
      setError(validation.error || 'Invalid URL')
      return
    }
    window.open(validation.normalizedUrl, '_blank')

    // Record analytics
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: validation.normalizedUrl,
        platform: detectedPlatform?.id || 'unknown',
        type: 'browser',
      }),
    }).catch(() => {})
  }, [inputUrl, detectedPlatform])

  const handleCopyLink = useCallback(async () => {
    const linkToCopy = deepLinkResult?.deepLink || inputUrl
    if (!linkToCopy) return

    try {
      await navigator.clipboard.writeText(linkToCopy)
      toast.success('Link copied to clipboard!')
    } catch {
      toast.error('Failed to copy link')
    }
  }, [deepLinkResult, inputUrl])

  const handleShare = useCallback(async () => {
    const linkToShare = deepLinkResult?.deepLink || inputUrl
    if (!linkToShare) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'LinkVerse Deep Link',
          text: 'Open this link in the app',
          url: linkToShare,
        })
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(linkToShare)
      toast.success('Link copied (Share not supported)')
    }
  }, [deepLinkResult, inputUrl])

  const handleQRCode = useCallback(() => {
    if (!inputUrl.trim()) return
    setShowQRCode(true)
    setQrCodeDataUrl(null)
  }, [inputUrl, setShowQRCode, setQrCodeDataUrl])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && inputUrl.trim() && !isProcessing) {
        handleOpenInApp()
      }
    },
    [handleOpenInApp, inputUrl, isProcessing]
  )

  const isUrlValid = validateUrl(inputUrl).valid

  return (
    <div className="w-full space-y-4">
      {/* Main Input Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`glass-card p-4 sm:p-6 transition-all duration-300 ${
          error ? 'border-red-500/50' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Left Icon */}
          <div className="flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Globe className="h-5 w-5" />
            </div>
          </div>

          {/* Input */}
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value)
                setError(null)
              }}
              onKeyDown={handleKeyDown}
              placeholder="Paste any social media link here..."
              className={`w-full bg-transparent text-foreground placeholder:text-muted-foreground text-base sm:text-lg outline-none ${
                error ? 'text-red-400' : ''
              }`}
              disabled={isProcessing}
            />

            {/* Platform Badge (inline next to input) */}
            <AnimatePresence>
              {detectedPlatform && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                  <PlatformBadge platform={detectedPlatform} />
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Processing Spinner */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 text-sm text-red-400"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Action Buttons Row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-wrap items-center gap-2 sm:gap-3"
      >
        <Button
          onClick={handleOpenInApp}
          disabled={!isUrlValid || isProcessing}
          className="glow-green btn-glow bg-primary text-primary-foreground hover:bg-primary/90"
          size="default"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="hidden sm:inline">Open in App</span>
          <span className="sm:hidden">App</span>
        </Button>

        <Button
          variant="secondary"
          onClick={handleOpenInBrowser}
          disabled={!isUrlValid || isProcessing}
          size="default"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">Open in Browser</span>
          <span className="sm:hidden">Browser</span>
        </Button>

        <Button
          variant="ghost"
          onClick={handleCopyLink}
          disabled={!inputUrl.trim()}
          size="default"
        >
          <Copy className="h-4 w-4" />
          <span className="hidden sm:inline">Copy Link</span>
        </Button>

        <Button
          variant="ghost"
          onClick={handleShare}
          disabled={!inputUrl.trim()}
          size="default"
        >
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>

        <Button
          variant="ghost"
          onClick={handleQRCode}
          disabled={!inputUrl.trim()}
          size="default"
        >
          <QrCode className="h-4 w-4" />
          <span className="hidden sm:inline">QR Code</span>
        </Button>
      </motion.div>
    </div>
  )
}
