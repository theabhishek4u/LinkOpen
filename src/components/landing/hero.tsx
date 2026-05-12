'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Play, ExternalLink, Loader2, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { detectPlatform } from '@/lib/platform-detect'

const floatingIcons = [
  { emoji: '📸', x: '10%', y: '15%', delay: 0, color: '#E4405F' },
  { emoji: '▶️', x: '85%', y: '10%', delay: 0.5, color: '#FF0000' },
  { emoji: '💬', x: '75%', y: '70%', delay: 1, color: '#25D366' },
  { emoji: '🐦', x: '15%', y: '75%', delay: 1.5, color: '#888888' },
  { emoji: '🎵', x: '90%', y: '45%', delay: 0.8, color: '#ff0050' },
  { emoji: '💼', x: '5%', y: '45%', delay: 1.2, color: '#0A66C2' },
  { emoji: '🎮', x: '50%', y: '5%', delay: 0.3, color: '#5865F2' },
  { emoji: '🧵', x: '45%', y: '80%', delay: 1.8, color: '#000000' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

const companies = ['Acme Corp', 'TechFlow', 'SocialBase', 'LinkHive', 'AppDirect']

const sampleLinks = [
  { label: 'instagram.com/p/abc123', url: 'https://instagram.com/p/abc123' },
  { label: 'youtube.com/watch?v=...', url: 'https://youtube.com/watch?v=dQw4w9WgXcQ' },
  { label: 'x.com/user/status/...', url: 'https://x.com/user/status/789' },
]

function useCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const startTime = Date.now()
          const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * end))
            if (progress < 1) {
              requestAnimationFrame(animate)
            }
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration])

  return { count, ref }
}

interface HeroProps {
  onTryNow?: () => void
}

export default function Hero({ onTryNow }: HeroProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    platform?: string
    deepLink?: string
    success?: boolean
  } | null>(null)
  const [copied, setCopied] = useState(false)

  const detectedPlatform = url ? detectPlatform(url) : null
  const { count, ref: counterRef } = useCounter(12847, 2500)

  const handleSubmit = useCallback(async () => {
    if (!url.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ success: false })
    } finally {
      setLoading(false)
    }
  }, [url])

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Animated mesh gradient background with breathing effect */}
      <div className="absolute inset-0 mesh-gradient animate-breathing" style={{ animationDuration: '8s' }} />

      {/* Dot grid overlay */}
      <div className="absolute inset-0 dot-grid opacity-40" />

      {/* Spotlight radial gradient behind headline */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, oklch(0.696 0.17 162.48 / 8%) 0%, oklch(0.488 0.243 264.376 / 4%) 30%, transparent 70%)',
        }}
      />

      {/* Floating social media icons with glass-card styling */}
      {floatingIcons.map((icon, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none select-none hidden sm:block"
          style={{ left: icon.x, top: icon.y }}
          animate={{
            y: [0, -14, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            delay: icon.delay,
            ease: 'easeInOut',
          }}
        >
          {/* Pulsing ring behind icon */}
          <div
            className="absolute inset-0 rounded-xl"
            style={{
              boxShadow: `0 0 20px ${icon.color}25, 0 0 40px ${icon.color}10`,
              animation: `pulse-ring-anim ${2.5 + i * 0.3}s ease-in-out infinite ${icon.delay}s`,
            }}
          />
          {/* Glass card wrapper — larger icons */}
          <div
            className="relative flex items-center justify-center w-14 h-14 rounded-xl glass-card platform-icon-hover"
            style={{
              boxShadow: `0 0 15px ${icon.color}20, inset 0 0 15px ${icon.color}05`,
              border: `1px solid ${icon.color}25`,
            }}
          >
            <span className="text-2xl">{icon.emoji}</span>
          </div>
        </motion.div>
      ))}

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 pb-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <Badge
              variant="outline"
              className="mb-6 px-4 py-1.5 text-xs sm:text-sm border-emerald-500/30 text-emerald-400 bg-emerald-500/10 backdrop-blur-sm"
            >
              <span className="mr-1.5 inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AI-Powered Deep Linking Platform
            </Badge>
          </motion.div>

          {/* Headline with spotlight */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight max-w-4xl relative"
          >
            Open Any Social Link{' '}
            <span className="gradient-text-animated">In Its Native App</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mt-6 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
          >
            LinkVerse uses AI-powered deep linking to instantly open social media
            links directly in their native apps. No more browser tabs.
          </motion.p>

          {/* Live link input demo — with orbit ring */}
          <motion.div
            variants={itemVariants}
            className="mt-10 w-full max-w-xl relative"
          >
            {/* Orbit ring around the card */}
            <div className="absolute -inset-8 pointer-events-none opacity-20">
              <div className="absolute inset-0 rounded-3xl orbit-ring">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400/60" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-violet-400/60" />
              </div>
              <div className="absolute inset-2 rounded-3xl orbit-ring-reverse">
                <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-amber-400/60" />
                <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400/60" />
              </div>
            </div>

            <div className="glass-card input-glow p-4 sm:p-6 relative" style={{ boxShadow: '0 0 80px oklch(0.696 0.17 162.48 / 6%), 0 8px 40px oklch(0 0 0 / 60%)' }}>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Input
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value)
                      setResult(null)
                    }}
                    placeholder="Paste any social media link..."
                    className="h-11 bg-surface-2 border-border/50 text-foreground placeholder:text-muted-foreground/60 pr-20 focus:border-emerald-500/40 focus:ring-emerald-500/20"
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  />
                  {detectedPlatform && (
                    <Badge
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
                      style={{
                        backgroundColor: `${detectedPlatform.color}20`,
                        color: detectedPlatform.color,
                        borderColor: `${detectedPlatform.color}40`,
                      }}
                    >
                      {detectedPlatform.icon} {detectedPlatform.name}
                    </Badge>
                  )}
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !url.trim()}
                  className="h-11 px-6 glow-green bg-emerald-500 hover:bg-emerald-400 text-surface-0 font-semibold transition-all duration-300"
                >
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      <ExternalLink className="size-4" />
                      Open in App
                    </>
                  )}
                </Button>
              </div>

              {/* Empty state hint — pill-style sample buttons */}
              {!result && !loading && (
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground/40">Try:</span>
                  {sampleLinks.map((sample) => (
                    <button
                      key={sample.url}
                      onClick={() => { setUrl(sample.url); setResult(null) }}
                      className="px-3 py-1 rounded-full bg-surface-2/60 border border-border/20 hover:border-emerald-500/30 hover:bg-emerald-500/8 hover:text-emerald-400/80 transition-all duration-200 text-xs text-muted-foreground/50 font-medium"
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Result display - enhanced */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="mt-4 p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/15"
                >
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Check className="size-3 text-emerald-400" />
                    </div>
                    <span className="text-emerald-400 font-medium">
                      {result.success ? 'Deep link generated!' : 'Detection complete'}
                    </span>
                    {result.platform && (
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor: `${result.platform}40`,
                          color: result.platform,
                        }}
                      >
                        {result.platform}
                      </Badge>
                    )}
                  </div>
                  {result.deepLink && (
                    <div className="flex items-center gap-2 mt-2 p-2.5 rounded-lg bg-surface-2/70 border border-border/30">
                      <code className="text-sm text-emerald-400 font-mono break-all flex-1">
                        {result.deepLink}
                      </code>
                      <button
                        onClick={() => handleCopy(result.deepLink!)}
                        className="flex-shrink-0 p-1.5 rounded-md hover:bg-surface-3 transition-colors"
                        aria-label="Copy deep link"
                      >
                        {copied ? (
                          <Check className="size-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="size-3.5 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  )}
                  <button
                    onClick={onTryNow}
                    className="mt-3 text-xs text-emerald-400/70 hover:text-emerald-400 transition-colors flex items-center gap-1"
                  >
                    Try it yourself in the dashboard
                    <ArrowRight className="size-3" />
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-col sm:flex-row gap-4"
          >
            <Button
              onClick={onTryNow}
              size="lg"
              className="h-12 px-8 glow-green bg-emerald-500 hover:bg-emerald-400 text-surface-0 font-semibold text-base btn-glow"
            >
              Get Started Free
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="h-12 px-8 text-base text-muted-foreground hover:text-foreground border border-border/20 hover:border-border/40"
            >
              <Play className="size-4" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Counter animation — with green glow */}
          <motion.div
            variants={itemVariants}
            ref={counterRef}
            className="mt-8 flex items-center gap-2"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span
                className="text-sm font-bold counter-glow text-emerald-400"
                style={{
                  textShadow: '0 0 20px oklch(0.696 0.17 162.48 / 60%), 0 0 40px oklch(0.696 0.17 162.48 / 25%)',
                }}
              >
                {count.toLocaleString()}
              </span>
            </div>
            <span className="text-sm text-muted-foreground/60">links opened today</span>
          </motion.div>

          {/* Trusted by — with horizontal line */}
          <motion.div variants={itemVariants} className="mt-14 w-full">
            {/* Subtle line above trusted-by */}
            <div className="w-48 mx-auto mb-6 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
            <p className="text-xs sm:text-sm text-muted-foreground/40 mb-5 uppercase tracking-[0.2em]">
              Trusted by innovative teams
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
              {companies.map((company, i) => (
                <motion.div
                  key={company}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 + i * 0.15, duration: 0.6 }}
                  className="px-5 py-2.5 rounded-xl glass-card text-sm text-muted-foreground/40 font-semibold tracking-wide hover:text-muted-foreground/60 transition-colors duration-300 card-shimmer"
                  style={{ borderColor: 'oklch(0.93 0.01 270 / 4%)' }}
                >
                  {company}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
