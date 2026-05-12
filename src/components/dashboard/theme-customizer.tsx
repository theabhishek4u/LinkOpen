'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Check, Palette, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

const THEME_COLORS = [
  { id: 'emerald', name: 'Emerald', color: '#10b981', hue: 160, chroma: 0.17, lightChroma: 0.14 },
  { id: 'blue', name: 'Blue', color: '#3b82f6', hue: 230, chroma: 0.19, lightChroma: 0.16 },
  { id: 'violet', name: 'Violet', color: '#8b5cf6', hue: 270, chroma: 0.18, lightChroma: 0.15 },
  { id: 'rose', name: 'Rose', color: '#f43f5e', hue: 350, chroma: 0.2, lightChroma: 0.17 },
  { id: 'amber', name: 'Amber', color: '#f59e0b', hue: 75, chroma: 0.18, lightChroma: 0.15 },
  { id: 'cyan', name: 'Cyan', color: '#06b6d4', hue: 190, chroma: 0.15, lightChroma: 0.12 },
  { id: 'orange', name: 'Orange', color: '#f97316', hue: 40, chroma: 0.2, lightChroma: 0.17 },
  { id: 'lime', name: 'Lime', color: '#84cc16', hue: 120, chroma: 0.17, lightChroma: 0.14 },
]

const STORAGE_KEY = 'linkverse-theme-color'

function hexToOkLch(hex: string): { l: number; c: number; h: number } | null {
  // Simple approximation of hex to OKLCH
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  // sRGB to linear
  const toLinear = (c: number) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  const lr = toLinear(r)
  const lg = toLinear(g)
  const lb = toLinear(b)

  // Linear RGB to OKLab
  const l_ = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb
  const m_ = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb
  const s_ = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb

  const l_c = Math.cbrt(l_)
  const m_c = Math.cbrt(m_)
  const s_c = Math.cbrt(s_)

  const L = 0.2104542553 * l_c + 0.7936177850 * m_c - 0.0040720468 * s_c
  const a = 1.9779984951 * l_c - 2.4285922050 * m_c + 0.4505937099 * s_c
  const bVal = 0.0259040371 * l_c + 0.7827717662 * m_c - 0.8086757660 * s_c

  const C = Math.sqrt(a * a + bVal * bVal)
  let H = Math.atan2(bVal, a) * 180 / Math.PI
  if (H < 0) H += 360

  return { l: L, c: C, h: H }
}

function applyThemeColor(preset: typeof THEME_COLORS[number] | { id: string; name: string; color: string; hue: number; chroma: number; lightChroma: number }) {
  const root = document.documentElement
  const { l, c, h } = hexToOkLch(preset.color) || { l: 0.55, c: preset.chroma, h: preset.hue }

  // Apply to CSS custom properties using oklch
  // Primary: the main accent color
  root.style.setProperty('--primary', `oklch(${l} ${c} ${h})`)
  root.style.setProperty('--primary-foreground', `oklch(0.98 0.002 ${h})`)

  // Adjust ring to match primary
  root.style.setProperty('--ring', `oklch(${l} ${c} ${h})`)

  // Accent with lower chroma
  root.style.setProperty('--accent', `oklch(0.92 0.02 ${h})`)
  root.style.setProperty('--accent-foreground', `oklch(0.2 0.04 ${h})`)

  // Persist to localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preset))
  } catch {
    // Ignore storage errors
  }
}

function resetThemeColor() {
  const root = document.documentElement
  // Reset to emerald defaults
  root.style.removeProperty('--primary')
  root.style.removeProperty('--primary-foreground')
  root.style.removeProperty('--ring')
  root.style.removeProperty('--accent')
  root.style.removeProperty('--accent-foreground')

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore
  }
}

function loadStoredTheme(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.id || null
    }
  } catch {
    // Ignore
  }
  return null
}

export function ThemeCustomizer() {
  const [activeColor, setActiveColor] = useState<string>('emerald')
  const [customColor, setCustomColor] = useState('#10b981')
  const [mounted, setMounted] = useState(false)

  // Load stored theme on mount
  useEffect(() => {
    const storedId = loadStoredTheme()
    if (storedId) {
      setTimeout(() => setActiveColor(storedId), 0)
    }
    setTimeout(() => setMounted(true), 0)
  }, [])

  // Apply stored theme on mount
  useEffect(() => {
    if (!mounted) return
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const preset = JSON.parse(stored)
        applyThemeColor(preset)
      }
    } catch {
      // Ignore
    }
  }, [mounted])

  const handleSelectColor = useCallback((preset: typeof THEME_COLORS[number]) => {
    setActiveColor(preset.id)
    applyThemeColor(preset)
  }, [])

  const handleCustomColor = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value
    setCustomColor(hex)
    setActiveColor('custom')

    const oklch = hexToOkLch(hex)
    const customPreset = {
      id: 'custom',
      name: 'Custom',
      color: hex,
      hue: oklch?.h ?? 160,
      chroma: oklch?.c ?? 0.17,
      lightChroma: (oklch?.c ?? 0.17) * 0.8,
    }
    applyThemeColor(customPreset)
  }, [])

  const handleReset = useCallback(() => {
    setActiveColor('emerald')
    setCustomColor('#10b981')
    resetThemeColor()
  }, [])

  if (!mounted) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary/70" />
          <h3 className="text-sm font-medium text-foreground">Accent Color</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-foreground"
          onClick={handleReset}
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </Button>
      </div>

      {/* Color Presets Grid */}
      <div className="flex flex-wrap items-center gap-2 pl-6">
        {THEME_COLORS.map((preset) => (
          <motion.button
            key={preset.id}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSelectColor(preset)}
            className="relative flex items-center justify-center h-8 w-8 rounded-full transition-all cursor-pointer focus-visible-ring"
            style={{
              backgroundColor: preset.color,
              boxShadow:
                activeColor === preset.id
                  ? `0 0 0 2px var(--background), 0 0 0 4px ${preset.color}`
                  : `0 1px 3px rgba(0,0,0,0.2)`,
            }}
            title={preset.name}
            aria-label={`Select ${preset.name} accent color`}
          >
            {activeColor === preset.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Check className="h-4 w-4 text-white drop-shadow-sm" />
              </motion.div>
            )}
          </motion.button>
        ))}

        {/* Custom Color Picker */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="relative flex items-center justify-center h-8 w-8 rounded-full border-2 border-dashed border-border/50 transition-all cursor-pointer overflow-hidden"
            style={{
              backgroundColor: activeColor === 'custom' ? customColor : 'transparent',
              boxShadow:
                activeColor === 'custom'
                  ? `0 0 0 2px var(--background), 0 0 0 4px ${customColor}`
                  : undefined,
            }}
            title="Custom color"
            aria-label="Choose a custom accent color"
          >
            {activeColor === 'custom' ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Check className="h-4 w-4 text-white drop-shadow-sm" />
              </motion.div>
            ) : (
              <span className="text-[10px] text-muted-foreground font-medium">+</span>
            )}
            <input
              type="color"
              value={customColor}
              onChange={handleCustomColor}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              aria-label="Pick a custom color"
            />
          </motion.button>
        </div>
      </div>

      {/* Active color label */}
      <p className="text-[10px] text-muted-foreground/50 pl-6">
        Active:{' '}
        <span className="text-muted-foreground/70 font-medium">
          {THEME_COLORS.find((c) => c.id === activeColor)?.name || 'Custom'}
        </span>
      </p>
    </div>
  )
}
