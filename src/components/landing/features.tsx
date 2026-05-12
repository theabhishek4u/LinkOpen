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
  },
  {
    icon: Brain,
    title: 'Smart Detection',
    description: 'AI-powered platform detection',
    color: 'text-violet-400',
    bg: 'bg-violet-500/15',
  },
  {
    icon: QrCode,
    title: 'QR Generator',
    description: 'Generate QR codes for any link',
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Track every link open and conversion',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/15',
  },
  {
    icon: History,
    title: 'Link History',
    description: 'Access your complete link history',
    color: 'text-rose-400',
    bg: 'bg-rose-500/15',
  },
  {
    icon: Link2,
    title: 'Deep Linking',
    description: 'Universal deep link generation',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
  },
  {
    icon: Monitor,
    title: 'Multi Device',
    description: 'Works across all your devices',
    color: 'text-blue-400',
    bg: 'bg-blue-500/15',
  },
  {
    icon: Globe,
    title: 'Browser Fallback',
    description: 'Graceful fallback to web browser',
    color: 'text-orange-400',
    bg: 'bg-orange-500/15',
  },
  {
    icon: Code2,
    title: 'API Access',
    description: 'RESTful API for developers',
    color: 'text-violet-400',
    bg: 'bg-violet-500/15',
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
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
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
            <span className="gradient-text">Powerful Features</span>
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
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                className="glass-card hover-lift p-5 sm:p-6 group"
              >
                <div
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${feature.bg} mb-4`}
                >
                  <Icon className={`size-5 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-foreground mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
