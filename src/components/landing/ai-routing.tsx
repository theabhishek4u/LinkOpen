'use client'

import { motion } from 'framer-motion'
import {
  Link2,
  Brain,
  Target,
  Zap,
  Smartphone,
  CheckCircle2,
  Monitor,
  Shield,
} from 'lucide-react'

const flowSteps = [
  {
    icon: Link2,
    label: 'Input URL',
    description: 'User pastes any social media link',
    color: 'text-violet-400',
    bg: 'bg-violet-500/15',
    border: 'border-violet-500/30',
  },
  {
    icon: Brain,
    label: 'AI Detection',
    description: 'AI analyzes URL structure & content',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
  },
  {
    icon: Target,
    label: 'Platform Match',
    description: 'Identifies the target platform',
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/30',
  },
  {
    icon: Zap,
    label: 'Deep Link Gen',
    description: 'Generates the native deep link',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/15',
    border: 'border-cyan-500/30',
  },
  {
    icon: Smartphone,
    label: 'Native App Open',
    description: 'Opens directly in the native app',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
  },
]

const highlights = [
  { icon: Brain, label: 'Content type detection', color: 'text-violet-400' },
  { icon: Monitor, label: 'Device-aware routing', color: 'text-cyan-400' },
  { icon: Smartphone, label: 'Mobile optimization', color: 'text-emerald-400' },
  { icon: Shield, label: 'Fallback intelligence', color: 'text-amber-400' },
  { icon: CheckCircle2, label: 'Predictive behavior', color: 'text-rose-400' },
]

export default function AIRouting() {
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
            <span className="gradient-text">AI-Powered Smart Routing</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Our intelligent routing system analyzes every link and determines the
            optimal path to open it natively
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">
          {/* Flow diagram - takes 3 columns */}
          <div className="lg:col-span-3">
            <div className="flex flex-col gap-0">
              {flowSteps.map((step, i) => {
                const Icon = step.icon
                return (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.15 }}
                    className="relative"
                  >
                    {/* Connecting line */}
                    {i < flowSteps.length - 1 && (
                      <div className="absolute left-5 top-[52px] w-0.5 h-4 bg-gradient-to-b from-border to-transparent" />
                    )}
                    <div
                      className={`glass-card hover-lift p-4 flex items-center gap-4 border-l-2 ${step.border}`}
                    >
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-lg ${step.bg} flex items-center justify-center`}
                      >
                        <Icon className={`size-5 ${step.color}`} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm text-foreground">
                          {step.label}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {step.description}
                        </p>
                      </div>
                      {/* Arrow */}
                      {i < flowSteps.length - 1 && (
                        <div className="flex-shrink-0 ml-auto text-muted-foreground/30">
                          ↓
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Feature highlights - takes 2 columns */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="glass-card p-6">
              <h3 className="font-semibold text-lg text-foreground mb-5">
                Intelligent Features
              </h3>
              <div className="flex flex-col gap-4">
                {highlights.map((item, i) => {
                  const Icon = item.icon
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                      className="flex items-center gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-md bg-surface-3 flex items-center justify-center group-hover:bg-surface-4 transition-colors">
                        <Icon className={`size-4 ${item.color}`} />
                      </div>
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        {item.label}
                      </span>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
