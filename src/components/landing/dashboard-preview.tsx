'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, ExternalLink, QrCode, BarChart3, Clock, TrendingUp, Link2, ArrowUpRight } from 'lucide-react'

const recentLinks = [
  { platform: '📸', name: 'Instagram', url: 'instagram.com/p/Cx7kLm2...', time: '2m ago', status: 'native' },
  { platform: '▶️', name: 'YouTube', url: 'youtube.com/watch?v=dQw4...', time: '5m ago', status: 'native' },
  { platform: '🐦', name: 'X (Twitter)', url: 'x.com/elonmusk/status/169...', time: '12m ago', status: 'native' },
  { platform: '💬', name: 'WhatsApp', url: 'wa.me/1234567890', time: '1h ago', status: 'browser' },
  { platform: '🎵', name: 'TikTok', url: 'tiktok.com/@user/video/7234...', time: '2h ago', status: 'native' },
]

const statCards = [
  { label: 'Total Links', value: '2,847', icon: Link2, color: 'text-emerald-400', change: '+12.3%', up: true },
  { label: 'Native Opens', value: '94.2%', icon: ExternalLink, color: 'text-violet-400', change: '+3.1%', up: true },
  { label: 'QR Generated', value: '847', icon: QrCode, color: 'text-amber-400', change: '+18.7%', up: true },
]

// Typing animation hook
function useTypingAnimation(text: string, speed: number = 50, startDelay: number = 1000) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const startTyping = useCallback(() => {
    setIsTyping(true)
    setDisplayedText('')
    let i = 0
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1))
        i++
      } else {
        clearInterval(interval)
        setIsTyping(false)
      }
    }, speed)
    return interval
  }, [text, speed])

  useEffect(() => {
    const timeout = setTimeout(() => {
      const interval = startTyping()
      return () => clearInterval(interval)
    }, startDelay)
    return () => clearTimeout(timeout)
  }, [startTyping, startDelay])

  return { displayedText, isTyping }
}

export default function DashboardPreview() {
  const { displayedText, isTyping } = useTypingAnimation(
    'https://instagram.com/p/Cx7kLm2...',
    60,
    1500
  )

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
            <span className="gradient-text-smooth">Powerful Dashboard</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage all your links, track analytics, and generate deep links from one place
          </p>
        </motion.div>

        {/* Blurred gradient behind preview for depth */}
        <div className="relative max-w-4xl mx-auto">
          {/* Background glow */}
          <div
            className="absolute -inset-8 -z-10 rounded-3xl opacity-40 blur-2xl"
            style={{
              background: 'radial-gradient(ellipse at 30% 50%, oklch(0.696 0.17 162.48 / 10%) 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, oklch(0.488 0.243 264.376 / 8%) 0%, transparent 50%)',
            }}
          />

          {/* Browser window mock frame */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7 }}
            className="browser-frame"
          >
            {/* Title bar with window controls */}
            <div className="browser-titlebar">
              {/* Window control dots */}
              <div className="browser-dot" style={{ background: '#ff5f57' }} />
              <div className="browser-dot" style={{ background: '#febc2e' }} />
              <div className="browser-dot" style={{ background: '#28c840' }} />

              {/* Address bar */}
              <div className="browser-addressbar flex items-center gap-2">
                <span className="text-emerald-400/50">🔒</span>
                <span>linkverse.app/dashboard</span>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 ml-2">
                <div className="px-3 py-1 rounded-md bg-surface-2/50 text-[10px] text-emerald-400 border border-emerald-500/20">
                  Links
                </div>
                <div className="px-3 py-1 rounded-md text-[10px] text-muted-foreground/40">
                  Analytics
                </div>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="glass-card p-5 sm:p-8 relative animate-breathing" style={{ animationDuration: '6s', borderRadius: 0 }}>
              {/* Live Preview badge */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-dot" />
                <span className="text-[10px] font-semibold text-emerald-400/80 uppercase tracking-wider">Live Preview</span>
              </div>

              {/* Subtle shimmer overlay */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, oklch(0.93 0.01 270 / 2%) 50%, transparent 100%)',
                    animation: 'shimmer 4s ease-in-out infinite',
                  }}
                />
              </div>

              {/* Smart input bar with typing animation */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-2 border border-border/30 mb-6 dramatic-input-glow">
                <Search className="size-4 text-muted-foreground/50" />
                <span className="text-sm text-foreground/70 flex-1">
                  {displayedText || 'Paste any social media link...'}
                  {isTyping && <span className="typing-cursor" />}
                </span>
                <div className="px-3 py-1.5 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-1.5">
                  <ExternalLink className="size-3" />
                  Open in App
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
                {statCards.map((stat) => {
                  const Icon = stat.icon
                  return (
                    <div
                      key={stat.label}
                      className="p-3 sm:p-4 rounded-lg bg-surface-2/50 border border-border/20 hover:border-border/40 transition-colors duration-300"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`size-4 ${stat.color}`} />
                        <span className="text-xs text-muted-foreground">{stat.label}</span>
                      </div>
                      <div className="flex items-end gap-2">
                        <span className="text-lg sm:text-2xl font-bold text-foreground">
                          {stat.value}
                        </span>
                        <span className={`text-[10px] font-medium ${stat.up ? 'text-emerald-400' : 'text-red-400'} flex items-center gap-0.5 mb-1`}>
                          <ArrowUpRight className="size-2.5" />
                          {stat.change}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Recent links with subtle animation */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Clock className="size-4 text-muted-foreground" />
                    Recent Links
                  </h4>
                  <span className="text-xs text-muted-foreground hover:text-emerald-400 cursor-pointer transition-colors">View all →</span>
                </div>
                <div className="flex flex-col gap-2">
                  {recentLinks.map((link, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-surface-2/30 border border-border/10 hover:border-border/30 hover:bg-surface-2/50 transition-all duration-200 group"
                    >
                      <span className="text-lg">{link.platform}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-foreground">{link.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                            link.status === 'native'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {link.status === 'native' ? 'Native' : 'Browser'}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">{link.url}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground/50 flex-shrink-0">
                        {link.time}
                      </span>
                      <ExternalLink className="size-3 text-muted-foreground/30 group-hover:text-emerald-400/60 flex-shrink-0 transition-colors" />
                    </motion.div>
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
