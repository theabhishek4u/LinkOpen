'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'CTO',
    company: 'TechFlow',
    initials: 'SC',
    color: 'bg-emerald-500/20 text-emerald-400',
    quote:
      'LinkVerse transformed our social media workflow. The native app opening saves our team hours every week.',
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
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
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
            <span className="gradient-text">Loved by Teams Worldwide</span>
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
            <motion.div
              key={testimonial.name}
              variants={cardVariants}
              className="glass-card hover-lift p-6 sm:p-8 animated-border-glow group"
            >
              {/* Star ratings with filled gold stars */}
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-4 transition-colors ${
                      i < testimonial.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-surface-3 text-surface-3'
                    }`}
                  />
                ))}
                <span className="ml-2 text-xs text-muted-foreground/50 font-medium">
                  {testimonial.rating}.0
                </span>
              </div>

              {/* Quote */}
              <p className="text-sm sm:text-base text-foreground/90 leading-relaxed mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-10 h-10 rounded-full ${testimonial.color} flex items-center justify-center text-sm font-bold`}
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
          ))}
        </motion.div>
      </div>
    </section>
  )
}
