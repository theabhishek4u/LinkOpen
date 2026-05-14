'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wrench, Copy, ExternalLink, ChevronDown, Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { getAllPlatforms, type PlatformInfo } from '@/lib/platform-detect'
import { buildDeepLinkUrl } from '@/lib/deep-link'

// Platform-specific parameter definitions
interface ParamDef {
  key: string
  label: string
  description: string
  placeholder: string
  required?: boolean
}

interface PlatformTemplate {
  name: string
  description: string
  params: ParamDef[]
  buildPath: (values: Record<string, string>) => string
  examples: { label: string; values: Record<string, string> }[]
}

const PLATFORM_TEMPLATES: Record<string, PlatformTemplate> = {
  youtube: {
    name: 'YouTube',
    description: 'Deep links to videos, channels, and playlists',
    params: [
      { key: 'video_id', label: 'Video ID', description: 'YouTube video ID (e.g. dQw4w9WgXcQ)', placeholder: 'dQw4w9WgXcQ' },
      { key: 'playlist_id', label: 'Playlist ID', description: 'YouTube playlist ID', placeholder: 'PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf' },
      { key: 'channel_id', label: 'Channel ID', description: 'YouTube channel handle or ID', placeholder: '@MrBeast' },
    ],
    buildPath: (v) => {
      if (v.video_id) return `video/${encodeURIComponent(v.video_id)}`
      if (v.channel_id) return `channel/${encodeURIComponent(v.channel_id)}`
      if (v.playlist_id) return `playlist?list=${encodeURIComponent(v.playlist_id)}`
      return ''
    },
    examples: [
      { label: 'Open Video', values: { video_id: 'dQw4w9WgXcQ' } },
      { label: 'Open Channel', values: { channel_id: '@MrBeast' } },
    ],
  },
  instagram: {
    name: 'Instagram',
    description: 'Deep links to user profiles and media',
    params: [
      { key: 'username', label: 'Username', description: 'Instagram username without @', placeholder: 'zuck', required: true },
      { key: 'media_shortcode', label: 'Media Shortcode', description: 'Post or reel shortcode from URL', placeholder: 'Cx4i...' },
    ],
    buildPath: (v) => {
      if (v.media_shortcode) return `media?shortcode=${encodeURIComponent(v.media_shortcode)}`
      if (v.username) return `user?username=${encodeURIComponent(v.username)}`
      return ''
    },
    examples: [
      { label: 'Open Profile', values: { username: 'nasa' } },
      { label: 'Open Post', values: { username: 'nasa', media_shortcode: 'Cx4iR_vr5jL' } },
    ],
  },
  x: {
    name: 'X (Twitter)',
    description: 'Deep links to profiles and tweets',
    params: [
      { key: 'screen_name', label: 'Screen Name', description: 'X handle without @', placeholder: 'elonmusk', required: true },
      { key: 'status_id', label: 'Status ID', description: 'Tweet status ID', placeholder: '1234567890' },
    ],
    buildPath: (v) => {
      if (v.screen_name && v.status_id) return `user?screen_name=${encodeURIComponent(v.screen_name)}&status_id=${encodeURIComponent(v.status_id)}`
      if (v.screen_name) return `user?screen_name=${encodeURIComponent(v.screen_name)}`
      return ''
    },
    examples: [
      { label: 'Open Profile', values: { screen_name: 'elonmusk' } },
      { label: 'Open Tweet', values: { screen_name: 'elonmusk', status_id: '1234567890' } },
    ],
  },
  telegram: {
    name: 'Telegram',
    description: 'Deep links to chats and messages',
    params: [
      { key: 'domain', label: 'Username', description: 'Telegram username', placeholder: 'durov', required: true },
      { key: 'post', label: 'Post ID', description: 'Message ID for specific post', placeholder: '12345' },
    ],
    buildPath: (v) => {
      if (v.domain && v.post) return `resolve?domain=${encodeURIComponent(v.domain)}&post=${encodeURIComponent(v.post)}`
      if (v.domain) return `resolve?domain=${encodeURIComponent(v.domain)}`
      return ''
    },
    examples: [
      { label: 'Open Chat', values: { domain: 'durov' } },
    ],
  },
  whatsapp: {
    name: 'WhatsApp',
    description: 'Deep links to chats',
    params: [
      { key: 'phone', label: 'Phone Number', description: 'Phone number with country code', placeholder: '1234567890', required: true },
    ],
    buildPath: (v) => {
      if (v.phone) return `send?phone=${encodeURIComponent(v.phone)}`
      return 'send'
    },
    examples: [
      { label: 'Open Chat', values: { phone: '1234567890' } },
    ],
  },
  discord: {
    name: 'Discord',
    description: 'Deep links to invites and channels',
    params: [
      { key: 'invite_code', label: 'Invite Code', description: 'Discord server invite code', placeholder: 'discord' },
      { key: 'guild_id', label: 'Guild ID', description: 'Server (guild) ID', placeholder: '123456789' },
      { key: 'channel_id', label: 'Channel ID', description: 'Channel ID within server', placeholder: '987654321' },
    ],
    buildPath: (v) => {
      if (v.guild_id && v.channel_id) return `channels/${encodeURIComponent(v.guild_id)}/${encodeURIComponent(v.channel_id)}`
      if (v.invite_code) return `invite/${encodeURIComponent(v.invite_code)}`
      return ''
    },
    examples: [
      { label: 'Join Server', values: { invite_code: 'discord' } },
    ],
  },
  reddit: {
    name: 'Reddit',
    description: 'Deep links to subreddits and posts',
    params: [
      { key: 'subreddit', label: 'Subreddit', description: 'Subreddit name without r/', placeholder: 'programming', required: true },
      { key: 'post_id', label: 'Post ID', description: 'Reddit post ID', placeholder: 'abc123' },
    ],
    buildPath: (v) => {
      if (v.subreddit && v.post_id) return `r/${encodeURIComponent(v.subreddit)}/comments/${encodeURIComponent(v.post_id)}`
      if (v.subreddit) return `r/${encodeURIComponent(v.subreddit)}`
      return ''
    },
    examples: [
      { label: 'Open Subreddit', values: { subreddit: 'programming' } },
    ],
  },
  linkedin: {
    name: 'LinkedIn',
    description: 'Deep links to profiles and companies',
    params: [
      { key: 'username', label: 'Username', description: 'LinkedIn profile username', placeholder: 'williamhgates' },
      { key: 'company', label: 'Company Name', description: 'LinkedIn company name slug', placeholder: 'microsoft' },
    ],
    buildPath: (v) => {
      if (v.username) return `profile?username=${encodeURIComponent(v.username)}`
      if (v.company) return `company?name=${encodeURIComponent(v.company)}`
      return ''
    },
    examples: [
      { label: 'Open Profile', values: { username: 'williamhgates' } },
    ],
  },
  tiktok: {
    name: 'TikTok',
    description: 'Deep links to user profiles and videos',
    params: [
      { key: 'username', label: 'Username', description: 'TikTok username without @', placeholder: 'charlidamelio' },
      { key: 'video_id', label: 'Video ID', description: 'TikTok video ID', placeholder: '7234567890' },
    ],
    buildPath: (v) => {
      if (v.username && v.video_id) return `user?username=${encodeURIComponent(v.username)}&video=${encodeURIComponent(v.video_id)}`
      if (v.username) return `user?username=${encodeURIComponent(v.username)}`
      if (v.video_id) return `video?id=${encodeURIComponent(v.video_id)}`
      return ''
    },
    examples: [
      { label: 'Open Profile', values: { username: 'charlidamelio' } },
    ],
  },
  facebook: {
    name: 'Facebook',
    description: 'Deep links to profiles and posts',
    params: [
      { key: 'profile', label: 'Profile', description: 'Facebook profile identifier', placeholder: 'zuck' },
      { key: 'post_id', label: 'Post ID', description: 'Facebook post ID', placeholder: '123456' },
    ],
    buildPath: (v) => {
      if (v.profile && v.post_id) return `post/${encodeURIComponent(v.post_id)}`
      if (v.profile) return `profile/${encodeURIComponent(v.profile)}`
      return ''
    },
    examples: [
      { label: 'Open Profile', values: { profile: 'zuck' } },
    ],
  },
  snapchat: {
    name: 'Snapchat',
    description: 'Deep links to user profiles',
    params: [
      { key: 'username', label: 'Username', description: 'Snapchat username', placeholder: 'djkhaled305', required: true },
    ],
    buildPath: (v) => {
      if (v.username) return `add/${encodeURIComponent(v.username)}`
      return ''
    },
    examples: [
      { label: 'Add User', values: { username: 'djkhlaed305' } },
    ],
  },
  pinterest: {
    name: 'Pinterest',
    description: 'Deep links to pins and profiles',
    params: [
      { key: 'pin_id', label: 'Pin ID', description: 'Pinterest pin ID', placeholder: '123456789' },
      { key: 'username', label: 'Username', description: 'Pinterest username', placeholder: 'nasa' },
    ],
    buildPath: (v) => {
      if (v.pin_id) return `pin/${encodeURIComponent(v.pin_id)}`
      if (v.username) return `user?username=${encodeURIComponent(v.username)}`
      return ''
    },
    examples: [
      { label: 'Open Pin', values: { pin_id: '123456789' } },
    ],
  },
  threads: {
    name: 'Threads',
    description: 'Deep links to user profiles and posts',
    params: [
      { key: 'username', label: 'Username', description: 'Threads username without @', placeholder: 'zuck' },
      { key: 'post_id', label: 'Post ID', description: 'Threads post ID', placeholder: 'Cx4i...' },
    ],
    buildPath: (v) => {
      if (v.username && v.post_id) return `user?username=${encodeURIComponent(v.username)}&post=${encodeURIComponent(v.post_id)}`
      if (v.username) return `user?username=${encodeURIComponent(v.username)}`
      return ''
    },
    examples: [
      { label: 'Open Profile', values: { username: 'zuck' } },
    ],
  },
}

export function UrlBuilder() {
  const platforms = useMemo(() => getAllPlatforms(), [])
  const [selectedPlatform, setSelectedPlatform] = useState<string>('')
  const [paramValues, setParamValues] = useState<Record<string, string>>({})
  const [showExamples, setShowExamples] = useState(false)
  const [copied, setCopied] = useState(false)

  const template = selectedPlatform ? PLATFORM_TEMPLATES[selectedPlatform] : null
  const platformInfo = platforms.find((p) => p.id === selectedPlatform)

  const constructedUrl = useMemo(() => {
    if (!template || !platformInfo) return ''
    const path = template.buildPath(paramValues)
    return buildDeepLinkUrl(platformInfo.deepLinkScheme, path)
  }, [template, platformInfo, paramValues])

  const handlePlatformChange = useCallback((platformId: string) => {
    setSelectedPlatform(platformId)
    setParamValues({})
    setShowExamples(false)
  }, [])

  const handleParamChange = useCallback((key: string, value: string) => {
    setParamValues((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleCopy = useCallback(async () => {
    if (!constructedUrl) return
    try {
      await navigator.clipboard.writeText(constructedUrl)
      setCopied(true)
      toast.success('Deep link URL copied!', { description: 'Ready to paste', duration: 2000 })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy URL', { description: 'Could not access clipboard' })
    }
  }, [constructedUrl])

  const handleTest = useCallback(() => {
    if (!constructedUrl) return
    try {
      window.open(constructedUrl, '_blank')
    } catch {
      toast.error('Failed to open deep link')
    }
  }, [constructedUrl])

  const handleApplyExample = useCallback((values: Record<string, string>) => {
    setParamValues(values)
    setShowExamples(false)
  }, [])

  return (
    <div className="glass-card rounded-xl p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Wrench className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Deep Link URL Builder</h3>
      </div>

      {/* Platform Selector */}
      <div className="space-y-2">
        <label className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
          Platform
        </label>
        <div className="relative">
          <select
            value={selectedPlatform}
            onChange={(e) => handlePlatformChange(e.target.value)}
            className="w-full rounded-lg bg-background/50 border border-border/40 text-sm text-foreground px-3 py-2.5 pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors"
          >
            <option value="">Select a platform...</option>
            {platforms.map((p) => (
              <option key={p.id} value={p.id}>
                {p.icon} {p.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Platform Description */}
      <AnimatePresence mode="wait">
        {template && (
          <motion.div
            key={selectedPlatform}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <p className="text-[11px] text-muted-foreground">{template.description}</p>

            {/* Parameters */}
            <div className="space-y-2">
              <label className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                Parameters
              </label>
              {template.params.map((param) => (
                <div key={param.key} className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-medium text-foreground">
                      {param.label}
                      {param.required && <span className="text-red-400 ml-0.5">*</span>}
                    </label>
                  </div>
                  <input
                    type="text"
                    value={paramValues[param.key] || ''}
                    onChange={(e) => handleParamChange(param.key, e.target.value)}
                    placeholder={param.placeholder}
                    className="w-full rounded-lg bg-background/50 border border-border/40 text-sm text-foreground px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground/60">{param.description}</p>
                </div>
              ))}
            </div>

            {/* Examples Toggle */}
            {template.examples.length > 0 && (
              <div>
                <button
                  onClick={() => setShowExamples(!showExamples)}
                  className="flex items-center gap-1.5 text-[11px] text-primary hover:text-primary/80 font-medium transition-colors focus-visible-ring rounded"
                >
                  <Sparkles className="h-3 w-3" />
                  {showExamples ? 'Hide' : 'Show'} Examples
                </button>
                <AnimatePresence>
                  {showExamples && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {template.examples.map((ex) => (
                          <button
                            key={ex.label}
                            onClick={() => handleApplyExample(ex.values)}
                            className="rounded-md bg-primary/10 px-2.5 py-1 text-[10px] text-primary font-medium hover:bg-primary/20 transition-colors focus-visible-ring"
                          >
                            {ex.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Constructed URL Preview */}
      <AnimatePresence>
        {constructedUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-2"
          >
            <label className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
              Constructed Deep Link
            </label>
            <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3">
              <div className="flex items-start gap-2">
                <p className="text-sm font-mono break-all leading-relaxed flex-1">
                  {/* Syntax highlighting */}
                  {platformInfo && (
                    <>
                      <span className="text-emerald-400">{platformInfo.deepLinkScheme}</span>
                      <span className="text-amber-400">
                        {constructedUrl.slice(platformInfo.deepLinkScheme.length)}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleCopy}
                className="gap-1.5"
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.span key="copied" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-1.5 text-emerald-400">
                      <Check className="h-3.5 w-3.5" /> Copied!
                    </motion.span>
                  ) : (
                    <motion.span key="copy" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-1.5">
                      <Copy className="h-3.5 w-3.5" /> Copy URL
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
                onClick={handleTest}
              >
                <ExternalLink className="h-3.5 w-3.5" /> Test
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!selectedPlatform && (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/30 mb-2">
            <Wrench className="h-5 w-5 text-muted-foreground/50" />
          </div>
          <p className="text-xs text-muted-foreground/60">Select a platform to build a deep link URL</p>
        </div>
      )}
    </div>
  )
}
