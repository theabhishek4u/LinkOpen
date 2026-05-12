'use client'

import { motion } from 'framer-motion'
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

export function PlatformQuickActions() {
  const { setInputUrl } = useLinkStore()

  const handlePlatformClick = (platform: PlatformAction) => {
    setInputUrl(platform.urlTemplate)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="glass-card p-3 rounded-xl"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          Quick Actions
        </span>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {PLATFORM_ACTIONS.map((platform, idx) => (
          <motion.div
            key={platform.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.05 * idx }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handlePlatformClick(platform)}
                  className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 hover:shadow-lg active:scale-95"
                  style={{
                    backgroundColor: `${platform.color}15`,
                    boxShadow: `0 0 0 1px ${platform.color}20`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${platform.color}30`
                    e.currentTarget.style.boxShadow = `0 0 12px ${platform.color}30, 0 0 0 1px ${platform.color}40`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = `${platform.color}15`
                    e.currentTarget.style.boxShadow = `0 0 0 1px ${platform.color}20`
                  }}
                >
                  <span className="text-sm">{platform.icon}</span>
                </button>
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
        ))}
      </div>
    </motion.div>
  )
}
