'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

const plansMonthly = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    description: 'Perfect for trying out LinkVerse',
    features: [
      '100 links/mo',
      'Basic analytics',
      'QR codes',
      'Link history',
      'Browser fallback',
    ],
    cta: 'Get Started',
    highlighted: false,
    accent: 'emerald',
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/mo',
    description: 'For professionals and growing teams',
    features: [
      'Unlimited links',
      'Advanced analytics',
      'Custom domains',
      'API access',
      'Priority support',
      'Bulk operations',
    ],
    cta: 'Start Pro Trial',
    highlighted: true,
    accent: 'emerald',
  },
  {
    name: 'Enterprise',
    price: '$49',
    period: '/mo',
    description: 'For large organizations with custom needs',
    features: [
      'Everything in Pro',
      'White label',
      'SSO',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    highlighted: false,
    accent: 'violet',
  },
]

const plansAnnual = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    description: 'Perfect for trying out LinkVerse',
    features: [
      '100 links/mo',
      'Basic analytics',
      'QR codes',
      'Link history',
      'Browser fallback',
    ],
    cta: 'Get Started',
    highlighted: false,
    accent: 'emerald',
  },
  {
    name: 'Pro',
    price: '$10',
    period: '/mo',
    description: 'For professionals and growing teams',
    features: [
      'Unlimited links',
      'Advanced analytics',
      'Custom domains',
      'API access',
      'Priority support',
      'Bulk operations',
    ],
    cta: 'Start Pro Trial',
    highlighted: true,
    accent: 'emerald',
    savings: 'Save 17%',
  },
  {
    name: 'Enterprise',
    price: '$39',
    period: '/mo',
    description: 'For large organizations with custom needs',
    features: [
      'Everything in Pro',
      'White label',
      'SSO',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    highlighted: false,
    accent: 'violet',
    savings: 'Save 20%',
  },
]

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false)
  const [showSaveBadges, setShowSaveBadges] = useState(false)
  const plans = isAnnual ? plansAnnual : plansMonthly

  // Derive price direction from isAnnual (no useEffect needed)
  const priceDirection = isAnnual ? 'down' : 'up'

  const handleToggle = (value: boolean) => {
    setIsAnnual(value)
    setShowSaveBadges(value)
  }

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
            <span className="gradient-text-smooth">Simple, Transparent Pricing</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>

          {/* Monthly/Annual toggle */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <button
              onClick={() => handleToggle(!isAnnual)}
              className="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
              style={{
                background: isAnnual
                  ? 'linear-gradient(135deg, oklch(0.696 0.17 162.48), oklch(0.488 0.243 264.376))'
                  : 'oklch(0.14 0.025 275)',
              }}
              aria-label="Toggle annual pricing"
            >
              <div
                className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300"
                style={{
                  transform: isAnnual ? 'translateX(30px)' : 'translateX(2px)',
                }}
              />
            </button>
            <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annual
            </span>
            {isAnnual && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
              >
                -20%
              </motion.span>
            )}
          </div>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative pricing-card-depth ${plan.highlighted ? 'premium-border' : ''}`}
            >
              <div
                className={`glass-card p-6 sm:p-8 h-full flex flex-col ${
                  plan.highlighted ? 'ring-1 ring-emerald-500/30 glow-green most-popular-shimmer' : ''
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 most-popular-badge">
                    <span className="px-4 py-1.5 rounded-full bg-emerald-500 text-surface-0 text-xs font-bold flex items-center gap-1.5">
                      <Sparkles className="size-3" />
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Annual savings badge with pop animation */}
                {plan.savings && showSaveBadges && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-4 right-4"
                  >
                    <span className="px-2 py-1 rounded-md bg-violet-500/15 border border-violet-500/25 text-[10px] font-bold text-violet-400 save-badge-animate">
                      {plan.savings}
                    </span>
                  </motion.div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl sm:text-5xl font-bold text-foreground price-counter">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={plan.price}
                        initial={{ opacity: 0, y: priceDirection === 'up' ? 20 : -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: priceDirection === 'up' ? -20 : 20 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className={`inline-block ${priceDirection === 'up' ? 'price-counter-enter-up' : 'price-counter-enter-down'}`}
                      >
                        {plan.price}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                  {isAnnual && plan.price !== '$0' && (
                    <p className="text-xs text-muted-foreground/50 mt-1">billed annually</p>
                  )}
                </div>

                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  {plan.features.map((feature, fi) => (
                    <li key={feature} className="flex items-center gap-2.5">
                      <div
                        className="animated-check flex-shrink-0"
                        style={{ '--delay': `${fi * 0.08}s` } as React.CSSProperties}
                      >
                        <div className="w-4 h-4 rounded-full bg-emerald-500/15 flex items-center justify-center">
                          <Check className="size-2.5 text-emerald-400" />
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full h-11 font-semibold ${
                    plan.highlighted
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-surface-0 glow-green-sm'
                      : 'bg-surface-3 hover:bg-surface-4 text-foreground'
                  }`}
                >
                  {plan.cta}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
