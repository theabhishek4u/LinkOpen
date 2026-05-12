'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Link2, ArrowUp, Sparkles } from 'lucide-react'
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
        setTimeout(() => setShowCursor(false), 1500)
      }
    }, 80)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div layoutId="linkverse-logo" className="flex items-center gap-2.5">
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
    </motion.div>
  )
}

// Animated hamburger button that transforms to X
function HamburgerButton({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative w-10 h-10 flex items-center justify-center rounded-lg text-muted-foreground hover:text-emerald-400 hover:bg-accent/50 transition-colors focus-visible-ring ${isOpen ? 'hamburger-open' : ''}`}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
    >
      <div className="flex flex-col gap-[5px] w-5">
        <span className="hamburger-line block h-[2px] w-full bg-current rounded-full" />
        <span className="hamburger-line block h-[2px] w-full bg-current rounded-full" />
        <span className="hamburger-line block h-[2px] w-full bg-current rounded-full" />
      </div>
    </button>
  )
}

// Back-to-top FAB with circular progress indicator
function BackToTopFAB({ scrollProgress }: { scrollProgress: number }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(scrollProgress >= 50)
  }, [scrollProgress])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const radius = 20
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full glass-card flex items-center justify-center focus-visible-ring group hover:scale-110 transition-transform duration-200"
          aria-label="Back to top"
        >
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <circle
              cx="24"
              cy="24"
              r={radius}
              fill="none"
              stroke="oklch(0.93 0.01 270 / 10%)"
              strokeWidth="2.5"
              className="dark:stroke-[oklch(0.93_0.01_270/6%)]"
            />
            <circle
              cx="24"
              cy="24"
              r={radius}
              fill="none"
              stroke="oklch(0.696 0.17 162.48)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-[stroke-dashoffset] duration-150 ease-out"
              style={{ filter: 'drop-shadow(0 0 3px oklch(0.696 0.17 162.48 / 40%))' }}
            />
          </svg>
          <ArrowUp className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

export default function Navbar({ onGetStarted }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeLink, setActiveLink] = useState<string | null>(null)
  const [currentSection, setCurrentSection] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0
      setScrollProgress(progress)

      // Track which section is currently in view for active indicator
      const sections = navLinks.map(l => l.href.replace('#', ''))
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i])
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 100) {
            setCurrentSection(sections[i])
            return
          }
        }
      }
      setCurrentSection(null)
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
    setTimeout(() => setActiveLink(null), 600)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'nav-glass nav-scroll-shadow nav-scroll-glow'
            : 'bg-transparent'
        }`}
        style={scrolled ? { backdropFilter: 'blur(20px) saturate(200%)', WebkitBackdropFilter: 'blur(20px) saturate(200%)' } : undefined}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="#" className="group focus-visible-ring rounded-md" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
              <LinkVerseLogo />
            </a>

            {/* Desktop nav links with active indicator */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const sectionId = link.href.replace('#', '')
                const isActive = currentSection === sectionId || activeLink === link.href
                return (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link.href)}
                    className={`text-sm transition-colors duration-200 relative group focus-visible-ring rounded-sm px-1 ${
                      isActive ? 'text-emerald-400 nav-active-indicator' : 'text-muted-foreground hover:text-emerald-400'
                    }`}
                  >
                    {link.label}
                    {/* Hover underline */}
                    {!isActive && (
                      <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-emerald-400 to-violet-400 group-hover:w-full transition-all duration-300" />
                    )}
                  </button>
                )
              })}

              {/* AI Powered gradient pill badge */}
              <span className="ai-powered-pill inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium text-emerald-400">
                <Sparkles className="size-3" />
                AI Powered
              </span>
            </div>

            {/* Desktop CTA with glow effect */}
            <div className="hidden md:block">
              <Button
                onClick={onGetStarted}
                className="launch-btn-glow bg-emerald-500 hover:bg-emerald-400 text-white font-semibold h-9 relative overflow-hidden focus-visible-ring btn-primary-glow"
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  Launch App
                  <ArrowRight className="size-3.5" />
                </span>
              </Button>
            </div>

            {/* Mobile hamburger menu */}
            <div className="md:hidden">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <HamburgerButton isOpen={false} onClick={() => setMobileOpen(true)} />
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
                  {/* AI Powered badge in mobile menu */}
                  <div className="mt-4 mb-2">
                    <span className="ai-powered-pill inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium text-emerald-400">
                      <Sparkles className="size-3" />
                      AI Powered
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    {navLinks.map((link, i) => (
                      <motion.button
                        key={link.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
                        onClick={() => handleNavClick(link.href)}
                        className={`text-base transition-colors py-3 px-3 rounded-lg text-left focus-visible-ring animate-mobile-menu-slide ${
                          currentSection === link.href.replace('#', '')
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : 'text-muted-foreground hover:text-emerald-400 hover:bg-accent/50'
                        }`}
                        style={{ animationDelay: `${i * 0.06}s` }}
                      >
                        {link.label}
                      </motion.button>
                    ))}
                    <Button
                      onClick={() => { setMobileOpen(false); onGetStarted?.() }}
                      className="mt-4 btn-primary-glow glow-green bg-emerald-500 hover:bg-emerald-400 text-white font-semibold focus-visible-ring"
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

      {/* Back to top FAB with circular progress */}
      <BackToTopFAB scrollProgress={scrollProgress} />
    </>
  )
}
