'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const plans = [
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

export default function Pricing() {
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
            <span className="gradient-text">Simple, Transparent Pricing</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative ${plan.highlighted ? 'premium-border' : ''}`}
            >
              <div
                className={`glass-card hover-lift p-6 sm:p-8 h-full flex flex-col ${
                  plan.highlighted ? 'ring-1 ring-emerald-500/30 glow-green' : ''
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-emerald-500 text-surface-0 text-xs font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl sm:text-5xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>

                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5">
                      <Check className="size-4 text-emerald-400 flex-shrink-0" />
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
