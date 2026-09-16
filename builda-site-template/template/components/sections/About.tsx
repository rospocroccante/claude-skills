'use client'

import TextReveal from '@/components/animations/TextReveal'
import ScrollReveal from '@/components/animations/ScrollReveal'

export default function About() {
  return (
    <section id="about" className="py-section-sm lg:py-section" style={{ padding: '80px clamp(24px, 5vw, 80px)' }}>
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
        {/* Left */}
        <div>
          <TextReveal tag="p" className="font-mono text-xs tracking-[0.15em] uppercase mb-4">
            About
          </TextReveal>
          <TextReveal
            tag="h2"
            className="font-display font-bold"
            splitBy="chars"
          >
            Built different.
          </TextReveal>
        </div>

        {/* Right */}
        <ScrollReveal>
          <p
            className="font-body font-light text-base leading-[1.8]"
            style={{ color: 'rgba(255, 255, 255, 0.5)' }}
          >
            BUILDA is a digital studio at the intersection of artificial intelligence
            and exceptional craft. We partner with ambitious companies to design, build
            and scale products that push boundaries. Every pixel is intentional. Every
            algorithm is purposeful.
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
