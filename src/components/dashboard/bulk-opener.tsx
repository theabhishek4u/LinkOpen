'use client'

import { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Layers, Play, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface BulkOpenerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface UrlStatus {
  url: string
  status: 'pending' | 'loading' | 'done' | 'error'
}

export function BulkOpener({ open, onOpenChange }: BulkOpenerProps) {
  const [text, setText] = useState('')
  const [urls, setUrls] = useState<UrlStatus[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [cancelled, setCancelled] = useState(false)
  const cancelledRef = useRef(false)

  const processUrls = useCallback(async (items: UrlStatus[]) => {
    const updated = [...items]

    for (let i = 0; i < updated.length; i++) {
      if (cancelledRef.current) break

      updated[i] = { ...updated[i], status: 'loading' }
      setUrls([...updated])

      // Small delay for visual feedback
      await new Promise((r) => setTimeout(r, 300))

      if (cancelledRef.current) {
        // Mark remaining as pending
        for (let j = i; j < updated.length; j++) {
          if (updated[j].status === 'pending' || updated[j].status === 'loading') {
            updated[j] = { ...updated[j], status: 'pending' }
          }
        }
        setUrls([...updated])
        break
      }

      try {
        window.open(updated[i].url, '_blank', 'noopener')
        updated[i] = { ...updated[i], status: 'done' }
      } catch {
        updated[i] = { ...updated[i], status: 'error' }
      }

      setUrls([...updated])
    }

    setIsProcessing(false)

    const doneCount = updated.filter((u) => u.status === 'done').length
    if (!cancelledRef.current && doneCount > 0) {
      toast.success(`Opened ${doneCount} link${doneCount > 1 ? 's' : ''}`)
    }
  }, [])

  const handleParse = useCallback(() => {
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0)

    if (lines.length === 0) {
      toast.error('Please enter at least one URL')
      return
    }

    const parsed: UrlStatus[] = lines.map((url) => ({
      url,
      status: 'pending',
    }))

    cancelledRef.current = false
    setUrls(parsed)
    setIsProcessing(true)
    setCancelled(false)
    processUrls(parsed)
  }, [text, processUrls])

  const handleCancel = useCallback(() => {
    cancelledRef.current = true
    setCancelled(true)
    setIsProcessing(false)
  }, [])

  const handleReset = useCallback(() => {
    cancelledRef.current = true
    setText('')
    setUrls([])
    setIsProcessing(false)
    setCancelled(false)
  }, [])

  const handleClose = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        handleReset()
      }
      onOpenChange(isOpen)
    },
    [onOpenChange, handleReset]
  )

  const doneCount = urls.filter((u) => u.status === 'done').length
  const totalCount = urls.length

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-card border-border/50 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Bulk Link Opener
          </DialogTitle>
          <DialogDescription>
            Paste multiple URLs (one per line) to open them all at once
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!urls.length ? (
            <>
              {/* Text Area Input */}
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={`https://instagram.com/p/example\nhttps://youtube.com/watch?v=abc123\nhttps://twitter.com/user/status/123`}
                  className="w-full h-48 rounded-lg bg-background/60 border border-border/50 p-3 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none transition-colors"
                  disabled={isProcessing}
                />
                {text && (
                  <button
                    onClick={() => setText('')}
                    className="absolute top-2 right-2 rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {text.split('\n').filter((l) => l.trim()).length} URL(s) detected
                </span>
                <Button
                  onClick={handleParse}
                  disabled={!text.trim()}
                  className="glow-green-sm bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Play className="h-4 w-4" />
                  Open All
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Progress Display */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {isProcessing ? 'Opening links...' : cancelled ? 'Cancelled' : 'Complete'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {doneCount}/{totalCount} opened
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: totalCount > 0 ? `${(doneCount / totalCount) * 100}%` : 0 }}
                    className="h-full bg-primary rounded-full"
                    transition={{ duration: 0.3 }}
                  />
                </div>

                {/* URL List */}
                <div className="max-h-48 overflow-y-auto space-y-1 mt-3">
                  {urls.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm bg-background/40"
                    >
                      {item.status === 'pending' && (
                        <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30 shrink-0" />
                      )}
                      {item.status === 'loading' && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
                      )}
                      {item.status === 'done' && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      )}
                      {item.status === 'error' && (
                        <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                      )}
                      <span className="truncate text-foreground/80 font-mono text-xs">
                        {item.url}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end">
                {isProcessing && (
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
