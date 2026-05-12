'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check, X, AlertCircle, Link2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useLinkStore } from '@/store/link-store'

interface AliasValidation {
  status: 'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  message: string
}

export function CustomAlias() {
  const { customAlias, setCustomAlias } = useLinkStore()
  const [isOpen, setIsOpen] = useState(false)
  const [localAlias, setLocalAlias] = useState(customAlias)
  const [validation, setValidation] = useState<AliasValidation>({
    status: 'idle',
    message: '',
  })
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  // Sync local state with store
  useEffect(() => {
    setLocalAlias(customAlias)
  }, [customAlias])

  const validateAlias = useCallback((alias: string): AliasValidation => {
    if (!alias) return { status: 'idle', message: '' }

    if (alias.length < 3) {
      return { status: 'invalid', message: 'Must be at least 3 characters' }
    }

    if (alias.length > 20) {
      return { status: 'invalid', message: 'Must be 20 characters or less' }
    }

    if (!/^[a-zA-Z0-9-]+$/.test(alias)) {
      return { status: 'invalid', message: 'Only letters, numbers, and hyphens' }
    }

    if (/^-|-$/.test(alias)) {
      return { status: 'invalid', message: 'Cannot start or end with hyphen' }
    }

    // Basic profanity filter
    const blocked = ['admin', 'api', 'www', 'app', 'help', 'support', 'login', 'signup', 'auth']
    if (blocked.includes(alias.toLowerCase())) {
      return { status: 'invalid', message: 'This alias is reserved' }
    }

    return { status: 'available', message: 'Available!' }
  }, [])

  const handleAliasChange = useCallback(
    (value: string) => {
      const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '')
      setLocalAlias(sanitized)

      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }

      if (!sanitized) {
        setValidation({ status: 'idle', message: '' })
        setCustomAlias('')
        return
      }

      setValidation({ status: 'checking', message: 'Checking...' })

      const timer = setTimeout(() => {
        const result = validateAlias(sanitized)
        setValidation(result)
        if (result.status === 'available') {
          setCustomAlias(sanitized)
        } else {
          setCustomAlias('')
        }
      }, 400)

      setDebounceTimer(timer)
    },
    [debounceTimer, validateAlias, setCustomAlias]
  )

  const handleClear = useCallback(() => {
    setLocalAlias('')
    setValidation({ status: 'idle', message: '' })
    setCustomAlias('')
  }, [setCustomAlias])

  const previewUrl = localAlias ? `linkverse.app/s/${localAlias}` : ''

  return (
    <div className="space-y-0">
      {/* Advanced Options Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        Advanced Options
      </button>

      {/* Collapsible content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 glass-card rounded-lg p-3 space-y-3">
              {/* Custom alias input */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Link2 className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    Custom Alias
                  </span>
                </div>

                <div className="relative">
                  <div className="flex items-center gap-0">
                    <span className="shrink-0 text-xs text-muted-foreground/60 bg-muted/30 rounded-l-md px-2 py-1.5 border border-r-0 border-border/30 font-mono">
                      linkverse.app/s/
                    </span>
                    <div className="relative flex-1">
                      <Input
                        value={localAlias}
                        onChange={(e) => handleAliasChange(e.target.value)}
                        placeholder="my-link"
                        className={`h-8 rounded-l-none text-xs font-mono pr-7 bg-background/40 ${
                          validation.status === 'available'
                            ? 'border-emerald-500/40 focus:border-emerald-500/60'
                            : validation.status === 'invalid' || validation.status === 'taken'
                              ? 'border-red-500/40 focus:border-red-500/60'
                              : 'border-border/50'
                        }`}
                      />
                      {/* Validation indicator */}
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        {validation.status === 'available' && (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        )}
                        {validation.status === 'invalid' && (
                          <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                        )}
                        {validation.status === 'checking' && (
                          <div className="h-3 w-3 rounded-full border border-muted-foreground/30 border-t-primary animate-spin" />
                        )}
                      </div>
                    </div>
                  </div>
                  {localAlias && (
                    <button
                      onClick={handleClear}
                      className="absolute right-0 top-1/2 translate-x-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Validation message */}
                <AnimatePresence>
                  {validation.message && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`text-[10px] ${
                        validation.status === 'available'
                          ? 'text-emerald-400'
                          : validation.status === 'invalid' || validation.status === 'taken'
                            ? 'text-red-400'
                            : 'text-muted-foreground/50'
                      }`}
                    >
                      {validation.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* URL preview */}
              {previewUrl && validation.status === 'available' && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-md bg-primary/5 border border-primary/10 px-2.5 py-1.5"
                >
                  <span className="text-[9px] text-muted-foreground/50 uppercase tracking-wider">Short URL Preview</span>
                  <p className="text-xs text-primary font-mono mt-0.5">{previewUrl}</p>
                </motion.div>
              )}

              {/* Help text */}
              <p className="text-[9px] text-muted-foreground/30">
                3-20 characters, letters, numbers, and hyphens only
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
