'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Smartphone,
  Brain,
  QrCode,
  BarChart3,
  History,
  Link2,
  Monitor,
  Globe,
  Code2,
  Sparkles,
} from 'lucide-react'

type IconAnimation = 'bounce' | 'spin' | 'pulse'

const features = [
  {
    icon: Smartphone,
    title: 'Native App Opening',
    description: 'Open links directly in installed apps',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    glowColor: 'oklch(0.696 0.17 162.48)',
    iconAnimation: 'bounce' as IconAnimation,
    featured: true,
    isNew: false,
  },
  {
    icon: Brain,
    title: 'Smart Detection',
    description: 'AI-powered platform detection',
    color: 'text-violet-400',
    bg: 'bg-violet-500/15',
    glowColor: 'oklch(0.488 0.243 264.376)',
    iconAnimation: 'pulse' as IconAnimation,
    featured: true,
    isNew: false,
  },
  {
    icon: QrCode,
    title: 'QR Generator',
    description: 'Generate QR codes for any link',
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
    glowColor: 'oklch(0.769 0.188 70.08)',
    iconAnimation: 'spin' as IconAnimation,
    featured: true,
    isNew: false,
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Track every link open and conversion',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/15',
    glowColor: 'oklch(0.65 0.2 200)',
    iconAnimation: 'bounce' as IconAnimation,
    featured: false,
    isNew: false,
  },
  {
    icon: History,
    title: 'Link History',
    description: 'Access your complete link history',
    color: 'text-rose-400',
    bg: 'bg-rose-500/15',
    glowColor: 'oklch(0.645 0.246 16.439)',
    iconAnimation: 'pulse' as IconAnimation,
    featured: false,
    isNew: false,
  },
  {
    icon: Link2,
    title: 'Deep Linking',
    description: 'Universal deep link generation',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    glowColor: 'oklch(0.696 0.17 162.48)',
    iconAnimation: 'spin' as IconAnimation,
    featured: false,
    isNew: false,
  },
  {
    icon: Monitor,
    title: 'Multi Device',
    description: 'Works across all your devices',
    color: 'text-blue-400',
    bg: 'bg-blue-500/15',
    glowColor: 'oklch(0.55 0.2 250)',
    iconAnimation: 'bounce' as IconAnimation,
    featured: false,
    isNew: false,
  },
  {
    icon: Globe,
    title: 'Browser Fallback',
    description: 'Graceful fallback to web browser',
    color: 'text-orange-400',
    bg: 'bg-orange-500/15',
    glowColor: 'oklch(0.7 0.18 55)',
    iconAnimation: 'pulse' as IconAnimation,
    featured: false,
    isNew: true,
  },
  {
    icon: Code2,
    title: 'API Access',
    description: 'RESTful API for developers',
    color: 'text-violet-400',
    bg: 'bg-violet-500/15',
    glowColor: 'oklch(0.488 0.243 264.376)',
    iconAnimation: 'spin' as IconAnimation,
    featured: false,
    isNew: true,
  },
]

// Scroll reveal hook using IntersectionObserver
function useScrollReveal() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const children = el.querySelectorAll('.scroll-reveal')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    children.forEach((child) => observer.observe(child))
    return () => observer.disconnect()
  }, [])

  return containerRef
}

export default function Features() {
  const gridRef = useScrollReveal()
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Spotlight effect — track mouse position within the grid
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!gridRef.current) return
    const rect = gridRef.current.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <section className="relative py-20 sm:py-28 mesh-gradient-subtle">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="flex items-center justify-center gap-3">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              <span className="gradient-text-smooth">Powerful Features</span>
            </h2>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              9 features
            </span>
          </div>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need for seamless social media deep linking
          </p>
        </motion.div>

        {/* Features grid with spotlight effect and scroll-reveal — Bento layout */}
        <div
          ref={gridRef}
          onMouseMove={handleMouseMove}
          className="bento-grid relative"
        >
          {/* Spotlight radial gradient that follows cursor */}
          <div
            className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-300"
            style={{
              background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, oklch(0.696 0.17 162.48 / 4%) 0%, transparent 60%)`,
              opacity: mousePos.x > 0 ? 1 : 0,
            }}
          />

          {features.map((feature, index) => {
            const Icon = feature.icon
            const num = String(index + 1).padStart(2, '0')
            const staggerClass = `scroll-reveal-stagger-${index + 1}`

            // Bento layout: top 3 featured cards are larger
            const bentoClass = feature.featured
              ? index === 0 ? 'bento-wide' : index === 1 ? 'bento-tall' : 'bento-wide'
              : ''

            return (
              <div
                key={feature.title}
                className={`scroll-reveal ${staggerClass} rotating-gradient-border glass-card card-shimmer card-tilt-hover p-5 sm:p-6 group relative ${bentoClass}`}
              >
                {/* Featured badge with rotating gradient */}
                {feature.featured && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full featured-badge-gradient border border-emerald-500/25">
                    <Sparkles className="size-3 text-emerald-400" style={{ animation: 'sparkle 2s ease-in-out infinite' }} />
                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Featured</span>
                  </div>
                )}

                {/* New badge with pulse animation */}
                {feature.isNew && !feature.featured && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full new-badge-pulse bg-amber-500/15 border border-amber-500/25">
                    <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">New</span>
                  </div>
                )}

                {/* Gradient number badge in top-right (hidden on featured/new items) */}
                {!feature.featured && !feature.isNew && (
                  <div
                    className="absolute top-4 right-4 text-xs font-bold opacity-30 group-hover:opacity-60 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${feature.glowColor} / 80%, ${feature.glowColor} / 30%)`,
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {num}
                  </div>
                )}

                {/* Icon with animation on hover — larger for featured */}
                <div
                  className={`inline-flex items-center justify-center rounded-xl ${feature.bg} mb-4 transition-all duration-300 ${feature.featured ? 'w-14 h-14' : 'w-12 h-12'}`}
                  style={{
                    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease',
                  }}
                >
                  <Icon
                    className={`${feature.featured ? 'size-6' : 'size-5'} ${feature.color} transition-transform duration-500 ${
                      feature.iconAnimation === 'bounce' ? 'group-hover:animate-bounce' :
                      feature.iconAnimation === 'spin' ? 'group-hover:animate-spin' :
                      feature.iconAnimation === 'pulse' ? 'group-hover:animate-pulse' : ''
                    }`}
                    style={{ animationDuration: feature.iconAnimation === 'spin' ? '2s' : undefined }}
                  />
                </div>
                <h3 className={`font-semibold text-foreground mb-1.5 ${feature.featured ? 'text-base sm:text-lg' : ''}`}>
                  {feature.title}
                </h3>
                <p className={`text-sm text-muted-foreground leading-relaxed ${feature.featured ? 'text-muted-foreground/80' : ''}`}>
                  {feature.description}
                </p>

                {/* Subtle bottom border gradient */}
                <div
                  className="absolute bottom-0 left-4 right-4 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${feature.glowColor} / 30%, transparent)`,
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
