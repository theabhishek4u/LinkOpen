'use client'

import { useCallback, useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, ExternalLink, Copy, Share2, QrCode, Loader2, Link2, ClipboardPaste, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLinkStore } from '@/store/link-store'
import { detectPlatform, validateUrl } from '@/lib/platform-detect'
import { PlatformBadge } from './platform-badge'
import { toast } from 'sonner'

export interface SmartInputHandle {
  focus: () => void
  openInApp: () => void
  copyLink: () => void
  generateQR: () => void
}

export const SmartInput = forwardRef<SmartInputHandle>(function SmartInput(_, ref) {
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
  const [isFocused, setIsFocused] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    openInApp: handleOpenInApp,
    copyLink: handleCopyLink,
    generateQR: handleQRCode,
  }))

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

  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setInputUrl(text)
        setError(null)
        toast.success('Pasted from clipboard')
      }
    } catch {
      toast.error('Unable to access clipboard')
    }
  }, [setInputUrl])

  const handleClear = useCallback(() => {
    setInputUrl('')
    setError(null)
    inputRef.current?.focus()
  }, [setInputUrl])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && inputUrl.trim() && !isProcessing) {
        handleOpenInApp()
      }
    },
    [handleOpenInApp, inputUrl, isProcessing]
  )

  const isUrlValid = validateUrl(inputUrl).valid

  // Compute deep link preview
  const deepLinkPreview = detectedPlatform
    ? inputUrl.replace(/^https?:\/\/(www\.)?/i, detectedPlatform.deepLinkScheme)
    : null

  return (
    <div className="w-full space-y-4">
      {/* Main Input Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`relative rounded-xl transition-all duration-300 ${
          isFocused ? 'premium-border' : ''
        } ${
          detectedPlatform ? 'glow-green-sm' : ''
        }`}
      >
        <div
          className={`glass-card p-4 sm:p-6 rounded-xl transition-all duration-300 ${
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
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                placeholder="Paste any social media link here..."
                className={`w-full bg-transparent text-foreground placeholder:text-muted-foreground text-base sm:text-lg outline-none pr-20 ${
                  error ? 'text-red-400' : ''
                }`}
                disabled={isProcessing}
              />

              {/* Right side controls */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {/* Platform Badge */}
                <AnimatePresence>
                  {detectedPlatform && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                      <PlatformBadge platform={detectedPlatform} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Clear button */}
                <AnimatePresence>
                  {inputUrl.trim() && !detectedPlatform && (
                    <motion.button
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleClear}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Paste from Clipboard Button */}
            <AnimatePresence>
              {!inputUrl.trim() && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePasteFromClipboard}
                    className="h-9 w-9 text-muted-foreground hover:text-foreground"
                    title="Paste from clipboard"
                  >
                    <ClipboardPaste className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

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

          {/* Deep Link Preview */}
          <AnimatePresence>
            {detectedPlatform && deepLinkPreview && inputUrl.trim() && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-border/30">
                  <div className="flex items-center gap-2">
                    <Link2 className="h-3 w-3 text-primary/60 shrink-0" />
                    <span className="text-xs text-muted-foreground/60 font-mono truncate">
                      {deepLinkPreview}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
        </div>
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
})
