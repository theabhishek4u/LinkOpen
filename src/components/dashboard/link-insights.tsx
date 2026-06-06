'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Smartphone,
  Globe,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  Link2,
  Check,
  ExternalLink,
  Copy,
  Tag,
} from 'lucide-react'
import { useLinkStore } from '@/store/link-store'

// ─── Platform Compatibility Data ─────────────────────────────────

interface PlatformSupport {
  name: string
  icon: string
  supported: boolean
  scheme: string
}

const PLATFORM_COMPAT: Record<string, PlatformSupport[]> = {
  instagram: [
    { name: 'Instagram iOS', icon: '🍎', supported: true, scheme: 'instagram://' },
    { name: 'Instagram Android', icon: '🤖', supported: true, scheme: 'instagram://' },
    { name: 'Instagram Web', icon: '🌐', supported: true, scheme: 'https://instagram.com' },
  ],
  youtube: [
    { name: 'YouTube iOS', icon: '🍎', supported: true, scheme: 'youtube://' },
    { name: 'YouTube Android', icon: '🤖', supported: true, scheme: 'youtube://' },
    { name: 'YouTube Web', icon: '🌐', supported: true, scheme: 'https://youtube.com' },
  ],
  facebook: [
    { name: 'Facebook iOS', icon: '🍎', supported: true, scheme: 'fb://' },
    { name: 'Facebook Android', icon: '🤖', supported: true, scheme: 'fb://' },
    { name: 'Facebook Web', icon: '🌐', supported: true, scheme: 'https://facebook.com' },
  ],
  tiktok: [
    { name: 'TikTok iOS', icon: '🍎', supported: true, scheme: 'tiktok://' },
    { name: 'TikTok Android', icon: '🤖', supported: true, scheme: 'tiktok://' },
    { name: 'TikTok Web', icon: '🌐', supported: true, scheme: 'https://tiktok.com' },
  ],
  telegram: [
    { name: 'Telegram iOS', icon: '🍎', supported: true, scheme: 'tg://' },
    { name: 'Telegram Android', icon: '🤖', supported: true, scheme: 'tg://' },
    { name: 'Telegram Web', icon: '🌐', supported: true, scheme: 'https://web.telegram.org' },
  ],
  whatsapp: [
    { name: 'WhatsApp iOS', icon: '🍎', supported: true, scheme: 'whatsapp://' },
    { name: 'WhatsApp Android', icon: '🤖', supported: true, scheme: 'whatsapp://' },
    { name: 'WhatsApp Web', icon: '🌐', supported: true, scheme: 'https://web.whatsapp.com' },
  ],
  x: [
    { name: 'X iOS', icon: '🍎', supported: true, scheme: 'twitter://' },
    { name: 'X Android', icon: '🤖', supported: true, scheme: 'twitter://' },
    { name: 'X Web', icon: '🌐', supported: true, scheme: 'https://x.com' },
  ],
  linkedin: [
    { name: 'LinkedIn iOS', icon: '🍎', supported: true, scheme: 'linkedin://' },
    { name: 'LinkedIn Android', icon: '🤖', supported: true, scheme: 'linkedin://' },
    { name: 'LinkedIn Web', icon: '🌐', supported: true, scheme: 'https://linkedin.com' },
  ],
  reddit: [
    { name: 'Reddit iOS', icon: '🍎', supported: true, scheme: 'reddit://' },
    { name: 'Reddit Android', icon: '🤖', supported: true, scheme: 'reddit://' },
    { name: 'Reddit Web', icon: '🌐', supported: true, scheme: 'https://reddit.com' },
  ],
  discord: [
    { name: 'Discord iOS', icon: '🍎', supported: true, scheme: 'discord://' },
    { name: 'Discord Android', icon: '🤖', supported: true, scheme: 'discord://' },
    { name: 'Discord Web', icon: '🌐', supported: true, scheme: 'https://discord.com' },
  ],
  snapchat: [
    { name: 'Snapchat iOS', icon: '🍎', supported: true, scheme: 'snapchat://' },
    { name: 'Snapchat Android', icon: '🤖', supported: true, scheme: 'snapchat://' },
    { name: 'Snapchat Web', icon: '🌐', supported: false, scheme: '' },
  ],
  pinterest: [
    { name: 'Pinterest iOS', icon: '🍎', supported: true, scheme: 'pinterest://' },
    { name: 'Pinterest Android', icon: '🤖', supported: true, scheme: 'pinterest://' },
    { name: 'Pinterest Web', icon: '🌐', supported: true, scheme: 'https://pinterest.com' },
  ],
  threads: [
    { name: 'Threads iOS', icon: '🍎', supported: true, scheme: 'threads://' },
    { name: 'Threads Android', icon: '🤖', supported: true, scheme: 'threads://' },
    { name: 'Threads Web', icon: '🌐', supported: true, scheme: 'https://threads.net' },
  ],
}

// ─── Quality Check Helpers ───────────────────────────────────────

interface QualityCheck {
  label: string
  passed: boolean
  detail: string
}

function evaluateDeepLink(deepLink: string, originalUrl: string): {
  score: number
  checks: QualityCheck[]
  suggestions: string[]
} {
  const checks: QualityCheck[] = []
  const suggestions: string[] = []
  let score = 0

  // Check 1: Has custom scheme
  const hasCustomScheme = /^[a-z]+:\/\//.test(deepLink) && !deepLink.startsWith('http')
  checks.push({
    label: 'Custom URL Scheme',
    passed: hasCustomScheme,
    detail: hasCustomScheme ? 'Uses native app scheme' : 'Using HTTP fallback',
  })
  if (hasCustomScheme) score += 25
  else suggestions.push('Consider using a native URL scheme for better app integration')

  // Check 2: Has fallback URL
  const hasFallback = originalUrl.startsWith('http')
  checks.push({
    label: 'Web Fallback Available',
    passed: hasFallback,
    detail: hasFallback ? 'Browser fallback configured' : 'No browser fallback detected',
  })
  if (hasFallback) score += 20
  else suggestions.push('Add a web fallback URL for users without the native app')

  // Check 3: URL structure quality
  const hasPath = new URL(originalUrl).pathname !== '/'
  checks.push({
    label: 'Deep Link Path',
    passed: hasPath,
    detail: hasPath ? 'Links to specific content' : 'Links to app root only',
  })
  if (hasPath) score += 20
  else suggestions.push('Link points to app root — consider linking to specific content')

  // Check 4: UTM parameters
  const hasUtm = /[?&]utm_/.test(originalUrl)
  checks.push({
    label: 'UTM Parameters',
    passed: hasUtm,
    detail: hasUtm ? 'Tracking parameters present' : 'No UTM parameters found',
  })
  if (hasUtm) score += 15
  else suggestions.push('Consider adding UTM parameters for better tracking')

  // Check 5: HTTPS
  const isHttps = originalUrl.startsWith('https')
  checks.push({
    label: 'HTTPS Security',
    passed: isHttps,
    detail: isHttps ? 'Secure connection ensured' : 'Using insecure HTTP',
  })
  if (isHttps) score += 20
  else suggestions.push('Use HTTPS for secure connections')

  // Additional suggestions
  if (hasCustomScheme && hasFallback) {
    suggestions.push('Short link is ready for sharing')
  }
  if (score >= 80) {
    suggestions.push('Excellent deep link quality — follows best practices')
  }

  return { score, checks, suggestions }
}

// ─── Animated Progress Ring ──────────────────────────────────────

function ProgressRing({
  value,
  max = 100,
  size = 64,
  strokeWidth = 5,
  color = '#10b981',
  label,
}: {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(value / max, 1)
  const offset = circumference * (1 - progress)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.08"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-sm font-bold"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {value}
        </motion.span>
        {label && (
          <span className="text-[7px] text-muted-foreground font-medium">{label}</span>
        )}
      </div>
    </div>
  )
}

// ─── Animated Progress Bar ───────────────────────────────────────

function ProgressBar({
  value,
  max = 100,
  height = 4,
  color = '#10b981',
  animate = true,
}: {
  value: number
  max?: number
  height?: number
  color?: string
  animate?: boolean
}) {
  const progress = Math.min(value / max, 1) * 100

  return (
    <div
      className="w-full rounded-full overflow-hidden"
      style={{ height, backgroundColor: 'currentColor', opacity: 0.08 }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={animate ? { width: 0 } : undefined}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
      />
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────

export function LinkInsights() {
  const { history, deepLinkResult } = useLinkStore()

  // Get the most recently generated link
  const latestLink = useMemo(() => {
    if (deepLinkResult) {
      return {
        originalUrl: deepLinkResult.originalUrl,
        deepLink: deepLinkResult.deepLink,
        shortCode: deepLinkResult.shortCode,
      }
    }
    if (history.length > 0) {
      const item = history[0]
      return {
        originalUrl: item.originalUrl,
        deepLink: item.deepLink,
        shortCode: item.shortCode,
        platformId: item.platform.id,
      }
    }
    return null
  }, [history, deepLinkResult])

  // Detect platform from latest link
  const detectedPlatform = useMemo(() => {
    if (!latestLink) return null
    const url = latestLink.originalUrl.toLowerCase()
    const platformMap: Record<string, string> = {
      'instagram.com': 'instagram',
      'youtube.com': 'youtube',
      'youtu.be': 'youtube',
      'facebook.com': 'facebook',
      'fb.com': 'facebook',
      'tiktok.com': 'tiktok',
      't.me': 'telegram',
      'telegram.me': 'telegram',
      'wa.me': 'whatsapp',
      'whatsapp.com': 'whatsapp',
      'twitter.com': 'x',
      'x.com': 'x',
      'linkedin.com': 'linkedin',
      'reddit.com': 'reddit',
      'discord.com': 'discord',
      'discord.gg': 'discord',
      'snapchat.com': 'snapchat',
      'pinterest.com': 'pinterest',
      'threads.net': 'threads',
    }
    for (const [domain, platform] of Object.entries(platformMap)) {
      if (url.includes(domain)) return platform
    }
    // Also check if history item has platform
    if ('platformId' in latestLink && latestLink.platformId) {
      return latestLink.platformId
    }
    return 'generic'
  }, [latestLink])

  // Get platform compatibility
  const platformSupport = useMemo(() => {
    if (!detectedPlatform || detectedPlatform === 'generic') {
      return [
        { name: 'iOS App', icon: '🍎', supported: true, scheme: 'Custom scheme' },
        { name: 'Android App', icon: '🤖', supported: true, scheme: 'Custom scheme' },
        { name: 'Web Browser', icon: '🌐', supported: true, scheme: 'HTTPS' },
      ] as PlatformSupport[]
    }
    return PLATFORM_COMPAT[detectedPlatform] || PLATFORM_COMPAT['instagram']
  }, [detectedPlatform])

  // Compute compatibility score
  const compatibilityScore = useMemo(() => {
    const supported = platformSupport.filter(p => p.supported).length
    return Math.round((supported / platformSupport.length) * 100)
  }, [platformSupport])

  // Quality evaluation
  const qualityResult = useMemo(() => {
    if (!latestLink) return { score: 0, checks: [], suggestions: [] }
    return evaluateDeepLink(latestLink.deepLink, latestLink.originalUrl)
  }, [latestLink])

  // Health status based on quality score
  const healthStatus = useMemo(() => {
    if (qualityResult.score >= 80) return { label: 'Excellent', color: '#10b981', icon: ShieldCheck }
    if (qualityResult.score >= 60) return { label: 'Good', color: '#f59e0b', icon: ShieldCheck }
    if (qualityResult.score >= 40) return { label: 'Fair', color: '#f97316', icon: AlertTriangle }
    return { label: 'Needs Work', color: '#ef4444', icon: AlertTriangle }
  }, [qualityResult.score])

  if (!latestLink) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="glass-card rounded-xl p-4 sm:p-6 space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Link Insights</h3>
          </div>
          {detectedPlatform && detectedPlatform !== 'generic' && (
            <span className="text-[10px] font-medium text-primary/70 capitalize bg-primary/10 px-2 py-0.5 rounded-full">
              {detectedPlatform}
            </span>
          )}
        </div>

        {/* Quick URL preview */}
        <div className="rounded-lg bg-muted/20 p-2.5 border border-border/20">
          <div className="flex items-center gap-2">
            <Link2 className="h-3 w-3 text-primary shrink-0" />
            <p className="text-[11px] font-mono text-foreground/70 truncate">
              {latestLink.originalUrl}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <ExternalLink className="h-3 w-3 text-emerald-400 shrink-0" />
            <p className="text-[11px] font-mono text-emerald-400 truncate">
              {latestLink.deepLink}
            </p>
          </div>
        </div>

        {/* Three-column insights grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Section 1: Platform Compatibility */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-lg bg-background/30 p-3 border border-border/20 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Compatibility
              </span>
              <ProgressRing
                value={compatibilityScore}
                size={40}
                strokeWidth={3}
                color={compatibilityScore >= 80 ? '#10b981' : '#f59e0b'}
                label="score"
              />
            </div>
            <div className="space-y-2">
              {platformSupport.map((platform, i) => (
                <motion.div
                  key={platform.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-xs">{platform.icon}</span>
                  <span className="text-[11px] text-foreground/70 flex-1 truncate">
                    {platform.name}
                  </span>
                  {platform.supported ? (
                    <div className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-[9px] text-emerald-400 font-medium">Supported</span>
                    </div>
                  ) : (
                    <span className="text-[9px] text-muted-foreground font-medium">N/A</span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Section 2: Link Health */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-lg bg-background/30 p-3 border border-border/20 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Health
              </span>
              <div className="flex items-center gap-1.5">
                <healthStatus.icon className="h-3.5 w-3.5" style={{ color: healthStatus.color }} />
                <span className="text-[10px] font-semibold" style={{ color: healthStatus.color }}>
                  {healthStatus.label}
                </span>
              </div>
            </div>
            <ProgressRing
              value={qualityResult.score}
              size={56}
              strokeWidth={4}
              color={healthStatus.color}
              label="/ 100"
            />
            <div className="space-y-2">
              {qualityResult.checks.map((check, i) => (
                <motion.div
                  key={check.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="space-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">{check.label}</span>
                    {check.passed ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 text-amber-400" />
                    )}
                  </div>
                  <ProgressBar
                    value={check.passed ? 100 : 30}
                    height={3}
                    color={check.passed ? '#10b981' : '#f59e0b'}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Section 3: Quality & Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-lg bg-background/30 p-3 border border-border/20 space-y-3"
          >
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Suggestions
            </span>
            <div className="space-y-2">
              {qualityResult.suggestions.length > 0 ? (
                qualityResult.suggestions.map((suggestion, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-start gap-2 p-2 rounded-md bg-muted/20"
                  >
                    {suggestion.includes('Consider adding UTM') ? (
                      <Tag className="h-3 w-3 text-violet-400 shrink-0 mt-0.5" />
                    ) : suggestion.includes('ready for sharing') ? (
                      <Copy className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />
                    ) : suggestion.includes('Excellent') ? (
                      <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />
                    ) : suggestion.includes('native') ? (
                      <Smartphone className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                    ) : suggestion.includes('fallback') ? (
                      <Globe className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <Lightbulb className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                    )}
                    <span className="text-[11px] text-foreground/70 leading-tight">
                      {suggestion}
                    </span>
                  </motion.div>
                ))
              ) : (
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/20">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  <span className="text-[11px] text-foreground/70">Link follows all best practices</span>
                </div>
              )}
            </div>

            {/* Quick actions */}
            {latestLink.shortCode && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="pt-2 border-t border-border/20"
              >
                <p className="text-[9px] text-muted-foreground mb-1.5">Quick Actions</p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(latestLink.deepLink).catch(() => {})
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-[10px] hover:bg-primary/20 transition-colors"
                  >
                    <Copy className="h-2.5 w-2.5" />
                    Copy
                  </button>
                  <button
                    onClick={() => {
                      const win = window.open(latestLink.deepLink, '_blank')
                      if (!win) {
                        window.open(latestLink.originalUrl, '_blank')
                      }
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/30 text-muted-foreground text-[10px] hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <ExternalLink className="h-2.5 w-2.5" />
                    Open
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
