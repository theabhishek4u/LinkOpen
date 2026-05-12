'use client'

import { Github, Twitter, MessageCircle } from 'lucide-react'

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
  return (
    <footer className="relative border-t border-border/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
            <span className="text-xl font-bold gradient-text">LinkVerse</span>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs leading-relaxed">
              AI-powered deep linking platform that opens social media links in their native apps.
            </p>
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
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:gradient-text transition-all duration-300"
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
          <p className="text-xs text-muted-foreground">
            &copy; 2025 LinkVerse. All rights reserved.
          </p>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-2 border border-border/20">
            <span className="text-[10px] text-muted-foreground">Built with</span>
            <span className="text-[10px] gradient-text font-semibold">AI</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
