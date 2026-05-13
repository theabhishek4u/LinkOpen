'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderOpen, Plus, X, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLinkStore, type LinkCategory } from '@/store/link-store'
import { toast } from 'sonner'

export function LinkCategories() {
  const { categories, addCategory, removeCategory, selectedCategory, setSelectedCategory } = useLinkStore()
  const [showAddInput, setShowAddInput] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('#6366f1')

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return
    if (categories.some(c => c.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      toast.error('Category already exists')
      return
    }
    addCategory({ name: newCategoryName.trim(), color: newCategoryColor })
    setNewCategoryName('')
    setShowAddInput(false)
    toast.success(`Category "${newCategoryName.trim()}" added`)
  }

  const handleSelectCategory = (categoryId: string | null) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Categories</span>
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

      {/* Add category input */}
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
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  className="w-6 h-6 rounded-md cursor-pointer border border-border/30 bg-transparent"
                />
              </div>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                placeholder="Category name..."
                className="h-7 text-xs bg-background/40 border-border/50"
                autoFocus
              />
              <Button
                size="sm"
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim()}
                className="h-7 px-2 text-[10px] bg-primary text-primary-foreground"
              >
                Add
              </Button>
              <button
                onClick={() => { setShowAddInput(false); setNewCategoryName('') }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category pills */}
      <div className="flex flex-wrap gap-1.5">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => handleSelectCategory(null)}
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${
            selectedCategory === null
              ? 'bg-foreground/10 text-foreground border border-foreground/20'
              : 'bg-muted/30 text-muted-foreground hover:text-foreground border border-transparent'
          }`}
        >
          <Tag className="h-2.5 w-2.5" />
          All
        </motion.button>

        {categories.map((category) => (
          <motion.div
            key={category.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="group relative"
          >
            <button
              onClick={() => handleSelectCategory(category.id)}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${
                selectedCategory === category.id
                  ? 'text-white border border-transparent'
                  : 'bg-muted/30 text-muted-foreground hover:text-foreground border border-transparent'
              }`}
              style={selectedCategory === category.id ? {
                backgroundColor: category.color,
                borderColor: `${category.color}60`,
              } : {}}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: category.color }}
              />
              {category.name}
            </button>
            {/* Delete button (not for default categories) */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                removeCategory(category.id)
                if (selectedCategory === category.id) setSelectedCategory(null)
              }}
              className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-destructive/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-2 w-2" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export function CategorySelector() {
  const { categories, selectedCategory, setSelectedCategory } = useLinkStore()
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">Category:</span>
      <button
        onClick={() => setSelectedCategory(null)}
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-all ${
          selectedCategory === null
            ? 'bg-foreground/10 text-foreground'
            : 'bg-muted/30 text-muted-foreground hover:text-foreground'
        }`}
      >
        None
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setSelectedCategory(cat.id)}
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-all`}
          style={selectedCategory === cat.id ? {
            backgroundColor: cat.color,
            color: 'white',
          } : {}}
        >
          {!selectedCategory || selectedCategory !== cat.id ? (
            <span className="text-muted-foreground hover:text-foreground flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
              {cat.name}
            </span>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
              {cat.name}
            </>
          )}
        </button>
      ))}
    </div>
  )
}
