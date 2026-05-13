'use client'

import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}

function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()

  if (!mounted) {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50">
        <div className="h-4 w-4" />
      </div>
    )
  }

  const isDark = theme === 'dark'

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50 hover:bg-accent transition-colors focus-ring"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="h-4 w-4 text-amber-400" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="h-4 w-4 text-violet-400" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
