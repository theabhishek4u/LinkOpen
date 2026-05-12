'use client'

import { motion } from 'framer-motion'
import { Search, ExternalLink, QrCode, BarChart3, Clock } from 'lucide-react'

const recentLinks = [
  { platform: '📸', name: 'Instagram', url: 'instagram.com/p/abc123', time: '2m ago' },
  { platform: '▶️', name: 'YouTube', url: 'youtube.com/watch?v=xyz', time: '5m ago' },
  { platform: '🐦', name: 'X (Twitter)', url: 'x.com/user/status/789', time: '12m ago' },
  { platform: '💬', name: 'WhatsApp', url: 'wa.me/1234567890', time: '1h ago' },
]

const statCards = [
  { label: 'Total Links', value: '1,247', icon: Link2Icon, color: 'text-emerald-400' },
  { label: 'Native Opens', value: '89%', icon: ExternalLink, color: 'text-violet-400' },
  { label: 'QR Generated', value: '342', icon: QrCode, color: 'text-amber-400' },
]

function Link2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

export default function DashboardPreview() {
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
            <span className="gradient-text">Powerful Dashboard</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage all your links, track analytics, and generate deep links from one place
          </p>
        </motion.div>

        {/* Dashboard mock */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7 }}
          className="glass-card animate-shimmer p-5 sm:p-8 max-w-4xl mx-auto"
        >
          {/* Smart input bar */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-2 border border-border/30 mb-6">
            <Search className="size-4 text-muted-foreground/50" />
            <span className="text-sm text-muted-foreground/50">
              Paste any social media link to generate a deep link...
            </span>
            <div className="ml-auto px-3 py-1.5 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-medium">
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
                  className="p-3 sm:p-4 rounded-lg bg-surface-2/50 border border-border/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`size-4 ${stat.color}`} />
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </div>
                  <span className="text-lg sm:text-2xl font-bold text-foreground">
                    {stat.value}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Recent links */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                Recent Links
              </h4>
              <span className="text-xs text-muted-foreground">View all</span>
            </div>
            <div className="flex flex-col gap-2">
              {recentLinks.map((link, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-surface-2/30 border border-border/10 hover:border-border/30 transition-colors"
                >
                  <span className="text-lg">{link.platform}</span>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-medium text-foreground">{link.name}</span>
                    <p className="text-[11px] text-muted-foreground truncate">{link.url}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground/50 flex-shrink-0">
                    {link.time}
                  </span>
                  <ExternalLink className="size-3 text-muted-foreground/30 flex-shrink-0" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
