'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Star, Quote, ChevronDown, ChevronUp } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'CTO',
    company: 'TechFlow',
    initials: 'SC',
    color: 'bg-emerald-500/20 text-emerald-400',
    quote:
      'LinkVerse transformed our social media workflow. The native app opening saves our team hours every week.',
    fullQuote:
      'LinkVerse transformed our social media workflow. The native app opening saves our team hours every week. We used to struggle with links opening in browsers instead of apps, but now everything works seamlessly. The AI detection is remarkably accurate.',
    rating: 5,
  },
  {
    name: 'Marcus Rivera',
    role: 'Product Lead',
    company: 'SocialBase',
    initials: 'MR',
    color: 'bg-violet-500/20 text-violet-400',
    quote:
      'The deep linking engine is incredibly smart. It just works, every single time.',
    fullQuote:
      'The deep linking engine is incredibly smart. It just works, every single time. We\'ve integrated it into our content sharing pipeline and the reliability has been outstanding. Our users love the seamless experience.',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'DevOps',
    company: 'LinkHive',
    initials: 'PS',
    color: 'bg-cyan-500/20 text-cyan-400',
    quote:
      "The analytics dashboard alone is worth the subscription. Game-changing visibility into our link performance.",
    fullQuote:
      "The analytics dashboard alone is worth the subscription. Game-changing visibility into our link performance. We can now track every click, every open, and every conversion. The real-time data has helped us optimize our sharing strategy by 40%.",
    rating: 5,
  },
  {
    name: 'Alex Thompson',
    role: 'Founder',
    company: 'AppDirect',
    initials: 'AT',
    color: 'bg-amber-500/20 text-amber-400',
    quote:
      "We integrated LinkVerse's API in under an hour. The documentation is flawless and the support is outstanding.",
    fullQuote:
      "We integrated LinkVerse's API in under an hour. The documentation is flawless and the support is outstanding. As a startup, we needed something that just works without weeks of integration effort. LinkVerse delivered beyond our expectations.",
    rating: 5,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

function TestimonialCard({ testimonial }: { testimonial: typeof testimonials[0] }) {
  const [expanded, setExpanded] = useState(false)
  const hasMore = testimonial.fullQuote !== testimonial.quote

  return (
    <motion.div
      variants={cardVariants}
      className="glass-card hover-lift p-6 sm:p-8 animated-border-glow group relative overflow-hidden card-shimmer"
    >
      {/* Subtle left border gradient */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[var(--radius-lg)]"
        style={{
          background: 'linear-gradient(to bottom, oklch(0.696 0.17 162.48 / 40%), oklch(0.488 0.243 264.376 / 30%), oklch(0.769 0.188 70.08 / 20%))',
        }}
      />

      {/* Background quote icon */}
      <Quote className="absolute top-4 right-6 size-12 text-foreground/[0.03] rotate-180 fill-current" />

      {/* Star ratings with filled gold stars — more prominent */}
      <div className="flex items-center gap-1.5 mb-5">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`size-4.5 transition-colors ${
                i < testimonial.rating
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-surface-3 text-surface-3'
              }`}
            />
          ))}
        </div>
        <div className="ml-2 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/15">
          <span className="text-xs text-amber-400 font-bold">
            {testimonial.rating}.0
          </span>
        </div>
      </div>

      {/* Quote */}
      <div className="text-sm sm:text-base text-foreground/90 leading-relaxed mb-4 relative z-10">
        <p>&ldquo;{expanded ? testimonial.fullQuote : testimonial.quote}&rdquo;</p>
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-xs text-emerald-400/60 hover:text-emerald-400 transition-colors flex items-center gap-1"
          >
            {expanded ? (
              <>
                Show less <ChevronUp className="size-3" />
              </>
            ) : (
              <>
                Read more <ChevronDown className="size-3" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Author */}
      <div className="flex items-center gap-3.5 mt-auto">
        <div
          className="w-10 h-10 rounded-full gradient-avatar flex items-center justify-center text-sm font-bold text-foreground"
          style={{
            boxShadow: '0 0 12px oklch(0.696 0.17 162.48 / 15%)',
          }}
        >
          {testimonial.initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {testimonial.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {testimonial.role} <span className="text-muted-foreground/30 mx-0.5">/</span> {testimonial.company}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default function Testimonials() {
  return (
    <section className="relative py-20 sm:py-28">
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
            <span className="gradient-text-animated">Loved by Teams Worldwide</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            See what our customers have to say about LinkVerse
          </p>
        </motion.div>

        {/* Testimonial cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid sm:grid-cols-2 gap-5 sm:gap-6"
        >
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
