'use client'

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

export default function Platforms() {
  const platforms = getAllPlatforms()

  return (
    <section className="relative py-20 sm:py-28">
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
            <span className="gradient-text">{platforms.length} Platforms Supported</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            We support all major social media platforms with intelligent deep linking
          </p>
        </motion.div>

        {/* Platform grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {platforms.map((platform) => (
            <motion.div
              key={platform.id}
              variants={cardVariants}
              className="glass-card hover-lift p-4 sm:p-5 cursor-default relative overflow-hidden group animated-border-glow"
              style={{
                borderLeft: `3px solid ${platform.color}40`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 25px ${platform.color}15, 0 0 50px ${platform.color}08, 0 8px 30px oklch(0 0 0 / 30%)`
                ;(e.currentTarget as HTMLElement).style.borderLeftColor = `${platform.color}80`
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = ''
                ;(e.currentTarget as HTMLElement).style.borderLeftColor = `${platform.color}40`
              }}
            >
              {/* Hover glow accent */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 10% 50%, ${platform.color}10, transparent 70%)`,
                }}
              />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `${platform.color}15`,
                      boxShadow: `0 0 0 0 ${platform.color}00`,
                    }}
                  >
                    {platform.icon}
                  </div>
                  <span className="font-semibold text-sm sm:text-base text-foreground">
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
                <p className="mt-2 text-xs text-muted-foreground/70 leading-relaxed">
                  Open {platform.name} links directly in the native app
                </p>
                {/* Deep link scheme */}
                <div className="mt-2.5 px-2 py-1 rounded bg-surface-2/50 border border-border/10">
                  <code className="text-[10px] text-emerald-400/60 font-mono">
                    {platform.deepLinkScheme}
                  </code>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
