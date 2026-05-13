'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { getAllPlatforms } from '@/lib/platform-detect'

const categoryColors: Record<string, string> = {
  social: 'bg-pink-500/15 text-pink-400 border-pink-500/25',
  messaging: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  video: 'bg-red-500/15 text-red-400 border-red-500/25',
  professional: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
  community: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
}

const categoryLabels: Record<string, string> = {
  social: 'Social',
  messaging: 'Messaging',
  video: 'Video',
  professional: 'Professional',
  community: 'Community',
}

// Platform user stats for display
const platformStats: Record<string, string> = {
  instagram: '2.1B users',
  youtube: '2.5B users',
  whatsapp: '2.0B users',
  x: '600M users',
  tiktok: '1.5B users',
  linkedin: '950M users',
  discord: '200M users',
  reddit: '100M+ users',
  telegram: '800M users',
  snapchat: '750M users',
  pinterest: '480M users',
  threads: '200M users',
  facebook: '3.0B users',
}

// Marquee platforms (duplicate list for seamless scroll)
const marqueePlatforms = [
  { emoji: '📸', name: 'Instagram', color: '#E4405F' },
  { emoji: '▶️', name: 'YouTube', color: '#FF0000' },
  { emoji: '💬', name: 'WhatsApp', color: '#25D366' },
  { emoji: '🐦', name: 'X', color: '#888888' },
  { emoji: '🎵', name: 'TikTok', color: '#ff0050' },
  { emoji: '💼', name: 'LinkedIn', color: '#0A66C2' },
  { emoji: '🎮', name: 'Discord', color: '#5865F2' },
  { emoji: '🧵', name: 'Reddit', color: '#FF4500' },
  { emoji: '✈️', name: 'Telegram', color: '#0088cc' },
  { emoji: '👻', name: 'Snapchat', color: '#FFFC00' },
  { emoji: '📌', name: 'Pinterest', color: '#E60023' },
  { emoji: '🧵', name: 'Threads', color: '#000000' },
  { emoji: '👤', name: 'Facebook', color: '#1877F2' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

// SVG Connection Lines Component with data flow dots
function ConnectionLines() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.15 }}
    >
      {/* Diagonal connection lines */}
      <line x1="15%" y1="25%" x2="35%" y2="45%" className="connection-line" stroke="oklch(0.696 0.17 162.48 / 30%)" strokeWidth="1" />
      <line x1="55%" y1="20%" x2="75%" y2="40%" className="connection-line" stroke="oklch(0.488 0.243 264.376 / 30%)" strokeWidth="1" />
      <line x1="40%" y1="55%" x2="65%" y2="70%" className="connection-line" stroke="oklch(0.769 0.188 70.08 / 30%)" strokeWidth="1" />
      <line x1="20%" y1="60%" x2="45%" y2="40%" className="connection-line" stroke="oklch(0.696 0.17 162.48 / 20%)" strokeWidth="1" />
      <line x1="70%" y1="30%" x2="85%" y2="55%" className="connection-line" stroke="oklch(0.488 0.243 264.376 / 20%)" strokeWidth="1" />
      <line x1="30%" y1="75%" x2="60%" y2="85%" className="connection-line" stroke="oklch(0.65 0.2 200 / 20%)" strokeWidth="1" />
    </svg>
  )
}

export default function Platforms() {
  const platforms = getAllPlatforms()
  const gridRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 })
  const [showSpotlight, setShowSpotlight] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )
    if (gridRef.current) observer.observe(gridRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="relative py-20 sm:py-28">
      {/* Marquee of platform icons at the top */}
      <div className="mb-16 overflow-hidden relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 z-10" style={{ background: 'linear-gradient(to right, var(--background), transparent)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-20 z-10" style={{ background: 'linear-gradient(to left, var(--background), transparent)' }} />

        <div className="marquee-track">
          {marqueePlatforms.concat(marqueePlatforms).map((platform, i) => (
            <div
              key={`${platform.name}-${i}`}
              className="flex items-center gap-3 px-6 py-3 mx-2 rounded-xl glass-card"
              style={{
                borderLeft: `3px solid ${platform.color}40`,
              }}
            >
              <span className="text-2xl">{platform.emoji}</span>
              <span className="text-sm font-semibold text-muted-foreground/70 whitespace-nowrap">{platform.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            <span className="gradient-text-smooth">{platforms.length} Platforms Supported</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            We support all major social media platforms with intelligent deep linking
          </p>
        </motion.div>

        {/* Platform grid with connection lines and dramatic hover */}
        <div
          className="relative"
          ref={gridRef}
          onMouseMove={(e) => {
            if (!gridRef.current) return
            const rect = gridRef.current.getBoundingClientRect()
            setSpotlightPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
            setShowSpotlight(true)
          }}
          onMouseLeave={() => setShowSpotlight(false)}
        >
          {/* Spotlight effect that follows the mouse cursor */}
          <div
            className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-300"
            style={{
              background: `radial-gradient(250px circle at ${spotlightPos.x}px ${spotlightPos.y}px, oklch(0.696 0.17 162.48 / 6%) 0%, transparent 70%)`,
              opacity: showSpotlight ? 1 : 0,
            }}
          />
          {/* Animated connection lines (only visible on lg+) */}
          <div className="hidden lg:block">
            <ConnectionLines />
          </div>

          {/* Central hub ring — visible when a platform is hovered */}
          <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
            <div
              className="platform-ring w-24 h-24"
              style={{
                opacity: hoveredId ? 0.5 : 0,
                transition: 'opacity 0.4s ease',
              }}
            />
            <div
              className="platform-ring w-40 h-40"
              style={{
                top: '-32px',
                left: '-32px',
                opacity: hoveredId ? 0.3 : 0,
                transition: 'opacity 0.4s ease 0.1s',
                animationDelay: '0.5s',
              }}
            />
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 relative z-10"
          >
            {platforms.map((platform, index) => (
              <motion.div
                key={platform.id}
                variants={cardVariants}
                className={`glass-card platform-dramatic-hover p-4 sm:p-5 cursor-default relative overflow-hidden group animated-border-glow scroll-reveal ${isVisible ? 'is-visible' : ''}`}
                style={{
                  borderLeft: `3px solid ${platform.color}40`,
                  transitionDelay: `${(index * 0.05) % 0.3}s`,
                }}
                onMouseEnter={(e) => {
                  setHoveredId(platform.id)
                  const el = e.currentTarget as HTMLElement
                  el.style.boxShadow = `0 0 25px ${platform.color}15, 0 0 50px ${platform.color}08, 0 12px 40px oklch(0 0 0 / 20%)`
                  el.style.borderLeftColor = `${platform.color}80`
                  el.style.borderColor = `${platform.color}40`
                }}
                onMouseLeave={(e) => {
                  setHoveredId(null)
                  const el = e.currentTarget as HTMLElement
                  el.style.boxShadow = ''
                  el.style.borderLeftColor = `${platform.color}40`
                  el.style.borderColor = ''
                }}
              >
                {/* Hover glow accent */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 10% 50%, ${platform.color}10, transparent 70%)`,
                  }}
                />

                {/* Ring pulse on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    boxShadow: `inset 0 0 30px ${platform.color}08, 0 0 0 1px ${platform.color}20`,
                    borderRadius: 'inherit',
                  }}
                />

                <div className="relative z-10 overflow-hidden">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 flex-shrink-0 icon-bob"
                      style={{
                        background: `${platform.color}15`,
                        boxShadow: `0 0 0 0 ${platform.color}00`,
                        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease',
                        animationDelay: `${index * 0.2}s`,
                      }}
                    >
                      {platform.icon}
                    </div>
                    <span className="font-semibold text-sm sm:text-base text-foreground truncate">
                      {platform.name}
                    </span>
                  </div>
                  {/* Pill-shaped category badge */}
                  <Badge
                    variant="outline"
                    className={`text-[10px] sm:text-xs rounded-full px-2.5 py-0.5 ${categoryColors[platform.category]}`}
                  >
                    {categoryLabels[platform.category]}
                  </Badge>
                  <p className="mt-2 text-xs text-muted-foreground/70 leading-relaxed truncate">
                    Open {platform.name} links directly in the native app
                  </p>
                  {/* Platform stats with ping animation */}
                  <div className="mt-2 flex items-center gap-1.5 animate-stat-ping rounded-sm">
                    <span className="text-[10px] text-muted-foreground/40">👥</span>
                    <span className="text-[10px] text-muted-foreground/50 font-medium">
                      {platformStats[platform.id] || '100M+ users'}
                    </span>
                  </div>
                  {/* Deep link scheme */}
                  <div className="mt-2.5 px-2 py-1 rounded bg-background/30 border border-border/10 overflow-hidden">
                    <code className="text-[10px] text-emerald-400/60 font-mono truncate block">
                      {platform.deepLinkScheme}
                    </code>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
