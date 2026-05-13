'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StickyNote, X, Check, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useLinkStore } from '@/store/link-store'

const MAX_NOTE_LENGTH = 200

interface LinkNotesProps {
  linkId: string
  currentNote?: string | null
}

export function LinkNotes({ linkId, currentNote }: LinkNotesProps) {
  const { addNoteToLink, removeNoteFromLink, updateNoteOnLink } = useLinkStore()
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(currentNote || '')
  const [isAdding, setIsAdding] = useState(false)

  const handleSave = useCallback(() => {
    const trimmed = draft.trim()
    if (!trimmed) return

    if (currentNote) {
      updateNoteOnLink(linkId, trimmed)
    } else {
      addNoteToLink(linkId, trimmed)
    }
    setIsEditing(false)
    setIsAdding(false)
  }, [draft, currentNote, linkId, addNoteToLink, updateNoteOnLink])

  const handleCancel = useCallback(() => {
    setDraft(currentNote || '')
    setIsEditing(false)
    setIsAdding(false)
  }, [currentNote])

  const handleDelete = useCallback(() => {
    removeNoteFromLink(linkId)
    setDraft('')
    setIsEditing(false)
  }, [linkId, removeNoteFromLink])

  const handleStartEdit = useCallback(() => {
    setDraft(currentNote || '')
    setIsEditing(true)
  }, [currentNote])

  const handleStartAdd = useCallback(() => {
    setDraft('')
    setIsAdding(true)
    setIsEditing(true)
  }, [])

  // No note and not editing — show "Add Note" button (appears on hover via parent)
  if (!currentNote && !isEditing) {
    return (
      <button
        onClick={handleStartAdd}
        className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-muted-foreground/60 hover:text-primary hover:bg-primary/5 transition-colors"
      >
        <StickyNote className="h-3 w-3" />
        Add Note
      </button>
    )
  }

  return (
    <div className="mt-1">
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="editor"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, MAX_NOTE_LENGTH))}
              placeholder="Add a note..."
              className="min-h-[60px] text-xs bg-background/40 border-border/50 focus:border-primary/50 resize-none p-2"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault()
                  handleSave()
                }
                if (e.key === 'Escape') {
                  handleCancel()
                }
              }}
            />
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-muted-foreground/50">
                {draft.length}/{MAX_NOTE_LENGTH}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-foreground"
                  onClick={handleCancel}
                >
                  <X className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1.5 text-[10px] text-primary hover:text-primary"
                  onClick={handleSave}
                  disabled={!draft.trim()}
                >
                  <Check className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="display"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="group/note flex items-start gap-1.5"
          >
            <StickyNote className="h-3 w-3 text-primary/50 mt-0.5 shrink-0" />
            <p className="text-[11px] text-muted-foreground italic leading-relaxed flex-1 break-words">
              {currentNote}
            </p>
            <div className="flex items-center gap-0.5 opacity-0 group-hover/note:opacity-100 transition-opacity shrink-0">
              <button
                onClick={handleStartEdit}
                className="rounded p-0.5 hover:bg-accent transition-colors"
                title="Edit note"
              >
                <Pencil className="h-2.5 w-2.5 text-muted-foreground hover:text-foreground" />
              </button>
              <button
                onClick={handleDelete}
                className="rounded p-0.5 hover:bg-destructive/20 transition-colors"
                title="Delete note"
              >
                <Trash2 className="h-2.5 w-2.5 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
