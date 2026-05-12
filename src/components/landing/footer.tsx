'use client'

import { useState } from 'react'
import { Github, Twitter, MessageCircle, ArrowUp, Mail, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const footerLinks = {
  Product: ['Features', 'Pricing', 'API', 'Changelog'],
  Company: ['About', 'Blog', 'Careers', 'Contact'],
  Resources: ['Documentation', 'Guides', 'Support', 'Status'],
  Legal: ['Privacy', 'Terms', 'Cookie Policy', 'GDPR'],
}

const socialLinks = [
  { icon: Twitter, label: 'Twitter' },
  { icon: Github, label: 'GitHub' },
  { icon: MessageCircle, label: 'Discord' },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

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
    <footer className="relative">
      {/* Gradient top border */}
      <div
        className="h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, oklch(0.696 0.17 162.48 / 40%) 25%, oklch(0.488 0.243 264.376 / 30%) 75%, transparent 100%)',
        }}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-10 sm:gap-12 mb-14">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
            <span className="text-xl font-bold gradient-text">LinkVerse</span>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs leading-relaxed">
              AI-powered deep linking platform that opens social media links in their native apps.
            </p>

            {/* Newsletter */}
            <div className="mt-5">
              <p className="text-xs text-muted-foreground/60 mb-2.5 font-medium uppercase tracking-wider">Stay updated</p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="h-9 text-xs bg-surface-2 border-border/30 placeholder:text-muted-foreground/40 focus:border-emerald-500/40"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 px-3 bg-emerald-500 hover:bg-emerald-400 text-surface-0 font-semibold text-xs flex-shrink-0"
                >
                  {subscribed ? 'Done!' : 'Subscribe'}
                </Button>
              </form>
            </div>

            {/* Social links */}
            <div className="flex gap-3 mt-5">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href="#"
                    aria-label={social.label}
                    className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-3 transition-colors"
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

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border/10 flex flex-col sm:flex-row items-center justify-between gap-4">
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

          {/* Back to top */}
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-xs text-muted-foreground/40 hover:text-emerald-400 transition-colors duration-200 group"
          >
            Back to top
            <ArrowUp className="size-3 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  )
}
