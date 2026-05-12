'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Download, ExternalLink, X, CheckSquare, Square, Loader2 } from 'lucide-react'
import { useLinkStore } from '@/store/link-store'
import { Button } from '@/components/ui/button'

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
      // Delete via API
      const res = await fetch('/api/links/batch-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedLinkIds }),
      }).catch(() => null)

      // Remove from local store regardless of API result
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
          <div className="glass-card rounded-xl border border-emerald-500/20 shadow-lg shadow-emerald-500/5 px-4 py-3">
            <div className="flex items-center gap-3">
              {/* Selected count */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-xs font-bold text-emerald-400">{count}</span>
                </div>
                <span className="text-xs text-muted-foreground hidden sm:inline">selected</span>
              </div>

              {/* Separator */}
              <div className="h-5 w-px bg-border/30" />

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 flex-1 overflow-x-auto scrollbar-none">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-[10px] gap-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0"
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                  Delete
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-[10px] gap-1 text-primary hover:bg-primary/10 shrink-0"
                  onClick={handleExportSelected}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Download className="h-3 w-3" />
                  )}
                  Export
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-[10px] gap-1 text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 shrink-0"
                  onClick={handleOpenAll}
                >
                  <ExternalLink className="h-3 w-3" />
                  Open All
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-[10px] gap-1 text-muted-foreground hover:text-foreground hover:bg-accent/50 shrink-0"
                  onClick={handleToggleSelectAll}
                >
                  {allSelected ? (
                    <CheckSquare className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Square className="h-3 w-3" />
                  )}
                  {allSelected ? 'Deselect All' : 'Select All'}
                </Button>
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
