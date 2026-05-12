'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { useLinkStore } from '@/store/link-store'

interface PlatformAction {
  id: string
  name: string
  icon: string
  color: string
  deepLinkScheme: string
  urlTemplate: string
}

const PLATFORM_ACTIONS: PlatformAction[] = [
  { id: 'instagram', name: 'Instagram', icon: '📸', color: '#E4405F', deepLinkScheme: 'instagram://', urlTemplate: 'https://instagram.com/' },
  { id: 'youtube', name: 'YouTube', icon: '▶️', color: '#FF0000', deepLinkScheme: 'vnd.youtube://', urlTemplate: 'https://youtube.com/watch?v=' },
  { id: 'facebook', name: 'Facebook', icon: '👤', color: '#1877F2', deepLinkScheme: 'fb://', urlTemplate: 'https://facebook.com/' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: '#1DA1F2', deepLinkScheme: 'snssdk1233://', urlTemplate: 'https://tiktok.com/@user/video/' },
  { id: 'telegram', name: 'Telegram', icon: '✈️', color: '#26A5E4', deepLinkScheme: 'tg://', urlTemplate: 'https://t.me/' },
  { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: '#25D366', deepLinkScheme: 'whatsapp://', urlTemplate: 'https://wa.me/' },
  { id: 'x', name: 'X (Twitter)', icon: '🐦', color: '#1DA1F2', deepLinkScheme: 'twitter://', urlTemplate: 'https://x.com/' },
  { id: 'snapchat', name: 'Snapchat', icon: '👻', color: '#FFFC00', deepLinkScheme: 'snapchat://', urlTemplate: 'https://snapchat.com/' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: '#0A66C2', deepLinkScheme: 'linkedin://', urlTemplate: 'https://linkedin.com/in/' },
  { id: 'pinterest', name: 'Pinterest', icon: '📌', color: '#E60023', deepLinkScheme: 'pinterest://', urlTemplate: 'https://pinterest.com/pin/' },
  { id: 'reddit', name: 'Reddit', icon: '🤖', color: '#FF4500', deepLinkScheme: 'reddit://', urlTemplate: 'https://reddit.com/r/' },
  { id: 'discord', name: 'Discord', icon: '🎮', color: '#5865F2', deepLinkScheme: 'discord://', urlTemplate: 'https://discord.gg/' },
  { id: 'threads', name: 'Threads', icon: '🧵', color: '#333', deepLinkScheme: 'threads://', urlTemplate: 'https://threads.net/@' },
]

function RippleButton({ children, onClick, className, style, onHoverIn, onHoverOut }: {
  children: React.ReactNode
  onClick: () => void
  className?: string
  style?: React.CSSProperties
  onHoverIn?: () => void
  onHoverOut?: () => void
}) {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now()

    setRipples(prev => [...prev, { id, x, y }])
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id))
    }, 600)

    onClick()
  }, [onClick])

  return (
    <button
      onClick={handleClick}
      onMouseEnter={onHoverIn}
      onMouseLeave={onHoverOut}
      className={className}
      style={style}
    >
      {children}
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            backgroundColor: 'currentColor',
            opacity: 0.3,
          }}
        />
      ))}
    </button>
  )
}

export function PlatformQuickActions() {
  const { setInputUrl } = useLinkStore()
  const [activePlatform, setActivePlatform] = useState<string | null>(null)

  const handlePlatformClick = useCallback((platform: PlatformAction) => {
    setInputUrl(platform.urlTemplate)
    setActivePlatform(platform.id)
    setTimeout(() => setActivePlatform(null), 500)
  }, [setInputUrl])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="glass-card p-3 rounded-xl"
    >
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          Quick Actions
        </span>
        <span className="text-[10px] text-muted-foreground/40">•</span>
        <span className="text-[10px] text-muted-foreground/40">13 platforms</span>
      </div>
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {PLATFORM_ACTIONS.map((platform, idx) => {
          const isActive = activePlatform === platform.id
          return (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.03 * idx }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <RippleButton
                    onClick={() => handlePlatformClick(platform)}
                    onHoverIn={() => setActivePlatform(platform.id)}
                    onHoverOut={() => setActivePlatform(null)}
                    className={`group relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-200 overflow-hidden platform-glow-hover ${
                      isActive ? 'scale-110' : 'hover:scale-110 active:scale-95'
                    }`}
                    style={{
                      backgroundColor: `${platform.color}15`,
                      boxShadow: isActive
                        ? `0 0 16px ${platform.color}35, 0 0 0 1px ${platform.color}40`
                        : `0 0 0 1px ${platform.color}20`,
                    }}
                  >
                    <span className="text-sm relative z-10">{platform.icon}</span>
                    {/* Glow effect on hover/active */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: `radial-gradient(circle, ${platform.color}25, transparent 70%)`,
                          }}
                        />
                      )}
                    </AnimatePresence>
                  </RippleButton>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="glass-card border-border/30 text-xs"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-foreground">{platform.name}</span>
                    <span className="text-muted-foreground font-mono text-[10px]">{platform.deepLinkScheme}</span>
                  </div>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
