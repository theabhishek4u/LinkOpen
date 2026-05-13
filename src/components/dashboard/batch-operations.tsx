'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trash2, Download, ExternalLink, X, CheckSquare, Square, Loader2,
  Tag, Copy, Check, AlertTriangle, FileSpreadsheet, FileJson,
} from 'lucide-react'
import { useLinkStore } from '@/store/link-store'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'

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

// Helper: Convert array of objects to CSV string
function generateCSV(links: Record<string, unknown>[]): string {
  if (links.length === 0) return ''
  const headers = ['originalUrl', 'platform', 'deepLink', 'shortCode', 'openCount', 'createdAt', 'note']
  const headerRow = headers.join(',')

  const rows = links.map((link) =>
    headers.map((h) => {
      let val = ''
      if (h === 'platform') {
        val = (link.platform as Record<string, string>)?.name || ''
      } else {
        val = String(link[h] ?? '')
      }
      // Escape CSV
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        val = `"${val.replace(/"/g, '""')}"`
      }
      return val
    }).join(',')
  )

  return [headerRow, ...rows].join('\n')
}

export function BatchOperationsBar() {
  const {
    selectedLinkIds,
    history,
    linkTags,
    clearSelection,
    selectAll,
    removeFromHistory,
    addTagToLink,
    addNotification,
  } = useLinkStore()

  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isTagging, setIsTagging] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false)
  const [exportPopoverOpen, setExportPopoverOpen] = useState(false)
  const [copiedTag, setCopiedTag] = useState<string | null>(null)
  const [operationProgress, setOperationProgress] = useState<number | null>(null)

  const allIds = history.map((item) => item.id)
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedLinkIds.includes(id))
  const count = selectedLinkIds.length

  const handleDeleteSelected = useCallback(async () => {
    if (selectedLinkIds.length === 0) return
    setIsDeleting(true)
    setOperationProgress(0)
    try {
      const total = selectedLinkIds.length
      for (let i = 0; i < total; i++) {
        removeFromHistory(selectedLinkIds[i])
        setOperationProgress(Math.round(((i + 1) / total) * 100))
      }
      addNotification({
        type: 'link_generated',
        title: 'Links Deleted',
        description: `${selectedLinkIds.length} link(s) deleted successfully`,
      })
      clearSelection()
    } finally {
      setIsDeleting(false)
      setOperationProgress(null)
      setShowDeleteConfirm(false)
    }
  }, [selectedLinkIds, removeFromHistory, addNotification, clearSelection])

  const handleExportJSON = useCallback(async () => {
    if (selectedLinkIds.length === 0) return
    setIsExporting(true)
    setOperationProgress(0)
    setExportPopoverOpen(false)
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
      setOperationProgress(60)
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
        setOperationProgress(100)
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
      setTimeout(() => setOperationProgress(null), 800)
    }
  }, [selectedLinkIds, history, addNotification])

  const handleExportCSV = useCallback(() => {
    if (selectedLinkIds.length === 0) return
    setIsExporting(true)
    setExportPopoverOpen(false)
    try {
      const selectedLinks = history.filter((item) => selectedLinkIds.includes(item.id))
      const csv = generateCSV(selectedLinks as unknown as Record<string, unknown>[])
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `linkverse-export-${Date.now()}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      addNotification({
        type: 'link_generated',
        title: 'Export Complete',
        description: `${selectedLinkIds.length} link(s) exported as CSV`,
      })
    } finally {
      setIsExporting(false)
    }
  }, [selectedLinkIds, history, addNotification])

  const handleTagSelected = useCallback(async (tagId: string) => {
    if (selectedLinkIds.length === 0) return
    setIsTagging(true)
    setOperationProgress(0)
    try {
      const total = selectedLinkIds.length
      for (let i = 0; i < total; i++) {
        addTagToLink(selectedLinkIds[i], tagId)
        setOperationProgress(Math.round(((i + 1) / total) * 100))
      }
      const tagName = linkTags.find(t => t.id === tagId)?.name || tagId
      addNotification({
        type: 'link_generated',
        title: 'Tags Applied',
        description: `Tag "${tagName}" applied to ${selectedLinkIds.length} link(s)`,
      })
    } finally {
      setIsTagging(false)
      setTimeout(() => setOperationProgress(null), 800)
      setTagPopoverOpen(false)
    }
  }, [selectedLinkIds, addTagToLink, addNotification, linkTags])

  const handleCopyAll = useCallback(async () => {
    if (selectedLinkIds.length === 0) return
    setIsCopying(true)
    setOperationProgress(0)
    try {
      const selectedLinks = history.filter((item) => selectedLinkIds.includes(item.id))
      const total = selectedLinks.length
      const allLinks: string[] = []
      for (let i = 0; i < total; i++) {
        allLinks.push(selectedLinks[i].deepLink)
        setOperationProgress(Math.round(((i + 1) / total) * 100))
      }
      await navigator.clipboard.writeText(allLinks.join('\n'))
      addNotification({
        type: 'link_generated',
        title: 'Links Copied',
        description: `${selectedLinkIds.length} link(s) copied to clipboard`,
      })
    } catch {
      // Silently handle copy error
    } finally {
      setIsCopying(false)
      setTimeout(() => setOperationProgress(null), 800)
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

  const isOperating = isDeleting || isExporting || isTagging || isCopying

  return (
    <>
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
              className="rounded-xl border border-emerald-500/20 shadow-lg shadow-emerald-500/5 px-4 py-3 overflow-hidden relative"
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

              {/* Progress bar */}
              <AnimatePresence>
                {operationProgress !== null && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-0 left-0 right-0 h-0.5 bg-muted/20"
                  >
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${operationProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

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
                  {/* Delete Selected */}
                  <RippleButton
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isOperating}
                    className="h-7 px-2 text-[10px] gap-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-40 inline-flex items-center shrink-0"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                    Delete
                  </RippleButton>

                  {/* Export Selected - Popover with JSON/CSV options */}
                  <Popover open={exportPopoverOpen} onOpenChange={setExportPopoverOpen}>
                    <PopoverTrigger asChild>
                      <button
                        disabled={isOperating}
                        className="h-7 px-2 text-[10px] gap-1 text-primary hover:bg-primary/10 rounded-md transition-colors disabled:opacity-40 inline-flex items-center shrink-0"
                      >
                        {isExporting ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Download className="h-3 w-3" />
                        )}
                        Export
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-40 p-1.5" align="bottom" sideOffset={8}>
                      <button
                        onClick={handleExportJSON}
                        className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
                      >
                        <FileJson className="h-3.5 w-3.5 text-primary" />
                        Export as JSON
                      </button>
                      <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
                      >
                        <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                        Export as CSV
                      </button>
                    </PopoverContent>
                  </Popover>

                  {/* Tag Selected - Popover */}
                  <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
                    <PopoverTrigger asChild>
                      <button
                        disabled={isOperating}
                        className="h-7 px-2 text-[10px] gap-1 text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 rounded-md transition-colors disabled:opacity-40 inline-flex items-center shrink-0"
                      >
                        {isTagging ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Tag className="h-3 w-3" />
                        )}
                        Tag
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2" align="bottom" sideOffset={8}>
                      <div className="space-y-1">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-1">
                          Assign Tag to {count} link{count > 1 ? 's' : ''}
                        </p>
                        {linkTags.map((tag) => (
                          <button
                            key={tag.id}
                            onClick={() => handleTagSelected(tag.id)}
                            className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: tag.color }}
                            />
                            <span className="flex-1 text-left">{tag.name}</span>
                          </button>
                        ))}
                        {linkTags.length === 0 && (
                          <p className="text-[10px] text-muted-foreground/50 px-1 py-1">
                            No tags created yet
                          </p>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Copy All */}
                  <RippleButton
                    onClick={handleCopyAll}
                    disabled={isOperating}
                    className="h-7 px-2 text-[10px] gap-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-md transition-colors disabled:opacity-40 inline-flex items-center shrink-0"
                  >
                    {isCopying ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : copiedTag ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    Copy
                  </RippleButton>

                  {/* Open All */}
                  <RippleButton
                    onClick={handleOpenAll}
                    disabled={isOperating}
                    className="h-7 px-2 text-[10px] gap-1 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-md transition-colors disabled:opacity-40 inline-flex items-center shrink-0"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Open
                  </RippleButton>

                  {/* Select All / Deselect */}
                  <RippleButton
                    onClick={handleToggleSelectAll}
                    disabled={isOperating}
                    className="h-7 px-2 text-[10px] gap-1 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md transition-colors disabled:opacity-40 inline-flex items-center shrink-0"
                  >
                    {allSelected ? (
                      <CheckSquare className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Square className="h-3 w-3" />
                    )}
                    {allSelected ? 'None' : 'All'}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <AlertDialogTitle>Delete {count} Link{count > 1 ? 's' : ''}?</AlertDialogTitle>
                <AlertDialogDescription className="mt-1">
                  This will permanently remove {count} selected link{count > 1 ? 's' : ''} from your history. This action cannot be undone.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSelected}
              className="bg-red-500 text-white hover:bg-red-600 focus:ring-red-500"
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Deleting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete {count} Link{count > 1 ? 's' : ''}
                </span>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
