'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, Plus, X, Pencil, Check, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useLinkStore, type LinkTag } from '@/store/link-store'
import { toast } from 'sonner'

export function LinkTags() {
  const { linkTags, addTag, removeTag, updateTag, filterByTag, setFilterByTag } = useLinkStore()
  const [showAddInput, setShowAddInput] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#10b981')
  const [editingTagId, setEditingTagId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')

  const handleAddTag = () => {
    if (!newTagName.trim()) return
    if (linkTags.some(t => t.name.toLowerCase() === newTagName.trim().toLowerCase())) {
      toast.error('Tag already exists')
      return
    }
    addTag({ name: newTagName.trim(), color: newTagColor })
    setNewTagName('')
    setShowAddInput(false)
    toast.success(`Tag "${newTagName.trim()}" created`, {
      description: 'You can now assign it to links',
    })
  }

  const handleStartEdit = (tag: LinkTag) => {
    setEditingTagId(tag.id)
    setEditName(tag.name)
    setEditColor(tag.color)
  }

  const handleSaveEdit = () => {
    if (!editingTagId || !editName.trim()) return
    updateTag(editingTagId, { name: editName.trim(), color: editColor })
    setEditingTagId(null)
    toast.success('Tag updated')
  }

  const handleDeleteTag = (tag: LinkTag) => {
    removeTag(tag.id)
    if (filterByTag === tag.id) setFilterByTag(null)
    toast.success(`Tag "${tag.name}" deleted`)
  }

  const handleFilterByTag = (tagId: string | null) => {
    setFilterByTag(filterByTag === tagId ? null : tagId)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Tags</span>
          {filterByTag && (
            <span className="text-[9px] text-primary/60 flex items-center gap-0.5">
              <Filter className="h-2 w-2" />
              Filtering
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAddInput(!showAddInput)}
          className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Add tag input */}
      <AnimatePresence>
        {showAddInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="relative">
                <input
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className="w-6 h-6 rounded-md cursor-pointer border border-border/30 bg-transparent"
                />
              </div>
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Tag name..."
                className="h-7 text-xs bg-background/40 border-border/50"
                autoFocus
              />
              <Button
                size="sm"
                onClick={handleAddTag}
                disabled={!newTagName.trim()}
                className="h-7 px-2 text-[10px] bg-primary text-primary-foreground"
              >
                Add
              </Button>
              <button
                onClick={() => { setShowAddInput(false); setNewTagName('') }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tag pills with filter */}
      <div className="flex flex-wrap gap-1.5">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => handleFilterByTag(null)}
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${
            filterByTag === null
              ? 'bg-foreground/10 text-foreground border border-foreground/20'
              : 'bg-muted/30 text-muted-foreground hover:text-foreground border border-transparent'
          }`}
        >
          <Filter className="h-2.5 w-2.5" />
          All
        </motion.button>

        {linkTags.map((tag) => (
          <motion.div
            key={tag.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="group relative"
          >
            {editingTagId === tag.id ? (
              <div className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 bg-muted/40 border border-border/30">
                <input
                  type="color"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="w-4 h-4 rounded-full cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                  className="w-16 bg-transparent text-[10px] text-foreground outline-none"
                  autoFocus
                />
                <button onClick={handleSaveEdit} className="text-emerald-400 hover:text-emerald-300">
                  <Check className="h-3 w-3" />
                </button>
                <button onClick={() => setEditingTagId(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    onClick={() => handleFilterByTag(tag.id)}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${
                      filterByTag === tag.id
                        ? 'text-white border border-transparent'
                        : 'bg-muted/30 text-muted-foreground hover:text-foreground border border-transparent'
                    }`}
                    style={filterByTag === tag.id ? {
                      backgroundColor: tag.color,
                      borderColor: `${tag.color}60`,
                    } : {}}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-40 p-2" align="start">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleStartEdit(tag)}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit tag
                    </button>
                    <button
                      onClick={() => handleDeleteTag(tag)}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      <X className="h-3 w-3" />
                      Delete tag
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export function LinkTagBadges({ tags, linkId }: { tags?: string[]; linkId: string }) {
  const { linkTags, removeTagFromLink } = useLinkStore()

  if (!tags || tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tagId) => {
        const tag = linkTags.find(t => t.id === tagId)
        if (!tag) return null
        return (
          <Badge
            key={tagId}
            variant="outline"
            className="h-4 text-[8px] px-1.5 border-0 group-hover/tag:pr-0.5 transition-all cursor-default"
            style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
          >
            {tag.name}
            <button
              onClick={(e) => {
                e.stopPropagation()
                removeTagFromLink(linkId, tagId)
              }}
              className="ml-0.5 opacity-0 group-hover/tag:opacity-100 transition-opacity hover:text-red-400"
            >
              <X className="h-2 w-2" />
            </button>
          </Badge>
        )
      })}
    </div>
  )
}

export function TagAssignPopover({ linkId, existingTags }: { linkId: string; existingTags?: string[] }) {
  const { linkTags, addTagToLink, removeTagFromLink } = useLinkStore()
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="rounded-md p-1 hover:bg-accent transition-colors"
        >
          <Tag className="h-3.5 w-3.5 text-muted-foreground hover:text-primary transition-colors" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="end" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-1">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-1">
            Assign Tags
          </p>
          {linkTags.map((tag) => {
            const isAssigned = existingTags?.includes(tag.id)
            return (
              <button
                key={tag.id}
                onClick={() => {
                  if (isAssigned) {
                    removeTagFromLink(linkId, tag.id)
                  } else {
                    addTagToLink(linkId, tag.id)
                  }
                }}
                className={`flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-xs transition-colors ${
                  isAssigned
                    ? 'bg-accent/50 text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 border transition-all"
                  style={{
                    backgroundColor: isAssigned ? tag.color : 'transparent',
                    borderColor: isAssigned ? tag.color : tag.color,
                  }}
                />
                <span className="flex-1 text-left">{tag.name}</span>
                {isAssigned && (
                  <Check className="h-3 w-3" style={{ color: tag.color }} />
                )}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
