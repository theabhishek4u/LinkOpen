'use client'

import { useState } from 'react'
import { Github, Twitter, MessageCircle, ArrowUp, Mail, Sparkles, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const footerLinks = {
  Product: ['Features', 'Pricing', 'API', 'Changelog'],
  Company: ['About', 'Blog', 'Careers', 'Contact'],
  Resources: ['Documentation', 'Guides', 'Support', 'Status'],
  Legal: ['Privacy', 'Terms', 'Cookie Policy', 'GDPR'],
}

const socialLinks = [
  { icon: Twitter, label: 'Twitter', color: 'hover:text-sky-400 hover:bg-sky-500/10' },
  { icon: Github, label: 'GitHub', color: 'hover:text-foreground hover:bg-surface-4' },
  { icon: MessageCircle, label: 'Discord', color: 'hover:text-indigo-400 hover:bg-indigo-500/10' },
]

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
    <footer className="relative gradient-mesh-bg">
      {/* Gradient top border */}
      <div
        className="h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, oklch(0.696 0.17 162.48 / 40%) 25%, oklch(0.488 0.243 264.376 / 30%) 75%, transparent 100%)',
        }}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
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
                className={`h-11 text-sm bg-surface-2 border-border/30 placeholder:text-muted-foreground/40 transition-all duration-300 ${
                  emailFocused ? 'border-emerald-500/40 glow-green-sm' : ''
                }`}
              />
              <Button
                type="submit"
                className="h-11 px-5 bg-emerald-500 hover:bg-emerald-400 text-surface-0 font-semibold text-sm flex-shrink-0 transition-all duration-300"
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

            {/* Social links with hover effects */}
            <div className="flex gap-3 mt-5">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href="#"
                    aria-label={social.label}
                    className={`w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center text-muted-foreground transition-all duration-300 social-icon-hover ${social.color}`}
                  >
                    <Icon className="size-4" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-foreground mb-4">{category}</h4>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors duration-200"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
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

            {/* Back to top button */}
            <button
              onClick={scrollToTop}
              className="back-to-top-hover flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-2/40 border border-border/10 text-xs text-muted-foreground/40 hover:text-emerald-400 hover:border-emerald-500/20 transition-all duration-300 group"
              aria-label="Back to top"
            >
              Back to top
              <ArrowUp className="size-3 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
