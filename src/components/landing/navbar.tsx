'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, ArrowRight, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Platforms', href: '#platforms' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

interface NavbarProps {
  onGetStarted?: () => void
}

function LinkVerseLogo() {
  const [displayText, setDisplayText] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const fullText = 'LinkVerse'

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      if (i <= fullText.length) {
        setDisplayText(fullText.slice(0, i))
        i++
      } else {
        clearInterval(interval)
        // Hide cursor after typing is complete
        setTimeout(() => setShowCursor(false), 1500)
      }
    }, 80)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25">
        <Link2 className="size-4 text-emerald-400" />
        <div className="absolute inset-0 rounded-lg" style={{ boxShadow: '0 0 12px oklch(0.696 0.17 162.48 / 20%)' }} />
      </div>
      <span className="text-lg font-bold gradient-text">
        {displayText}
        {showCursor && (
          <span className="inline-block w-0.5 h-5 bg-emerald-400 ml-0.5 align-middle" style={{ animation: 'cursor-blink 1s step-end infinite' }} />
        )}
      </span>
    </div>
  )
}

export default function Navbar({ onGetStarted }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeLink, setActiveLink] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0
      setScrollProgress(progress)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = useCallback((href: string) => {
    setMobileOpen(false)
    setActiveLink(href)
    const el = document.querySelector(href)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
    // Reset active link after animation
    setTimeout(() => setActiveLink(null), 600)
  }, [])

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'glass-card rounded-none border-x-0 border-t-0 nav-scroll-glow'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="group" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
            <LinkVerseLogo />
          </a>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className={`text-sm text-muted-foreground hover:text-emerald-400 transition-colors duration-200 relative group ${
                  activeLink === link.href ? 'nav-link-active' : ''
                }`}
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-emerald-400 to-violet-400 group-hover:w-full transition-all duration-300" />
                {/* Swipe underline on click */}
                {activeLink === link.href && (
                  <span className="nav-link-underline" />
                )}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Button
              onClick={onGetStarted}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold h-9 glow-green-sm relative overflow-hidden"
              style={{ animation: 'glow-pulse 4s ease-in-out infinite' }}
            >
              <span className="relative z-10 flex items-center gap-1.5">
                Launch App
                <ArrowRight className="size-3.5" />
              </span>
            </Button>
          </div>

          {/* Mobile menu */}
          <div className="md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Menu className="size-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="glass-card border-l border-border/10 bg-background/90 backdrop-blur-2xl"
              >
                <SheetHeader>
                  <SheetTitle className="gradient-text text-left">
                    <LinkVerseLogo />
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 mt-6">
                  {navLinks.map((link, i) => (
                    <motion.button
                      key={link.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleNavClick(link.href)}
                      className="text-base text-muted-foreground hover:text-emerald-400 transition-colors py-3 px-3 rounded-lg hover:bg-accent/50 text-left"
                    >
                      {link.label}
                    </motion.button>
                  ))}
                  <Button
                    onClick={() => { setMobileOpen(false); onGetStarted?.() }}
                    className="mt-4 glow-green bg-emerald-500 hover:bg-emerald-400 text-white font-semibold"
                  >
                    Launch App
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Scroll progress indicator — thicker with gradient glow */}
      <AnimatePresence>
        {scrolled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 h-1 bg-border/20"
          >
            <motion.div
              className="h-full relative"
              style={{
                width: `${scrollProgress}%`,
                background: 'linear-gradient(90deg, oklch(0.696 0.17 162.48), oklch(0.488 0.243 264.376), oklch(0.696 0.17 162.48))',
                backgroundSize: '200% 100%',
                animation: 'gradient-shift 3s ease infinite',
              }}
              transition={{ duration: 0.1 }}
            >
              {/* Glow at the leading edge */}
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                style={{
                  background: 'oklch(0.696 0.17 162.48)',
                  boxShadow: '0 0 8px oklch(0.696 0.17 162.48 / 60%), 0 0 16px oklch(0.696 0.17 162.48 / 30%)',
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
