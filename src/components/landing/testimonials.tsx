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
    transition: { staggerChildren: 0.1 },
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
          className="grid sm:grid-cols-2 gap-4 sm:gap-5"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.name}
              variants={cardVariants}
              className="glass-card hover-lift p-5 sm:p-6"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="size-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm sm:text-base text-foreground/90 leading-relaxed mb-5">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full ${testimonial.color} flex items-center justify-center text-xs font-bold`}
                >
                  {testimonial.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role} at {testimonial.company}
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
