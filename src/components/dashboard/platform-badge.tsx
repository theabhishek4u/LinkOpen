'use client'

import { motion } from 'framer-motion'

interface PlatformBadgeProps {
  platform: {
    id: string
    name: string
    icon: string
    color: string
  }
}

export function PlatformBadge({ platform }: PlatformBadgeProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap"
      style={{
        backgroundColor: `${platform.color}20`,
        color: platform.color,
        border: `1px solid ${platform.color}40`,
      }}
    >
      <span className="text-sm">{platform.icon}</span>
      <span>{platform.name}</span>
    </motion.div>
  )
}
