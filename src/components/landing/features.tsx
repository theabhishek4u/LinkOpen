'use client'

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
} from 'lucide-react'

const features = [
  {
    icon: Smartphone,
    title: 'Native App Opening',
    description: 'Open links directly in installed apps',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    glowColor: 'oklch(0.696 0.17 162.48)',
  },
  {
    icon: Brain,
    title: 'Smart Detection',
    description: 'AI-powered platform detection',
    color: 'text-violet-400',
    bg: 'bg-violet-500/15',
    glowColor: 'oklch(0.488 0.243 264.376)',
  },
  {
    icon: QrCode,
    title: 'QR Generator',
    description: 'Generate QR codes for any link',
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
    glowColor: 'oklch(0.769 0.188 70.08)',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Track every link open and conversion',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/15',
    glowColor: 'oklch(0.65 0.2 200)',
  },
  {
    icon: History,
    title: 'Link History',
    description: 'Access your complete link history',
    color: 'text-rose-400',
    bg: 'bg-rose-500/15',
    glowColor: 'oklch(0.645 0.246 16.439)',
  },
  {
    icon: Link2,
    title: 'Deep Linking',
    description: 'Universal deep link generation',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    glowColor: 'oklch(0.696 0.17 162.48)',
  },
  {
    icon: Monitor,
    title: 'Multi Device',
    description: 'Works across all your devices',
    color: 'text-blue-400',
    bg: 'bg-blue-500/15',
    glowColor: 'oklch(0.55 0.2 250)',
  },
  {
    icon: Globe,
    title: 'Browser Fallback',
    description: 'Graceful fallback to web browser',
    color: 'text-orange-400',
    bg: 'bg-orange-500/15',
    glowColor: 'oklch(0.7 0.18 55)',
  },
  {
    icon: Code2,
    title: 'API Access',
    description: 'RESTful API for developers',
    color: 'text-violet-400',
    bg: 'bg-violet-500/15',
    glowColor: 'oklch(0.488 0.243 264.376)',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

export default function Features() {
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
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            <span className="gradient-text-animated">Powerful Features</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need for seamless social media deep linking
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            const num = String(index + 1).padStart(2, '0')
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                className="glass-card card-shimmer hover-lift p-5 sm:p-6 group relative"
              >
                {/* Gradient number badge in top-right */}
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

                {/* Icon with larger circle + pulse on hover */}
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.bg} mb-4 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}
                  style={{
                    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease',
                  }}
                >
                  <Icon className={`size-5 ${feature.color} group-hover:rotate-6 transition-transform duration-300`} />
                </div>
                <h3 className="font-semibold text-foreground mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* Subtle bottom border gradient */}
                <div
                  className="absolute bottom-0 left-4 right-4 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${feature.glowColor} / 30%, transparent)`,
                  }}
                />
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
