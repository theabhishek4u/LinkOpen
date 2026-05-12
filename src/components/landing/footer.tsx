'use client'

import { useState, useEffect, useMemo } from 'react'
import { Github, Twitter, MessageCircle, ArrowUp, Mail, Sparkles, Heart, X, ShieldCheck, Linkedin, Youtube } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'

const footerLinks = {
  Product: ['Features', 'Pricing', 'API', 'Changelog'],
  Company: ['About', 'Blog', 'Careers', 'Contact'],
  Resources: ['Documentation', 'Guides', 'Support', 'Status'],
  Legal: ['Privacy', 'Terms', 'Cookie Policy', 'GDPR'],
}

const socialLinks = [
  { icon: Twitter, label: 'Twitter', brandColor: '#1DA1F2', hoverBg: 'hover:bg-[#1DA1F2]/15', hoverText: 'hover:text-[#1DA1F2]', glowColor: '0 0 12px #1DA1F240' },
  { icon: Github, label: 'GitHub', brandColor: '#f0f0f0', hoverBg: 'hover:bg-[#f0f0f0]/10', hoverText: 'hover:text-[#f0f0f0]', glowColor: '0 0 12px #f0f0f020' },
  { icon: MessageCircle, label: 'Discord', brandColor: '#5865F2', hoverBg: 'hover:bg-[#5865F2]/15', hoverText: 'hover:text-[#5865F2]', glowColor: '0 0 12px #5865F240' },
  { icon: Linkedin, label: 'LinkedIn', brandColor: '#0A66C2', hoverBg: 'hover:bg-[#0A66C2]/15', hoverText: 'hover:text-[#0A66C2]', glowColor: '0 0 12px #0A66C240' },
  { icon: Youtube, label: 'YouTube', brandColor: '#FF0000', hoverBg: 'hover:bg-[#FF0000]/15', hoverText: 'hover:text-[#FF0000]', glowColor: '0 0 12px #FF000040' },
]

// Cookie consent banner component
function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem('linkverse-cookie-consent')
    if (!dismissed) {
      const timer = setTimeout(() => setVisible(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('linkverse-cookie-consent', 'dismissed')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <div className="max-w-4xl mx-auto glass-card rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm text-foreground font-medium">We value your privacy</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                We use cookies to enhance your experience. By continuing, you agree to our{' '}
                <a href="#" className="text-emerald-400 hover:underline focus-visible-ring">Cookie Policy</a>.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-xs text-muted-foreground hover:text-foreground btn-ghost-shine focus-visible-ring"
              >
                Decline
              </Button>
              <Button
                size="sm"
                onClick={handleDismiss}
                className="text-xs bg-emerald-500 hover:bg-emerald-400 text-white btn-primary-glow focus-visible-ring"
              >
                Accept
              </Button>
              <button
                onClick={handleDismiss}
                className="ml-1 p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors focus-visible-ring"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Footer background particles
function FooterParticles() {
  const dots = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: `${3 + Math.random() * 4}s`,
      delay: `${Math.random() * 5}s`,
    }))
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {dots.map((dot) => (
        <div
          key={dot.id}
          className="footer-dot"
          style={{
            left: dot.left,
            top: dot.top,
            '--dot-duration': dot.duration,
            '--dot-delay': dot.delay,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <footer className="relative gradient-mesh-bg overflow-hidden">
        {/* Footer particle dots decoration */}
        <FooterParticles />

        {/* Enhanced gradient top border line */}
        <div
          className="h-px relative z-10"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, oklch(0.696 0.17 162.48 / 50%) 20%, oklch(0.488 0.243 264.376 / 40%) 50%, oklch(0.769 0.188 70.08 / 30%) 80%, transparent 100%)',
            boxShadow: '0 0 8px oklch(0.696 0.17 162.48 / 20%)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          {/* Prominent Newsletter Section */}
          <div className="mb-14">
            <div className="newsletter-card glass-card p-6 sm:p-8 rounded-xl text-center max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Mail className="size-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-foreground">Stay in the Loop</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
                Get the latest updates on deep linking, new platform support, and product features delivered to your inbox.
              </p>
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  placeholder="your@email.com"
                  className={`h-11 text-sm bg-surface-2 border-border/30 placeholder:text-muted-foreground/40 transition-all duration-300 focus-visible-ring ${
                    emailFocused ? 'newsletter-input-glow border-emerald-500/40' : ''
                  }`}
                />
                <Button
                  type="submit"
                  className="h-11 px-5 bg-emerald-500 hover:bg-emerald-400 text-surface-0 font-semibold text-sm flex-shrink-0 transition-all duration-300 btn-primary-glow focus-visible-ring"
                >
                  {subscribed ? (
                    <span className="flex items-center gap-1.5">✓ Subscribed!</span>
                  ) : (
                    'Subscribe'
                  )}
                </Button>
              </form>
              <p className="text-[10px] text-muted-foreground/30 mt-3">No spam, unsubscribe anytime.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-10 sm:gap-12 mb-14">
            {/* Brand column */}
            <div className="col-span-2 sm:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
              <span className="text-xl font-bold gradient-text-smooth">LinkVerse</span>
              <p className="mt-3 text-sm text-muted-foreground max-w-xs leading-relaxed">
                AI-powered deep linking platform that opens social media links in their native apps.
              </p>

              {/* Social links with brand colors on hover */}
              <div className="flex gap-3 mt-5">
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <motion.a
                      key={social.label}
                      href="#"
                      aria-label={social.label}
                      whileHover={{ y: -3, scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center text-muted-foreground social-icon-brand ${social.hoverText} ${social.hoverBg} focus-visible-ring`}
                      style={{
                        transition: 'color 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.3s ease, box-shadow 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.boxShadow = social.glowColor
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.boxShadow = 'none'
                      }}
                    >
                      <Icon className="size-4" />
                    </motion.a>
                  )
                })}
              </div>
            </div>

            {/* Link columns with gradient separators */}
            {Object.entries(footerLinks).map(([category, links], catIndex, arr) => (
              <div key={category} className="relative">
                {/* Gradient separator on desktop (between columns) */}
                {catIndex > 0 && (
                  <div className="hidden lg:block absolute -left-6 top-0 bottom-0 gradient-separator" aria-hidden="true" />
                )}
                <h4 className="text-sm font-semibold text-foreground mb-4">{category}</h4>
                <ul className="flex flex-col gap-3">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors duration-200 focus-visible-ring rounded-sm"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Status section */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-card">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">All Systems Operational</span>
            </div>
          </div>

          {/* Gradient horizontal rule above copyright */}
          <div className="gradient-hr mb-8" />

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <p className="text-xs text-muted-foreground/60">
                &copy; 2025 LinkVerse. All rights reserved.
              </p>
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-2/50 border border-emerald-500/10"
                style={{ animation: 'glow-pulse 5s ease-in-out infinite' }}
              >
                <Sparkles className="size-3 text-emerald-400" />
                <span className="text-[10px] text-muted-foreground">Built with</span>
                <span className="text-[10px] gradient-text font-semibold">AI</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Made with ♥ and AI */}
              <span className="text-xs text-muted-foreground/40 flex items-center gap-1">
                Made with <Heart className="size-3 text-rose-400/60 fill-rose-400/60" /> and AI
              </span>

              {/* Back to top button with bounce animation */}
              <motion.button
                onClick={scrollToTop}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="back-to-top-bounce flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-2/40 border border-border/10 text-xs text-muted-foreground/40 hover:text-emerald-400 hover:border-emerald-500/20 transition-all duration-300 group focus-visible-ring"
                aria-label="Back to top"
              >
                Back to top
                <ArrowUp className="size-3 group-hover:-translate-y-0.5 transition-transform" />
              </motion.button>
            </div>
          </div>
        </div>
      </footer>

      {/* Cookie consent banner */}
      <CookieConsentBanner />
    </>
  )
}
