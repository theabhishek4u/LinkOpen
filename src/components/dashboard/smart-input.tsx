'use client'

import { useCallback, useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, ExternalLink, Copy, Share2, QrCode, Loader2, Link2, ClipboardPaste, X, Check, Sparkles, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLinkStore } from '@/store/link-store'
import { detectPlatform, validateUrl } from '@/lib/platform-detect'
import { extractPathFromUrl, buildDeepLinkUrl } from '@/lib/deep-link'
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
    linkExpiry,
    addNotification,
    customAlias,
    selectedCategory,
    addRecentUrl,
  } = useLinkStore()

  const [error, setError] = useState<string | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [showSparkle, setShowSparkle] = useState(false)
  const [prevPlatform, setPrevPlatform] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    openInApp: handleOpenInApp,
    copyLink: handleCopyLink,
    generateQR: handleQRCode,
  }))

  // Debounced platform detection with sparkle effect
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (!inputUrl.trim()) {
      setDetectedPlatform(null)
      setError(null)
      setPrevPlatform(null)
      return
    }

    debounceRef.current = setTimeout(() => {
      const platform = detectPlatform(inputUrl)
      setDetectedPlatform(platform)

      // Trigger sparkle when a new platform is detected
      if (platform && platform.id !== prevPlatform) {
        setShowSparkle(true)
        const timer = setTimeout(() => setShowSparkle(false), 800)
        setPrevPlatform(platform.id)
        return () => clearTimeout(timer)
      }

      if (!platform) {
        setPrevPlatform(null)
      }
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [inputUrl, setDetectedPlatform, prevPlatform])

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
        body: JSON.stringify({ 
          url: validation.normalizedUrl,
          ...(customAlias ? { customAlias } : {}),
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to process link')
      }

      const json = await res.json()
      const result = json.data || json

      setDeepLinkResult({
        originalUrl: result.originalUrl,
        deepLink: result.deepLink,
        webUrl: result.webUrl,
        fallbackUrl: result.fallbackUrl,
        shortCode: result.shortCode,
      })

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

      addToHistory({
        id: crypto.randomUUID(),
        originalUrl: validation.normalizedUrl,
        platform: result.platform || { id: 'unknown', name: 'Unknown', icon: '🔗', color: '#666' },
        deepLink: result.deepLink,
        shortCode: result.shortCode,
        isFavorite: false,
        openCount: 1,
        createdAt: new Date().toISOString(),
        expiry: linkExpiry || null,
        category: selectedCategory || null,
      })

      addNotification({
        type: 'link_generated',
        title: 'Link Generated',
        description: `${result.platform?.name || 'Unknown'} deep link created`,
      })

      addRecentUrl(validation.normalizedUrl)

      toast.success('Deep link generated successfully!', {
        description: `Opened via ${result.platform?.name || 'app'}`,
        action: {
          label: 'Open in App',
          onClick: () => window.open(result.deepLink, '_blank'),
        },
      })
    } catch (err) {
      setError('Failed to process link. Please try again.')
      toast.error('Failed to process link', {
        description: 'Please check the URL and try again',
      })
    } finally {
      setIsProcessing(false)
    }
  }, [inputUrl, setDeepLinkResult, setIsProcessing, addToHistory, customAlias, selectedCategory, addNotification, addRecentUrl])

  const handleOpenInBrowser = useCallback(() => {
    const validation = validateUrl(inputUrl)
    if (!validation.valid) {
      setError(validation.error || 'Invalid URL')
      return
    }
    window.open(validation.normalizedUrl, '_blank')

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
      toast.success('Link copied to clipboard!', {
        description: 'Deep link URL is ready to paste',
        duration: 3000,
      })
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
      toast.info('Link copied (Share not supported)', {
        description: 'Your browser does not support the Share API',
      })
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
        toast.success('Pasted from clipboard', {
          description: 'URL ready for processing',
          duration: 2000,
        })
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
  const charCount = inputUrl.length
  const maxChars = 2048

  // Compute deep link preview with proper path extraction from deep-link.ts
  const deepLinkPreview = detectedPlatform
    ? (() => {
        try {
          const normalizedUrl = inputUrl.startsWith('http') ? inputUrl : `https://${inputUrl}`
          const path = extractPathFromUrl(normalizedUrl, detectedPlatform)
          return buildDeepLinkUrl(detectedPlatform.deepLinkScheme, path)
        } catch {
          return inputUrl.replace(/^https?:\/\/(www\.)?/i, detectedPlatform.deepLinkScheme)
        }
      })()
    : null

  // Parse the deep link preview into syntax-highlighted segments
  const renderCodePreview = (preview: string) => {
    const schemeEnd = preview.indexOf('//')
    if (schemeEnd === -1) return <span className="code-path">{preview}</span>

    const scheme = preview.slice(0, schemeEnd + 2)
    const rest = preview.slice(schemeEnd + 2)
    const pathStart = rest.indexOf('/')
    const host = pathStart === -1 ? rest : rest.slice(0, pathStart)
    const path = pathStart === -1 ? '' : rest.slice(pathStart)

    return (
      <>
        <span className="code-scheme">{scheme}</span>
        <span className="code-keyword">{host}</span>
        {path && <span className="code-path">{path}</span>}
      </>
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* Main Input Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`relative rounded-xl transition-all duration-300 ${
          isProcessing
            ? 'animate-spin-border'
            : isFocused
              ? 'animate-pulse-border'
              : detectedPlatform
                ? 'glow-green-sm'
                : ''
        }`}
      >
        {/* Sparkle overlay effect */}
        <AnimatePresence>
          {showSparkle && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-xl"
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 0,
                    scale: 0,
                    x: `${20 + Math.random() * 60}%`,
                    y: `${20 + Math.random() * 60}%`,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.2, 0],
                    rotate: [0, 180, 360],
                  }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  className="absolute h-2 w-2 rounded-full bg-primary"
                  style={{
                    left: `${15 + Math.random() * 70}%`,
                    top: `${15 + Math.random() * 70}%`,
                    boxShadow: '0 0 6px oklch(0.696 0.17 162.48 / 60%)',
                  }}
                />
              ))}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1.5, 2] }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 rounded-xl"
                style={{
                  background: 'radial-gradient(circle at 50% 50%, oklch(0.696 0.17 162.48 / 15%), transparent 60%)',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className={`glass-card p-4 sm:p-6 rounded-xl transition-all duration-300 relative z-10 ${
            error ? 'border-red-500/50' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Left Icon */}
            <div className="flex-shrink-0">
              <motion.div
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"
                animate={isProcessing ? { rotate: 360 } : {}}
                transition={isProcessing ? { duration: 2, repeat: Infinity, ease: 'linear' } : {}}
              >
                {isProcessing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Globe className="h-5 w-5" />
                )}
              </motion.div>
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
                className={`w-full bg-transparent text-foreground placeholder:text-muted-foreground text-base sm:text-lg outline-none pr-24 ${
                  error ? 'text-red-400' : ''
                }`}
                disabled={isProcessing}
                aria-label="URL input"
              />

              {/* Right side controls */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {/* Platform Badge with sparkle */}
                <AnimatePresence>
                  {detectedPlatform && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className="relative"
                    >
                      <PlatformBadge platform={detectedPlatform} />
                      {/* Mini sparkle particles around the badge */}
                      {showSparkle && (
                        <>
                          <motion.span
                            initial={{ opacity: 1, scale: 0, y: 0 }}
                            animate={{ opacity: 0, scale: 1, y: -8 }}
                            transition={{ duration: 0.4 }}
                            className="absolute -top-1 left-1/2 text-[8px]"
                          >
                            ✨
                          </motion.span>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* URL validation indicator */}
                <AnimatePresence>
                  {inputUrl.trim() && !detectedPlatform && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                    >
                      {isUrlValid ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-400/60" />
                      )}
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
          </div>

          {/* Code-Style Deep Link Preview */}
          <AnimatePresence>
            {detectedPlatform && deepLinkPreview && inputUrl.trim() && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-border/30">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Sparkles className="h-3 w-3 text-primary/60 shrink-0" />
                    <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium">
                      Deep Link Preview
                    </span>
                  </div>
                  <div className="code-preview px-3 py-2 overflow-x-auto">
                    <span className="text-muted-foreground/40 mr-2 select-none">→</span>
                    {renderCodePreview(deepLinkPreview)}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Character Count & URL Validation Indicator */}
          <AnimatePresence>
            {inputUrl.trim() && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-2">
                    {isUrlValid ? (
                      <span className="flex items-center gap-1 text-emerald-400/70">
                        <Check className="h-2.5 w-2.5" />
                        Valid URL
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-400/60">
                        <AlertCircle className="h-2.5 w-2.5" />
                        Enter a valid URL
                      </span>
                    )}
                    {detectedPlatform && (
                      <span className="text-primary/50">
                        • {detectedPlatform.name} detected
                      </span>
                    )}
                  </div>
                  <span className={`${charCount > maxChars ? 'text-red-400' : 'text-muted-foreground/30'}`}>
                    {charCount}/{maxChars}
                  </span>
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
                className="mt-2 text-sm text-red-400 flex items-center gap-1.5"
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
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
