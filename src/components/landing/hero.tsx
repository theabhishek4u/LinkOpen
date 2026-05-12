'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Play, ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { detectPlatform } from '@/lib/platform-detect'

const floatingIcons = [
  { emoji: '📸', x: '10%', y: '15%', delay: 0 },
  { emoji: '▶️', x: '85%', y: '10%', delay: 0.5 },
  { emoji: '💬', x: '75%', y: '70%', delay: 1 },
  { emoji: '🐦', x: '15%', y: '75%', delay: 1.5 },
  { emoji: '🎵', x: '90%', y: '45%', delay: 0.8 },
  { emoji: '💼', x: '5%', y: '45%', delay: 1.2 },
  { emoji: '🎮', x: '50%', y: '5%', delay: 0.3 },
  { emoji: '🧵', x: '45%', y: '80%', delay: 1.8 },
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
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

const companies = ['Acme Corp', 'TechFlow', 'SocialBase', 'LinkHive', 'AppDirect']

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

  const detectedPlatform = url ? detectPlatform(url) : null

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

  return (
    <section className="relative min-h-screen overflow-hidden mesh-gradient">
      {/* Floating social media icons */}
      {floatingIcons.map((icon, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl sm:text-4xl opacity-20 pointer-events-none select-none"
          style={{ left: icon.x, top: icon.y }}
          animate={{
            y: [0, -12, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            delay: icon.delay,
            ease: 'easeInOut',
          }}
        >
          {icon.emoji}
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
              className="mb-6 px-4 py-1.5 text-xs sm:text-sm border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
            >
              AI-Powered Deep Linking Platform
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight max-w-4xl"
          >
            Open Any Social Link{' '}
            <span className="gradient-text">In Its Native App</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mt-6 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
          >
            LinkVerse uses AI-powered deep linking to instantly open social media
            links directly in their native apps. No more browser tabs.
          </motion.p>

          {/* Live link input demo */}
          <motion.div
            variants={itemVariants}
            className="mt-10 w-full max-w-xl"
          >
            <div className="glass-card p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Input
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value)
                      setResult(null)
                    }}
                    placeholder="Paste any social media link..."
                    className="h-11 bg-surface-2 border-border/50 text-foreground placeholder:text-muted-foreground/60 pr-20"
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
                  className="h-11 px-6 glow-green bg-emerald-500 hover:bg-emerald-400 text-surface-0 font-semibold"
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

              {/* Result display */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                >
                  <div className="flex items-center gap-2 text-sm">
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
                    <p className="mt-1 text-xs text-muted-foreground font-mono break-all">
                      {result.deepLink}
                    </p>
                  )}
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
              className="h-12 px-8 glow-green bg-emerald-500 hover:bg-emerald-400 text-surface-0 font-semibold text-base"
            >
              Get Started Free
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="h-12 px-8 text-base text-muted-foreground hover:text-foreground"
            >
              <Play className="size-4" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Trusted by */}
          <motion.div variants={itemVariants} className="mt-16 w-full">
            <p className="text-xs sm:text-sm text-muted-foreground/60 mb-4 uppercase tracking-widest">
              Trusted by innovative teams
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
              {companies.map((company) => (
                <div
                  key={company}
                  className="px-4 py-2 rounded-lg bg-surface-2/50 border border-border/20 text-sm text-muted-foreground/50 font-medium"
                >
                  {company}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
