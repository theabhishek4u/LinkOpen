'use client'

import { motion } from 'framer-motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

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

export default function FAQ() {
  return (
    <section className="relative py-20 sm:py-28 mesh-gradient-subtle">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            <span className="gradient-text">Frequently Asked Questions</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Got questions? We have answers. If you can not find what you are looking for, reach out to our support team.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card p-5 sm:p-8"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="faq-accordion-item border-border/10"
              >
                <AccordionTrigger className="faq-accordion-trigger text-sm sm:text-base text-foreground hover:text-emerald-400 hover:no-underline text-left">
                  <span className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 text-xs flex items-center justify-center font-mono">
                      {i + 1}
                    </span>
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="faq-accordion-content text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
