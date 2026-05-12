'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle } from 'lucide-react'

const faqs = [
  {
    question: 'What is deep linking?',
    answer:
      'Deep linking allows URLs to open directly in their native mobile apps instead of web browsers. When you tap a deep link on your phone, it opens the relevant app (like Instagram or YouTube) and navigates to the specific content, rather than opening a browser tab.',
  },
  {
    question: 'Which platforms are supported?',
    answer:
      'We support 13 major platforms including Instagram, YouTube, Facebook, TikTok, Telegram, WhatsApp, X (Twitter), Snapchat, LinkedIn, Pinterest, Reddit, Discord, and Threads. We are constantly adding support for new platforms.',
  },
  {
    question: 'Does it work on desktop?',
    answer:
      'Yes! On desktop, LinkVerse opens links in the web version of the platform. On mobile, it attempts native app opening first and falls back to the browser if the app is not installed. The experience is optimized for every device.',
  },
  {
    question: 'What happens if the app is not installed?',
    answer:
      'LinkVerse automatically falls back to opening the link in the web browser. Our AI engine detects whether the native app is available and routes accordingly, ensuring a seamless experience regardless of the user\'s setup.',
  },
  {
    question: 'Is there an API available?',
    answer:
      'Yes, our Pro and Enterprise plans include full REST API access. You can programmatically generate deep links, track analytics, and integrate LinkVerse into your own applications. The API includes comprehensive documentation and SDKs for popular languages.',
  },
  {
    question: 'How does AI smart routing work?',
    answer:
      'Our AI engine analyzes the URL structure, content type, and device capabilities in real-time. It determines the optimal routing strategy—whether to open in a native app, web browser, or a specific app version—based on pattern recognition and predictive models trained on millions of link openings.',
  },
  {
    question: 'Can I use custom domains?',
    answer:
      'Custom domains are available on the Pro and Enterprise plans. You can configure your own domain for deep links, giving your brand a professional touch while maintaining all the powerful features of LinkVerse.',
  },
  {
    question: 'How secure is my data?',
    answer:
      'Security is our top priority. All data is encrypted in transit and at rest. We are SOC 2 compliant and follow industry best practices for data protection. Enterprise customers can also enable SSO and additional security features.',
  },
]

// Individual FAQ item component (to satisfy React hooks rules)
function FaqItem({ faq, index, isOpen, onToggle }: { faq: typeof faqs[0]; index: number; isOpen: boolean; onToggle: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className={`faq-hover-glow faq-gradient-border relative rounded-lg overflow-hidden ${
        isOpen ? 'open' : ''
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 sm:px-5 py-4 text-left group transition-all duration-300 focus-visible-ring"
        aria-expanded={isOpen}
      >
        {/* Number badge */}
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 text-xs flex items-center justify-center font-mono transition-all duration-300 group-hover:bg-emerald-500/20 group-hover:scale-110">
          {index + 1}
        </span>

        {/* Question text */}
        <span className={`flex-1 text-sm sm:text-base font-medium transition-colors duration-300 ${
          isOpen ? 'text-emerald-400' : 'text-foreground group-hover:text-emerald-400'
        }`}>
          {faq.question}
        </span>

        {/* Animated chevron icon */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={`flex-shrink-0 transition-colors duration-300 ${
            isOpen ? 'text-emerald-400' : 'text-muted-foreground group-hover:text-emerald-400'
          }`}
        >
          <ChevronDown className="size-4" />
        </motion.div>
      </button>

      {/* Smooth accordion content with Framer Motion */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-4 pl-12 sm:pl-14 text-sm text-muted-foreground leading-relaxed">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="relative py-20 sm:py-28 mesh-gradient-subtle">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header with gradient text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20"
          >
            <HelpCircle className="size-3.5 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">Got Questions?</span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            <span className="faq-header-gradient">Frequently Asked Questions</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Got questions? We have answers. If you can not find what you are looking for, reach out to our support team.
          </p>
        </motion.div>

        {/* FAQ Accordion with Framer Motion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card p-5 sm:p-8"
        >
          <div className="flex flex-col gap-2">
            {faqs.map((faq, i) => (
              <FaqItem
                key={i}
                faq={faq}
                index={i}
                isOpen={openIndex === i}
                onToggle={() => handleToggle(i)}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
