'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertTriangle, XCircle, ExternalLink, Monitor, Smartphone, Link2, Play, ArrowRight, ChevronRight } from 'lucide-react'
import { useLinkStore } from '@/store/link-store'
import { Button } from '@/components/ui/button'

type ComparisonStatus = 'works' | 'partial' | 'unlikely'

interface ComparisonColumn {
  title: string
  icon: React.ReactNode
  urlScheme: string
  expectedBehavior: string
  appInstalled: ComparisonStatus
  description: string
  tier: 'original' | 'deep' | 'short'
  tierColor: string
  tierBg: string
}

function StatusIndicator({ status }: { status: ComparisonStatus }) {
  switch (status) {
    case 'works':
      return (
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium">Likely</span>
        </div>
      )
    case 'partial':
      return (
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <span className="text-xs text-amber-400 font-medium">Partial</span>
        </div>
      )
    case 'unlikely':
      return (
        <div className="flex items-center gap-1.5">
          <XCircle className="h-4 w-4 text-red-400" />
          <span className="text-xs text-red-400 font-medium">Unlikely</span>
        </div>
      )
  }
}

function StatusBg({ status }: { status: ComparisonStatus }) {
  switch (status) {
    case 'works':
      return 'border-emerald-500/20 bg-emerald-500/5'
    case 'partial':
      return 'border-amber-500/20 bg-amber-500/5'
    case 'unlikely':
      return 'border-red-500/20 bg-red-500/5'
  }
}

// Animated flow arrow between tiers
function FlowArrow({ from, to }: { from: string; to: string }) {
  return (
    <div className="flex items-center justify-center py-1">
      <motion.div
        className="flex items-center gap-1"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="h-px w-6 bg-gradient-to-r from-muted-foreground/20 to-muted-foreground/40" />
        <motion.div
          className="arrow-flow"
        >
          <ChevronRight className="h-4 w-4 text-primary/50" />
        </motion.div>
        <div className="h-px w-6 bg-gradient-to-r from-muted-foreground/40 to-muted-foreground/20" />
      </motion.div>
    </div>
  )
}

// Tier label badge
function TierLabel({ tier, color }: { tier: 'original' | 'deep' | 'short'; color: string }) {
  const labels = { original: 'Original URL', deep: 'Deep Link', short: 'Short Link' }
  return (
    <motion.span
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="inline-flex items-center text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
      style={{
        color,
        backgroundColor: `${color}15`,
        border: `1px solid ${color}25`,
      }}
    >
      {labels[tier]}
    </motion.span>
  )
}

export function LinkComparison() {
  const { detectedPlatform, deepLinkResult, inputUrl } = useLinkStore()
  const [testingColumn, setTestingColumn] = useState<string | null>(null)
  const [testedColumns, setTestedColumns] = useState<Set<string>>(new Set())

  const hasResult = !!(deepLinkResult && detectedPlatform)

  const columns: ComparisonColumn[] = useMemo(() => {
    if (!hasResult || !detectedPlatform || !deepLinkResult) {
      return [
        {
          title: 'Native App',
          icon: <Smartphone className="h-4 w-4" />,
          urlScheme: 'e.g. instagram://',
          expectedBehavior: 'Opens directly in the native app',
          appInstalled: 'partial' as ComparisonStatus,
          description: 'Requires the app to be installed on the device',
          tier: 'original',
          tierColor: '#94a3b8',
          tierBg: 'bg-slate-500/5',
        },
        {
          title: 'Browser',
          icon: <Monitor className="h-4 w-4" />,
          urlScheme: 'https://...',
          expectedBehavior: 'Opens in the default web browser',
          appInstalled: 'works' as ComparisonStatus,
          description: 'Always works but suboptimal UX',
          tier: 'deep',
          tierColor: '#8b5cf6',
          tierBg: 'bg-violet-500/5',
        },
        {
          title: 'Deep Link',
          icon: <Link2 className="h-4 w-4" />,
          urlScheme: 'e.g. instagram://user',
          expectedBehavior: 'Opens in app with fallback to browser',
          appInstalled: 'works' as ComparisonStatus,
          description: 'Best of both worlds with intelligent fallback',
          tier: 'short',
          tierColor: '#10b981',
          tierBg: 'bg-emerald-500/5',
        },
      ]
    }

    const scheme = detectedPlatform.deepLinkScheme || `${detectedPlatform.id}://`
    return [
      {
        title: 'Native App',
        icon: <Smartphone className="h-4 w-4" />,
        urlScheme: scheme,
        expectedBehavior: `Opens directly in ${detectedPlatform.name} app`,
        appInstalled: 'partial' as ComparisonStatus,
        description: `Requires ${detectedPlatform.name} to be installed on the device`,
        tier: 'original',
        tierColor: '#94a3b8',
        tierBg: 'bg-slate-500/5',
      },
      {
        title: 'Browser',
        icon: <Monitor className="h-4 w-4" />,
        urlScheme: deepLinkResult.webUrl || deepLinkResult.originalUrl,
        expectedBehavior: 'Opens in the default web browser',
        appInstalled: 'works' as ComparisonStatus,
        description: 'Always works but may lack native features',
        tier: 'deep',
        tierColor: '#8b5cf6',
        tierBg: 'bg-violet-500/5',
      },
      {
        title: 'Deep Link',
        icon: <Link2 className="h-4 w-4" />,
        urlScheme: deepLinkResult.deepLink,
        expectedBehavior: `Opens in ${detectedPlatform.name} with browser fallback`,
        appInstalled: 'works' as ComparisonStatus,
        description: 'Intelligent routing: tries app first, falls back to browser',
        tier: 'short',
        tierColor: '#10b981',
        tierBg: 'bg-emerald-500/5',
      },
    ]
  }, [hasResult, detectedPlatform, deepLinkResult])

  const handleTest = (columnTitle: string, urlScheme: string) => {
    setTestingColumn(columnTitle)
    setTimeout(() => {
      setTestingColumn(null)
      setTestedColumns((prev) => new Set(prev).add(columnTitle))
    }, 1200)
    try {
      if (columnTitle === 'Native App' || columnTitle === 'Deep Link') {
        window.open(urlScheme, '_blank')
      } else {
        window.open(urlScheme.startsWith('http') ? urlScheme : inputUrl, '_blank')
      }
    } catch {
      // Silently handle
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-4 sm:p-6 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ x: [0, 3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowRight className="h-4 w-4 text-primary" />
          </motion.div>
          <h3 className="text-sm font-semibold text-foreground">Link Comparison</h3>
        </div>
        {!hasResult && (
          <span className="text-[10px] text-muted-foreground/50">Generate a link to compare</span>
        )}
      </div>

      {/* Side-by-side animated comparison with flow arrows */}
      <div className="space-y-0">
        <AnimatePresence>
          {columns.map((col, index) => (
            <motion.div
              key={col.title}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{
                duration: 0.5,
                delay: index * 0.15,
                ease: [0.34, 1.56, 0.64, 1] as const,
              }}
              className="tier-reveal"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <motion.div
                className={`rounded-xl border p-3 sm:p-4 space-y-3 ${StatusBg({ status: col.appInstalled })} ${col.tierBg}`}
                whileHover={{ scale: 1.01, y: -2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                {/* Column Header with Tier Label */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-background/60">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: index * 0.3 }}
                      >
                        {col.icon}
                      </motion.div>
                    </div>
                    <span className="text-xs font-semibold text-foreground">{col.title}</span>
                  </div>
                  <TierLabel tier={col.tier} color={col.tierColor} />
                </div>

                {/* URL Scheme with color-coded background */}
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-medium">
                    URL Scheme
                  </span>
                  <div
                    className="rounded-md p-2 border transition-all"
                    style={{
                      backgroundColor: `${col.tierColor}08`,
                      borderColor: `${col.tierColor}20`,
                    }}
                  >
                    <p
                      className="text-[11px] font-mono truncate"
                      style={{ color: col.tierColor }}
                      title={col.urlScheme}
                    >
                      {col.urlScheme}
                    </p>
                  </div>
                </div>

                {/* Expected Behavior */}
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-medium">
                    Behavior
                  </span>
                  <p className="text-xs text-muted-foreground">{col.expectedBehavior}</p>
                </div>

                {/* App Installed Status */}
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-medium">
                    App Available
                  </span>
                  <StatusIndicator status={col.appInstalled} />
                </div>

                {/* Description */}
                <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
                  {col.description}
                </p>

                {/* Test Button */}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-[10px] h-7 gap-1.5 border-border/30"
                  onClick={() => handleTest(col.title, col.urlScheme)}
                  disabled={testingColumn === col.title || !hasResult}
                >
                  {testingColumn === col.title ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </motion.div>
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                  {testingColumn === col.title
                    ? 'Opening...'
                    : testedColumns.has(col.title)
                      ? 'Test Again'
                      : 'Test'}
                </Button>
              </motion.div>

              {/* Flow arrow between tiers */}
              {index < columns.length - 1 && (
                <FlowArrow from={columns[index].tier} to={columns[index + 1].tier} />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 pt-1 border-t border-border/10">
        <div className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
          <span className="text-[10px] text-muted-foreground/60">Works</span>
        </div>
        <div className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3 text-amber-400" />
          <span className="text-[10px] text-muted-foreground/60">Partial</span>
        </div>
        <div className="flex items-center gap-1">
          <XCircle className="h-3 w-3 text-red-400" />
          <span className="text-[10px] text-muted-foreground/60">Unlikely</span>
        </div>
      </div>
    </motion.div>
  )
}
