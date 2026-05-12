'use client'

import { motion } from 'framer-motion'

function SkeletonPulse({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-shimmer relative overflow-hidden rounded-md bg-muted/30 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/20 to-transparent" />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen w-full mesh-gradient-subtle">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Header skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <SkeletonPulse className="h-5 w-5 rounded" />
            <SkeletonPulse className="h-8 w-32" />
            <SkeletonPulse className="h-5 w-5 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <SkeletonPulse className="h-8 w-40 rounded-lg" />
            <SkeletonPulse className="h-8 w-8 rounded-lg" />
            <SkeletonPulse className="h-8 w-8 rounded-lg" />
          </div>
        </motion.div>

        {/* Stats bar skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="glass-card rounded-xl p-2.5 flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-5 text-xs">
            <SkeletonPulse className="h-4 w-16" />
            <SkeletonPulse className="h-3 w-px bg-border/40" />
            <SkeletonPulse className="h-4 w-20" />
            <SkeletonPulse className="h-3 w-px bg-border/40" />
            <SkeletonPulse className="h-4 w-10" />
          </div>
          <div className="flex items-center gap-1">
            <SkeletonPulse className="h-6 w-14 rounded-md" />
            <SkeletonPulse className="h-6 w-16 rounded-md" />
            <SkeletonPulse className="h-6 w-14 rounded-md" />
            <SkeletonPulse className="h-6 w-14 rounded-md" />
          </div>
        </motion.div>

        {/* Quick actions skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="flex items-center gap-2 overflow-x-auto py-1"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonPulse key={i} className="h-8 w-8 rounded-full shrink-0" />
          ))}
        </motion.div>

        {/* Input card skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="glass-card rounded-xl p-4 sm:p-6 space-y-3"
        >
          <div className="flex items-center gap-3">
            <SkeletonPulse className="h-10 w-10 rounded-lg" />
            <SkeletonPulse className="h-6 flex-1" />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <SkeletonPulse className="h-9 w-28 rounded-md" />
            <SkeletonPulse className="h-9 w-32 rounded-md" />
            <SkeletonPulse className="h-9 w-20 rounded-md" />
          </div>
        </motion.div>

        {/* Result skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="glass-card rounded-xl p-4 sm:p-6 space-y-3"
        >
          <div className="flex items-center gap-3">
            <SkeletonPulse className="h-8 w-8 rounded-lg" />
            <SkeletonPulse className="h-4 w-40" />
          </div>
          <div className="space-y-2">
            <SkeletonPulse className="h-12 w-full rounded-lg" />
            <div className="flex justify-center">
              <SkeletonPulse className="h-4 w-4 rounded" />
            </div>
            <SkeletonPulse className="h-12 w-full rounded-lg" />
          </div>
        </motion.div>

        {/* Two-column layout skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {/* Left column */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Analytics cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass-card rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <SkeletonPulse className="h-4 w-4 rounded" />
                    <SkeletonPulse className="h-3 w-6 rounded" />
                  </div>
                  <SkeletonPulse className="h-7 w-16" />
                  <SkeletonPulse className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
            {/* Chart skeleton */}
            <div className="glass-card rounded-xl p-4 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <SkeletonPulse className="h-4 w-24" />
                <SkeletonPulse className="h-3 w-16" />
              </div>
              <div className="flex items-end gap-1.5 h-40">
                {Array.from({ length: 7 }).map((_, i) => (
                  <SkeletonPulse
                    key={i}
                    className="flex-1 rounded-t-sm"
                    style={{ height: `${30 + Math.random() * 70}%` } as React.CSSProperties}
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
                <SkeletonPulse className="h-4 w-24" />
                <SkeletonPulse className="h-3 w-12" />
              </div>
              <SkeletonPulse className="h-8 w-full rounded-md" />
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <SkeletonPulse className="h-8 w-8 rounded-md" />
                    <div className="flex-1 space-y-1.5">
                      <SkeletonPulse className="h-3 w-3/4" />
                      <SkeletonPulse className="h-2 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Activity feed skeleton */}
            <div className="glass-card rounded-xl p-4 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <SkeletonPulse className="h-4 w-20" />
                <SkeletonPulse className="h-5 w-12 rounded-full" />
              </div>
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2 p-1.5">
                    <SkeletonPulse className="h-6 w-6 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <SkeletonPulse className="h-2.5 w-3/4" />
                      <SkeletonPulse className="h-2 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
