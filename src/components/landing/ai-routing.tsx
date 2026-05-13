'use client'

import { useState, useEffect } from 'react'
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
    glow: 'oklch(0.488 0.243 264.376 / 15%)',
  },
  {
    icon: Brain,
    label: 'AI Detection',
    description: 'AI analyzes URL structure & content',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
    glow: 'oklch(0.696 0.17 162.48 / 15%)',
    isActive: true,
  },
  {
    icon: Target,
    label: 'Platform Match',
    description: 'Identifies the target platform',
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/30',
    glow: 'oklch(0.769 0.188 70.08 / 15%)',
  },
  {
    icon: Zap,
    label: 'Deep Link Gen',
    description: 'Generates the native deep link',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/15',
    border: 'border-cyan-500/30',
    glow: 'oklch(0.65 0.2 200 / 15%)',
  },
  {
    icon: Smartphone,
    label: 'Native App Open',
    description: 'Opens directly in the native app',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
    glow: 'oklch(0.696 0.17 162.48 / 15%)',
  },
]

const highlights = [
  { icon: Brain, label: 'Content type detection', color: 'text-violet-400' },
  { icon: Monitor, label: 'Device-aware routing', color: 'text-cyan-400' },
  { icon: Smartphone, label: 'Mobile optimization', color: 'text-emerald-400' },
  { icon: Shield, label: 'Fallback intelligence', color: 'text-amber-400' },
  { icon: CheckCircle2, label: 'Predictive behavior', color: 'text-rose-400' },
]

// Data flow dot component that animates along connection lines
function DataFlowDots({ activeStep }: { activeStep: number }) {
  return (
    <div className="absolute left-[19px] top-0 bottom-0 pointer-events-none">
      {flowSteps.map((_, i) => {
        if (i >= flowSteps.length - 1) return null
        const isActive = i === activeStep || i === activeStep - 1
        return (
          <div
            key={i}
            className="absolute"
            style={{
              top: `${i * 100 + 52}px`,
              left: 0,
              width: '2px',
              height: '16px',
            }}
          >
            {isActive && (
              <>
                {/* Primary data particle */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width: '4px',
                    height: '4px',
                    background: 'oklch(0.696 0.17 162.48)',
                    boxShadow: '0 0 6px oklch(0.696 0.17 162.48 / 60%)',
                    animation: 'data-particle-flow 1.5s linear infinite',
                  }}
                />
                {/* Secondary trailing particle */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width: '3px',
                    height: '3px',
                    background: 'oklch(0.488 0.243 264.376 / 80%)',
                    boxShadow: '0 0 4px oklch(0.488 0.243 264.376 / 40%)',
                    animation: 'data-particle-flow 1.5s linear infinite 0.4s',
                  }}
                />
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function AIRouting() {
  const [activeStep, setActiveStep] = useState(1) // AI Detection is default active

  // Auto-advance animation that cycles through steps every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % flowSteps.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative py-20 sm:py-28">
      {/* Decorative dot pattern behind the flow */}
      <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            <span className="gradient-text-animated">AI-Powered Smart Routing</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Our intelligent routing system analyzes every link and determines the
            optimal path to open it natively
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">
          {/* Flow diagram - takes 3 columns */}
          <div className="lg:col-span-3">
            <div className="flex flex-col gap-0 relative">
              {/* Data flow dots */}
              <DataFlowDots activeStep={activeStep} />

              {flowSteps.map((step, i) => {
                const Icon = step.icon
                const isCurrentlyActive = i === activeStep
                return (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.15 }}
                    className="relative"
                  >
                    {/* Animated connecting dashed line */}
                    {i < flowSteps.length - 1 && (
                      <div className="absolute left-6 top-[52px] w-0.5 h-4 overflow-hidden">
                        <svg width="2" height="16" className="overflow-visible">
                          <line
                            x1="1" y1="0" x2="1" y2="16"
                            stroke={isCurrentlyActive ? 'oklch(0.696 0.17 162.48 / 50%)' : 'oklch(0.696 0.17 162.48 / 25%)'}
                            strokeWidth="2"
                            className="dash-animate"
                            style={{
                              strokeDasharray: '6 4',
                              animation: 'dash-flow 1s linear infinite',
                            }}
                          />
                        </svg>
                      </div>
                    )}
                    <div
                      className={`glass-card hover-lift p-4 flex items-center gap-4 border-l-2 ${step.border} relative transition-all duration-500`}
                      style={{
                        boxShadow: isCurrentlyActive
                          ? `0 0 30px ${step.glow}, 0 0 60px ${step.glow.replace('15%', '8%')}`
                          : `0 0 20px ${step.glow}`,
                        transform: isCurrentlyActive ? 'scale(1.02)' : 'scale(1)',
                      }}
                    >
                      {/* Active step processing animation */}
                      {(step.isActive || isCurrentlyActive) && (
                        <div className="absolute -left-0.5 top-0 bottom-0 w-1 rounded-full overflow-hidden">
                          <div
                            className={`w-full h-full bg-emerald-400 ${isCurrentlyActive ? 'step-active-glow' : 'animate-processing'}`}
                            style={{ transformOrigin: 'center' }}
                          />
                        </div>
                      )}

                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-lg ${step.bg} flex items-center justify-center transition-all duration-300`}
                        style={{
                          transform: isCurrentlyActive ? 'scale(1.1)' : 'scale(1)',
                          boxShadow: isCurrentlyActive ? `0 0 15px ${step.glow}` : 'none',
                        }}
                      >
                        <Icon className={`size-5 ${step.color}`} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm text-foreground">
                          {step.label}
                          {(step.isActive || isCurrentlyActive) && (
                            <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-emerald-400/80 font-normal">
                              {isCurrentlyActive ? (
                                <>
                                  <span className="processing-dots inline-flex gap-0.5">
                                    <span className="dot-1 w-1 h-1 rounded-full bg-emerald-400 inline-block" />
                                    <span className="dot-2 w-1 h-1 rounded-full bg-emerald-400 inline-block" />
                                    <span className="dot-3 w-1 h-1 rounded-full bg-emerald-400 inline-block" />
                                  </span>
                                  Processing
                                </>
                              ) : (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  Active
                                </>
                              )}
                            </span>
                          )}
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
                      className="flex items-center gap-3 group slide-in-hover"
                    >
                      <div className="w-8 h-8 rounded-md bg-accent/50 flex items-center justify-center group-hover:bg-accent transition-colors">
                        <Icon className={`size-4 ${item.color}`} />
                      </div>
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        {item.label}
                      </span>
                    </motion.div>
                  )
                })}
              </div>

              {/* Step progress indicator */}
              <div className="mt-6 pt-4 border-t border-border/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">Processing Pipeline</span>
                  <span className="text-[10px] text-emerald-400 font-medium">Step {activeStep + 1}/{flowSteps.length}</span>
                </div>
                <div className="flex gap-1">
                  {flowSteps.map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 h-1 rounded-full transition-all duration-500"
                      style={{
                        background: i <= activeStep
                          ? 'oklch(0.696 0.17 162.48)'
                          : 'oklch(0.93 0.01 270 / 10%)',
                        boxShadow: i === activeStep ? '0 0 8px oklch(0.696 0.17 162.48 / 40%)' : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
