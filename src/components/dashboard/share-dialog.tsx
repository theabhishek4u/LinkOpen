'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Copy, Check, QrCode, Mail, ExternalLink, Clock, Eye, ToggleLeft, ToggleRight } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useLinkStore } from '@/store/link-store'
import { toast } from 'sonner'

interface ShareDialogProps {
  linkId?: string
  originalUrl?: string
  deepLink?: string
  platform?: string
  shortCode?: string
  trigger?: React.ReactNode
}

export function ShareDialog({
  linkId,
  originalUrl,
  deepLink,
  platform,
  shortCode,
  trigger,
}: ShareDialogProps) {
  const [open, setOpen] = useState(false)
  const [shareCode, setShareCode] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [allowDeepLinkReveal, setAllowDeepLinkReveal] = useState(true)
  const [expiresIn, setExpiresIn] = useState<number | null>(null)
  const [views, setViews] = useState(0)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  const handleCreateShare = useCallback(async () => {
    setIsCreating(true)
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkId,
          originalUrl,
          deepLink,
          platform,
          shortCode,
          allowDeepLinkReveal,
          expiresIn,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setShareCode(data.data.code)
        const fullUrl = `${window.location.origin}/s/${data.data.code}`
        setShareUrl(fullUrl)
        toast.success('Share link created!', { description: 'Ready to share', duration: 2000 })
      } else {
        toast.error('Failed to create share link', { description: data.error })
      }
    } catch {
      toast.error('Failed to create share link', { description: 'Network error' })
    } finally {
      setIsCreating(false)
    }
  }, [linkId, originalUrl, deepLink, platform, shortCode, allowDeepLinkReveal, expiresIn])

  // Poll for view count
  useEffect(() => {
    if (!shareCode || !open) return
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/share/${shareCode}`)
        const data = await response.json()
        if (data.success) {
          setViews(data.data.views)
        }
      } catch {
        // Silently fail
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [shareCode, open])

  // Generate QR code via API
  useEffect(() => {
    if (!shareUrl) return
    fetch('/api/qrcode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: shareUrl, size: 120 }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.dataUrl) {
          setQrDataUrl(data.data.dataUrl)
        }
      })
      .catch(() => { /* ignore */ })
  }, [shareUrl])

  const handleCopy = useCallback(async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Share link copied!', { duration: 1500 })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }, [shareUrl])

  const handleShareTwitter = useCallback(() => {
    if (!shareUrl) return
    const text = `Check out this link on LinkVerse!`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
  }, [shareUrl])

  const handleShareEmail = useCallback(() => {
    if (!shareUrl) return
    const subject = 'Shared Link from LinkVerse'
    const body = `Check out this link: ${shareUrl}`
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
  }, [shareUrl])

  const handleOpenSharePage = useCallback(() => {
    if (shareUrl) window.open(shareUrl, '_blank')
  }, [shareUrl])

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setShareCode(null)
      setShareUrl('')
      setCopied(false)
      setViews(0)
      setQrDataUrl(null)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground hover:text-foreground">
            <Share2 className="h-3.5 w-3.5" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="glass-card border-border/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <Share2 className="h-4 w-4 text-primary" />
            Share Link
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Options */}
          {!shareCode && (
            <div className="space-y-3">
              {/* Allow deep link reveal toggle */}
              <div className="flex items-center justify-between rounded-lg bg-background/30 p-3 border border-border/20">
                <div>
                  <p className="text-xs font-medium text-foreground">Show deep link</p>
                  <p className="text-[10px] text-muted-foreground">Allow viewers to see the deep link URL</p>
                </div>
                <button
                  onClick={() => setAllowDeepLinkReveal(!allowDeepLinkReveal)}
                  className="text-primary focus-visible-ring rounded"
                >
                  {allowDeepLinkReveal ? (
                    <ToggleRight className="h-6 w-6" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                  )}
                </button>
              </div>

              {/* Expiration */}
              <div className="space-y-2">
                <label className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                  Expiration
                </label>
                <div className="flex gap-1.5">
                  {[
                    { label: 'Never', value: null },
                    { label: '1h', value: 1 },
                    { label: '24h', value: 24 },
                    { label: '7d', value: 168 },
                    { label: '30d', value: 720 },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => setExpiresIn(opt.value)}
                      className={`rounded-md px-2.5 py-1.5 text-[10px] font-medium transition-colors focus-visible-ring ${
                        expiresIn === opt.value
                          ? 'bg-primary/15 text-primary border border-primary/30'
                          : 'bg-background/30 text-muted-foreground border border-border/20 hover:text-foreground'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Create button */}
              <Button
                onClick={handleCreateShare}
                disabled={isCreating}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Share2 className="h-3.5 w-3.5 mr-1.5" />
                {isCreating ? 'Creating...' : 'Create Share Link'}
              </Button>
            </div>
          )}

          {/* Share Result */}
          <AnimatePresence>
            {shareUrl && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-3"
              >
                {/* Shareable URL */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                    Shareable URL
                  </label>
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-2.5">
                    <p className="text-xs font-mono text-foreground/80 flex-1 break-all">{shareUrl}</p>
                    <button
                      onClick={handleCopy}
                      className="shrink-0 rounded p-1 hover:bg-emerald-500/10 transition-colors focus-visible-ring"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                {/* QR Code */}
                {qrDataUrl && (
                  <div className="flex justify-center">
                    <div className="rounded-lg bg-white p-2">
                      <img src={qrDataUrl} alt="QR Code for share link" className="h-24 w-24" />
                    </div>
                  </div>
                )}

                {/* Social Share Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleCopy}
                    className="flex-1 gap-1.5"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleShareTwitter}
                    className="flex-1 gap-1.5"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    X/Twitter
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleShareEmail}
                    className="flex-1 gap-1.5"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </Button>
                </div>

                {/* Open share page */}
                <button
                  onClick={handleOpenSharePage}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2 text-[11px] font-medium text-primary hover:bg-primary/10 transition-colors focus-visible-ring"
                >
                  <QrCode className="h-3 w-3" />
                  Open Share Page
                </button>

                {/* Views counter */}
                <div className="flex items-center justify-between rounded-lg bg-background/30 p-2.5 border border-border/20">
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-3 w-3 text-muted-foreground/60" />
                    <span className="text-[10px] text-muted-foreground">Views</span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-foreground">{views}</span>
                </div>

                {/* Expiration notice */}
                {expiresIn && (
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Link expires in {expiresIn < 24 ? `${expiresIn}h` : `${Math.round(expiresIn / 24)}d`}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}
