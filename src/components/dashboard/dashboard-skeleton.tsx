'use client'

import { motion } from 'framer-motion'

// Stagger timing for different skeleton sections
const staggerDelays = [0, 0.08, 0.16, 0.24, 0.32, 0.4, 0.48, 0.56]

function SkeletonPulse({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className={`skeleton-shimmer relative overflow-hidden rounded-md bg-muted/30 ${className}`}
    >
      {/* Subtle pulse overlay */}
      <motion.div
        className="absolute inset-0 bg-muted/10"
        animate={{ opacity: [0, 0.15, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.5 }}
      />
    </motion.div>
  )
}

// Pulse card wrapper for skeleton cards with subtle breathing effect
function PulseCard({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.34, 1.56, 0.64, 1] }}
      className={className}
    >
      <motion.div
        animate={{ opacity: [1, 0.85, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: delay + 1 }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen w-full mesh-gradient-subtle">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Header skeleton */}
        <PulseCard delay={staggerDelays[0]}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SkeletonPulse className="h-5 w-5 rounded" delay={0.05} />
              <SkeletonPulse className="h-8 w-32" delay={0.1} />
              <SkeletonPulse className="h-5 w-5 rounded" delay={0.15} />
            </div>
            <div className="flex items-center gap-2">
              <SkeletonPulse className="h-8 w-40 rounded-lg" delay={0.1} />
              <SkeletonPulse className="h-8 w-8 rounded-lg" delay={0.15} />
              <SkeletonPulse className="h-8 w-8 rounded-lg" delay={0.2} />
            </div>
          </div>
        </PulseCard>

        {/* Stats bar skeleton */}
        <PulseCard delay={staggerDelays[1]}>
          <div className="glass-card rounded-xl p-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-5 text-xs">
              <SkeletonPulse className="h-4 w-16" delay={0.3} />
              <SkeletonPulse className="h-3 w-px bg-border/40" delay={0.35} />
              <SkeletonPulse className="h-4 w-20" delay={0.4} />
              <SkeletonPulse className="h-3 w-px bg-border/40" delay={0.45} />
              <SkeletonPulse className="h-4 w-10" delay={0.5} />
            </div>
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3].map((i) => (
                <SkeletonPulse key={i} className="h-6 w-14 rounded-md" delay={0.3 + i * 0.05} />
              ))}
            </div>
          </div>
        </PulseCard>

        {/* Quick actions skeleton */}
        <PulseCard delay={staggerDelays[2]}>
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.5 + i * 0.05 }}
              >
                <SkeletonPulse className="h-8 w-8 rounded-full shrink-0" delay={0.5 + i * 0.05} />
              </motion.div>
            ))}
          </div>
        </PulseCard>

        {/* Input card skeleton */}
        <PulseCard delay={staggerDelays[3]}>
          <div className="glass-card rounded-xl p-4 sm:p-6 space-y-3">
            <div className="flex items-center gap-3">
              <SkeletonPulse className="h-10 w-10 rounded-lg" delay={0.6} />
              <SkeletonPulse className="h-6 flex-1" delay={0.65} />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <SkeletonPulse className="h-9 w-28 rounded-md" delay={0.7} />
              <SkeletonPulse className="h-9 w-32 rounded-md" delay={0.75} />
              <SkeletonPulse className="h-9 w-20 rounded-md" delay={0.8} />
            </div>
          </div>
        </PulseCard>

        {/* Result skeleton */}
        <PulseCard delay={staggerDelays[4]}>
          <div className="glass-card rounded-xl p-4 sm:p-6 space-y-3">
            <div className="flex items-center gap-3">
              <SkeletonPulse className="h-8 w-8 rounded-lg" delay={0.85} />
              <SkeletonPulse className="h-4 w-40" delay={0.9} />
            </div>
            <div className="space-y-2">
              <SkeletonPulse className="h-12 w-full rounded-lg" delay={0.95} />
              <div className="flex justify-center">
                <motion.div
                  animate={{ y: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <SkeletonPulse className="h-4 w-4 rounded" delay={1} />
                </motion.div>
              </div>
              <SkeletonPulse className="h-12 w-full rounded-lg" delay={1.05} />
            </div>
          </div>
        </PulseCard>

        {/* Two-column layout skeleton */}
        <PulseCard delay={staggerDelays[5]}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Analytics cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 1.1 + i * 0.1, ease: 'easeOut' }}
                  >
                    <div className="glass-card rounded-xl p-4 space-y-2 metric-gradient-border">
                      <div className="flex items-center justify-between">
                        <SkeletonPulse className="h-4 w-4 rounded" delay={1.1 + i * 0.1} />
                        <SkeletonPulse className="h-3 w-6 rounded" delay={1.15 + i * 0.1} />
                      </div>
                      <SkeletonPulse className="h-7 w-16" delay={1.2 + i * 0.1} />
                      {/* Animated progress bar skeleton */}
                      <div className="h-2 w-full rounded-full bg-muted/20 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-primary/20 progress-gradient"
                          initial={{ width: '0%' }}
                          animate={{ width: `${40 + i * 15}%` }}
                          transition={{ duration: 1, delay: 1.3 + i * 0.1, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {/* Chart skeleton */}
              <div className="glass-card rounded-xl p-4 sm:p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <SkeletonPulse className="h-4 w-24" delay={1.5} />
                  <SkeletonPulse className="h-3 w-16" delay={1.55} />
                </div>
                <div className="flex items-end gap-1.5 h-40">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 skeleton-shimmer rounded-t-sm bg-muted/20"
                      initial={{ height: '0%' }}
                      animate={{ height: `${30 + Math.random() * 70}%` }}
                      transition={{ duration: 0.8, delay: 1.6 + i * 0.08, ease: [0.34, 1.56, 0.64, 1] as const }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="lg:col-span-1 space-y-4 sm:space-y-6">
              {/* History skeleton */}
              <div className="glass-card rounded-xl p-4 sm:p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <SkeletonPulse className="h-4 w-24" delay={1.7} />
                  <SkeletonPulse className="h-3 w-12" delay={1.75} />
                </div>
                <SkeletonPulse className="h-8 w-full rounded-md" delay={1.8} />
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 1.85 + i * 0.08 }}
                    >
                      <div className="flex items-center gap-3 p-2">
                        <SkeletonPulse className="h-8 w-8 rounded-md" delay={1.85 + i * 0.08} />
                        <div className="flex-1 space-y-1.5">
                          <SkeletonPulse className="h-3 w-3/4" delay={1.9 + i * 0.08} />
                          <SkeletonPulse className="h-2 w-1/2" delay={1.95 + i * 0.08} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              {/* Activity feed skeleton */}
              <div className="glass-card rounded-xl p-4 sm:p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <SkeletonPulse className="h-4 w-20" delay={2.2} />
                  <SkeletonPulse className="h-5 w-12 rounded-full" delay={2.25} />
                </div>
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 2.3 + i * 0.08 }}
                    >
                      <div className="flex items-center gap-2 p-1.5">
                        <SkeletonPulse className="h-6 w-6 rounded-full" delay={2.3 + i * 0.08} />
                        <div className="flex-1 space-y-1">
                          <SkeletonPulse className="h-2.5 w-3/4" delay={2.35 + i * 0.08} />
                          <SkeletonPulse className="h-2 w-1/3" delay={2.4 + i * 0.08} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </PulseCard>
      </div>
    </div>
  )
}
