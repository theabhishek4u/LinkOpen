'use client'

import { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Copy, Share2, QrCode, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useLinkStore } from '@/store/link-store'
import { toast } from 'sonner'

export function QRGenerator() {
  const { showQRCode, setShowQRCode, inputUrl, deepLinkResult, qrCodeDataUrl, setQrCodeDataUrl } =
    useLinkStore()
  const [isLoading, setIsLoading] = useState(false)

  const linkToEncode = deepLinkResult?.deepLink || inputUrl

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setShowQRCode(open)
      if (open && linkToEncode && !qrCodeDataUrl) {
        setIsLoading(true)
        fetch('/api/qrcode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: linkToEncode }),
        })
          .then((res) => res.json())
          .then((json) => {
            const data = json.data || json
            if (data.qrCodeDataUrl) {
              setQrCodeDataUrl(data.qrCodeDataUrl)
            }
          })
          .catch(() => {
            toast.error('Failed to generate QR code')
          })
          .finally(() => {
            setIsLoading(false)
          })
      }
    },
    [showQRCode, linkToEncode, qrCodeDataUrl, setQrCodeDataUrl, setShowQRCode]
  )

  const handleDownload = useCallback(() => {
    if (!qrCodeDataUrl) return

    const link = document.createElement('a')
    link.download = `linkverse-qr-${Date.now()}.png`
    link.href = qrCodeDataUrl
    link.click()
    toast.success('QR code downloaded!')
  }, [qrCodeDataUrl])

  const handleCopyQR = useCallback(async () => {
    if (!qrCodeDataUrl) return

    try {
      // Convert data URL to blob for clipboard
      const response = await fetch(qrCodeDataUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ])
      toast.success('QR code image copied!')
    } catch {
      toast.error('Failed to copy QR code')
    }
  }, [qrCodeDataUrl])

  const handleShare = useCallback(async () => {
    if (!qrCodeDataUrl || !linkToEncode) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'LinkVerse QR Code',
          text: `Scan this QR code or open: ${linkToEncode}`,
          url: linkToEncode,
        })
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(linkToEncode)
      toast.success('Link copied (Share not supported)')
    }
  }, [qrCodeDataUrl, linkToEncode])

  const truncateUrl = (url: string, maxLen: number = 40) => {
    if (url.length <= maxLen) return url
    return url.slice(0, maxLen) + '...'
  }

  return (
    <Dialog open={showQRCode} onOpenChange={handleOpenChange}>
      <DialogContent className="glass-card border-border/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            QR Code
          </DialogTitle>
          <DialogDescription>
            Scan this QR code to open the link on any device
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {/* QR Code Display */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-56 w-56 items-center justify-center rounded-xl border border-border/50 bg-background"
              >
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </motion.div>
            ) : qrCodeDataUrl ? (
              <motion.div
                key="qrcode"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="rounded-xl border border-border/50 bg-white p-3 relative overflow-hidden"
              >
                {/* Scan line animation */}
                <div className="scan-line" />
                <img
                  src={qrCodeDataUrl}
                  alt="QR Code"
                  className="h-48 w-48 pixel-reveal"
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-56 w-56 items-center justify-center rounded-xl border border-border/50 bg-background"
              >
                <QrCode className="h-12 w-12 text-muted-foreground/30" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* URL Display */}
          {linkToEncode && (
            <p className="text-xs text-muted-foreground font-mono text-center max-w-sm break-all">
              {truncateUrl(linkToEncode, 60)}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleDownload}
              disabled={!qrCodeDataUrl}
              className="download-icon-bounce"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopyQR}
              disabled={!qrCodeDataUrl}
            >
              <Copy className="h-3.5 w-3.5" />
              Copy Image
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={handleShare}
              disabled={!qrCodeDataUrl}
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
