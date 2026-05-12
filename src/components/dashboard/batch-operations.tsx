'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Download, ExternalLink, X, CheckSquare, Square, Loader2 } from 'lucide-react'
import { useLinkStore } from '@/store/link-store'
import { Button } from '@/components/ui/button'

// Ripple button component with click ripple effect
function RippleButton({
  children,
  onClick,
  disabled,
  className = '',
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  className?: string
}) {
  const btnRef = useRef<HTMLButtonElement>(null)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Create ripple effect
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const size = Math.max(rect.width, rect.height) * 2

      const ripple = document.createElement('span')
      ripple.className = 'ripple-effect'
      ripple.style.width = `${size}px`
      ripple.style.height = `${size}px`
      ripple.style.left = `${x - size / 2}px`
      ripple.style.top = `${y - size / 2}px`

      btnRef.current.appendChild(ripple)
      setTimeout(() => ripple.remove(), 600)
    }

    onClick()
  }

  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      disabled={disabled}
      className={`ripple-btn ${className}`}
    >
      {children}
    </button>
  )
}

export function BatchOperationsBar() {
  const {
    selectedLinkIds,
    history,
    clearSelection,
    selectAll,
    removeFromHistory,
    addNotification,
  } = useLinkStore()

  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const allIds = history.map((item) => item.id)
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedLinkIds.includes(id))
  const count = selectedLinkIds.length

  const handleDeleteSelected = useCallback(async () => {
    if (selectedLinkIds.length === 0) return
    setIsDeleting(true)
    try {
      const res = await fetch('/api/links/batch-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedLinkIds }),
      }).catch(() => null)

      for (const id of selectedLinkIds) {
        removeFromHistory(id)
      }
      addNotification({
        type: 'link_generated',
        title: 'Links Deleted',
        description: `${selectedLinkIds.length} link(s) deleted successfully`,
      })
      clearSelection()
    } finally {
      setIsDeleting(false)
    }
  }, [selectedLinkIds, removeFromHistory, addNotification, clearSelection])

  const handleExportSelected = useCallback(async () => {
    if (selectedLinkIds.length === 0) return
    setIsExporting(true)
    try {
      const selectedLinks = history.filter((item) => selectedLinkIds.includes(item.id))
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'json',
          data: 'links',
          items: selectedLinks,
        }),
      })
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `linkverse-export-${Date.now()}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        addNotification({
          type: 'link_generated',
          title: 'Export Complete',
          description: `${selectedLinkIds.length} link(s) exported as JSON`,
        })
      }
    } catch {
      // Silently handle export error
    } finally {
      setIsExporting(false)
    }
  }, [selectedLinkIds, history, addNotification])

  const handleOpenAll = useCallback(() => {
    const selectedLinks = history.filter((item) => selectedLinkIds.includes(item.id))
    selectedLinks.forEach((item) => {
      window.open(item.deepLink, '_blank')
    })
    addNotification({
      type: 'link_generated',
      title: 'Links Opened',
      description: `${selectedLinks.length} link(s) opened in new tabs`,
    })
  }, [selectedLinkIds, history, addNotification])

  const handleToggleSelectAll = useCallback(() => {
    if (allSelected) {
      clearSelection()
    } else {
      selectAll(allIds)
    }
  }, [allSelected, clearSelection, selectAll, allIds])

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-xl"
        >
          <div
            className="rounded-xl border border-emerald-500/20 shadow-lg shadow-emerald-500/5 px-4 py-3 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, oklch(0.12 0.02 275 / 80%), oklch(0.08 0.03 162 / 60%))',
              backdropFilter: 'blur(16px) saturate(180%)',
            }}
          >
            {/* Gradient accent line at top */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{
                background: 'linear-gradient(90deg, transparent, oklch(0.696 0.17 162.48 / 40%), oklch(0.488 0.243 264.376 / 30%), oklch(0.696 0.17 162.48 / 40%), transparent)',
              }}
            />

            <div className="flex items-center gap-3">
              {/* Selected count with spring animation */}
              <div className="flex items-center gap-2 shrink-0">
                <motion.div
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 border border-emerald-500/20"
                  key={count}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <motion.span
                    className="text-xs font-bold text-emerald-400"
                    key={count}
                    initial={{ scale: 1.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    {count}
                  </motion.span>
                </motion.div>
                <span className="text-xs text-muted-foreground hidden sm:inline">selected</span>
              </div>

              {/* Separator */}
              <div className="h-5 w-px bg-border/30" />

              {/* Action buttons with ripple effect */}
              <div className="flex items-center gap-1.5 flex-1 overflow-x-auto scrollbar-none">
                <RippleButton
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                  className="h-7 px-2 text-[10px] gap-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-40 inline-flex items-center shrink-0"
                >
                  {isDeleting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                  Delete
                </RippleButton>

                <RippleButton
                  onClick={handleExportSelected}
                  disabled={isExporting}
                  className="h-7 px-2 text-[10px] gap-1 text-primary hover:bg-primary/10 rounded-md transition-colors disabled:opacity-40 inline-flex items-center shrink-0"
                >
                  {isExporting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Download className="h-3 w-3" />
                  )}
                  Export
                </RippleButton>

                <RippleButton
                  onClick={handleOpenAll}
                  className="h-7 px-2 text-[10px] gap-1 text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 rounded-md transition-colors inline-flex items-center shrink-0"
                >
                  <ExternalLink className="h-3 w-3" />
                  Open All
                </RippleButton>

                <RippleButton
                  onClick={handleToggleSelectAll}
                  className="h-7 px-2 text-[10px] gap-1 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md transition-colors inline-flex items-center shrink-0"
                >
                  {allSelected ? (
                    <CheckSquare className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Square className="h-3 w-3" />
                  )}
                  {allSelected ? 'Deselect All' : 'Select All'}
                </RippleButton>
              </div>

              {/* Separator */}
              <div className="h-5 w-px bg-border/30 shrink-0" />

              {/* Close button */}
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground shrink-0"
                onClick={clearSelection}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
