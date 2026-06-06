'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ExternalLink, Loader2, Copy, Check, ChevronDown, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { detectPlatform } from '@/lib/platform-detect'

const floatingIcons = [
  { emoji: '📸', x: '8%', y: '12%', delay: 0, color: '#E4405F' },
  { emoji: '▶️', x: '88%', y: '8%', delay: 0.5, color: '#FF0000' },
  { emoji: '💬', x: '78%', y: '72%', delay: 1, color: '#25D366' },
  { emoji: '🐦', x: '12%', y: '78%', delay: 1.5, color: '#888888' },
  { emoji: '🎵', x: '92%', y: '42%', delay: 0.8, color: '#ff0050' },
  { emoji: '💼', x: '4%', y: '48%', delay: 1.2, color: '#0A66C2' },
  { emoji: '🎮', x: '52%', y: '4%', delay: 0.3, color: '#5865F2' },
  { emoji: '🧵', x: '42%', y: '82%', delay: 1.8, color: '#FF4500' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
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

function useStars(count: number) {
  const [stars, setStars] = useState<Array<{
    id: number; x: string; y: string; duration: string; delay: string; bright: boolean
  }> | null>(null)
  const generatedRef = useRef(false)

  useEffect(() => {
    if (generatedRef.current) return
    generatedRef.current = true
    const generated: Array<{ id: number; x: string; y: string; duration: string; delay: string; bright: boolean }> = []
    for (let i = 0; i < count; i++) {
      generated.push({
        id: i,
        x: `${Math.random() * 100}%`,
        y: `${Math.random() * 100}%`,
        duration: `${2 + Math.random() * 4}s`,
        delay: `${Math.random() * 4}s`,
        bright: Math.random() > 0.85,
      })
    }
    const timer = setTimeout(() => setStars(generated), 0)
    return () => clearTimeout(timer)
  }, [count])

  return stars
}

interface HeroProps {
  onTryNow?: () => void
}

export default function Hero({ onTryNow }: HeroProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    platform?: string; deepLink?: string; success?: boolean
  } | null>(null)
  const [copied, setCopied] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const detectedPlatform = url ? detectPlatform(url) : null
  const { count, ref: counterRef } = useCounter(12847, 2500)
  const stars = useStars(60)

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
      if (data.success) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 1500)
      }
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
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 mesh-gradient animate-breathing" style={{ animationDuration: '8s' }} />

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="animate-hero-orb-1 absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-30 blur-[100px]"
          style={{ background: 'oklch(0.696 0.17 162.48 / 30%)' }}
        />
        <div
          className="animate-hero-orb-2 absolute top-1/3 -right-32 w-[400px] h-[400px] rounded-full opacity-20 blur-[80px]"
          style={{ background: 'oklch(0.488 0.243 264.376 / 25%)' }}
        />
        <div
          className="animate-hero-orb-3 absolute -bottom-32 left-1/3 w-[450px] h-[450px] rounded-full opacity-25 blur-[90px]"
          style={{ background: 'oklch(0.769 0.188 70.08 / 20%)' }}
        />
      </div>

      {/* Stars/particles field */}
      <div className="absolute inset-0 pointer-events-none">
        {stars && stars.map((star) => (
          <div
            key={star.id}
            className={`star ${star.bright ? 'bright' : ''}`}
            style={{
              left: star.x,
              top: star.y,
              '--duration': star.duration,
              '--delay': star.delay,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Dot grid overlay */}
      <div className="absolute inset-0 dot-grid opacity-20" />

      {/* Floating social media icons */}
      {floatingIcons.map((icon, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none select-none hidden sm:block"
          style={{ left: icon.x, top: icon.y }}
          animate={{
            y: [0, -16, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 5 + i * 0.5,
            repeat: Infinity,
            delay: icon.delay,
            ease: 'easeInOut',
          }}
        >
          <div
            className="flex items-center justify-center w-12 h-12 rounded-xl glass-card"
            style={{
              border: `1px solid ${icon.color}30`,
              boxShadow: `0 0 20px ${icon.color}15`,
            }}
          >
            <span className="text-xl">{icon.emoji}</span>
          </div>
        </motion.div>
      ))}

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-6xl px-3 sm:px-6 lg:px-8 pt-24 sm:pt-32 md:pt-40 pb-16 sm:pb-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center"
        >
          {/* Badge row */}
          <motion.div variants={itemVariants} className="flex items-center gap-2 flex-wrap justify-center">
            <Badge
              variant="outline"
              className="px-3 py-1 text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/10 backdrop-blur-sm"
            >
              <span className="mr-1.5 inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AI-Powered Deep Linking
            </Badge>
            <Badge
              variant="outline"
              className="px-2.5 py-1 text-[10px] border-violet-500/25 text-violet-400 bg-violet-500/10 backdrop-blur-sm"
            >
              ⚡ powered by AI
            </Badge>
          </motion.div>

          {/* Live counter */}
          <motion.div variants={itemVariants} className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Live</span>
            </div>
            <span className="text-[10px] text-muted-foreground/50">
              <motion.span
                key={count}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-block text-emerald-400/70 font-medium"
              >
                {count.toLocaleString()}
              </motion.span>
              {' '}links processed
            </span>
          </motion.div>

          {/* Headline - BIGGER, BOLDER */}
          <motion.h1
            variants={itemVariants}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1.05] max-w-5xl mt-6 sm:mt-8"
          >
            Open Any Social Link{' '}
            <span className="gradient-text-smooth">In Its Native App</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed px-2"
          >
            LinkVerse uses AI-powered deep linking to instantly open social media
            links directly in their native apps. No more browser tabs.
          </motion.p>

          {/* Live URL input demo */}
          <motion.div
            variants={itemVariants}
            className="mt-6 sm:mt-10 w-full max-w-xl relative"
          >
            <div
              className="glass-card p-3 sm:p-4 md:p-5 relative"
              style={{
                boxShadow: '0 0 60px oklch(0.696 0.17 162.48 / 6%), 0 8px 40px oklch(0 0 0 / 50%)',
              }}
            >
              {/* Confetti burst on success */}
              {showConfetti && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                  {Array.from({ length: 12 }, (_, i) => (
                    <div
                      key={i}
                      className="animate-confetti"
                      style={{
                        '--confetti-x': `${(Math.random() - 0.5) * 200}px`,
                        '--confetti-y': `${-(30 + Math.random() * 120)}px`,
                        '--confetti-rotate': `${Math.random() * 1080}deg`,
                        background: ['#10b981', '#8b5cf6', '#fbbf24', '#06b6d4', '#f43f5e'][i % 5],
                        left: '50%',
                        top: '50%',
                        animationDelay: `${Math.random() * 0.2}s`,
                        width: `${4 + Math.random() * 4}px`,
                        height: `${4 + Math.random() * 4}px`,
                        borderRadius: Math.random() > 0.5 ? '50%' : '1px',
                      } as React.CSSProperties}
                    />
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                <div className="relative flex-1">
                  <Input
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value)
                      setResult(null)
                    }}
                    placeholder="Paste any social media link..."
                    className="h-11 sm:h-12 w-full bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground/60 pr-20 text-sm focus:border-emerald-500/40 focus:ring-emerald-500/20"
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  />
                  {detectedPlatform && (
                    <Badge
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
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
                  className="h-11 sm:h-12 px-6 w-full sm:w-auto glow-green bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-all duration-300 relative z-10 min-h-[44px]"
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

              {/* Sample links */}
              {!result && !loading && (
                <div className="mt-3 flex items-center gap-2 flex-wrap relative z-10">
                  <span className="text-xs text-muted-foreground/40">Try:</span>
                  {sampleLinks.map((sample) => (
                    <button
                      key={sample.url}
                      onClick={() => { setUrl(sample.url); setResult(null) }}
                      className="px-3 py-1 rounded-full bg-background/30 border border-border/20 hover:border-emerald-500/30 hover:bg-emerald-500/8 hover:text-emerald-400/80 transition-all duration-200 text-xs text-muted-foreground/50 font-medium"
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Result display */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const }}
                  className="mt-4 p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/15 relative z-10"
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
                    <div className="flex items-center gap-2 mt-2 p-2.5 rounded-lg bg-background/30 border border-border/30">
                      <code className="text-sm text-emerald-400 font-mono break-all flex-1">
                        {result.deepLink}
                      </code>
                      <button
                        onClick={() => handleCopy(result.deepLink!)}
                        className="flex-shrink-0 p-1.5 rounded-md hover:bg-accent/50 transition-colors"
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
            className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4"
          >
            <Button
              onClick={onTryNow}
              size="lg"
              className="h-12 sm:h-13 px-6 sm:px-8 glow-green bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm sm:text-base btn-glow min-h-[44px]"
            >
              <Sparkles className="size-4" />
              Get Started Free
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="h-12 sm:h-13 px-6 sm:px-8 text-sm sm:text-base text-muted-foreground hover:text-foreground border border-border/20 hover:border-border/40 min-h-[44px]"
            >
              See How It Works
              <ArrowRight className="size-4" />
            </Button>
          </motion.div>

          {/* Counter */}
          <motion.div
            variants={itemVariants}
            ref={counterRef}
            className="mt-6 sm:mt-8 flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-bold counter-glow text-emerald-400">
              {count.toLocaleString()}
            </span>
            <span className="text-xs sm:text-sm text-muted-foreground/60">links opened today</span>
          </motion.div>

          {/* Trusted by */}
          <motion.div variants={itemVariants} className="mt-8 sm:mt-14 w-full">
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
                  className="px-5 py-2.5 rounded-xl glass-card text-sm text-muted-foreground/40 font-semibold tracking-wide hover:text-muted-foreground/60 transition-colors duration-300"
                >
                  {company}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Wave at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-[5] pointer-events-none">
        <svg viewBox="0 0 1280 320" preserveAspectRatio="none" className="w-full h-16 sm:h-24">
          <path
            d="M0,160 C320,300,420,60,640,160 C860,260,960,60,1280,160 L1280,320 L0,320 Z"
            fill="oklch(0.696 0.17 162.48 / 4%)"
          />
          <path
            d="M0,180 C320,80,520,280,640,180 C760,80,960,280,1280,180 L1280,320 L0,320 Z"
            fill="oklch(0.488 0.243 264.376 / 3%)"
          />
          <path
            d="M0,220 C200,280,400,160,640,220 C880,280,1080,160,1280,220 L1280,320 L0,320 Z"
            fill="var(--background)"
          />
        </svg>
      </div>

      {/* Scroll down indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <span className="text-xs text-muted-foreground/40 uppercase tracking-[0.15em]">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="size-5 text-muted-foreground/30" />
        </motion.div>
      </div>
    </section>
  )
}
