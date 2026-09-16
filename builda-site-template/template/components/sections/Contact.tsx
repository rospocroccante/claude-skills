'use client'

import TextReveal from '@/components/animations/TextReveal'
import ScrollReveal from '@/components/animations/ScrollReveal'
import GlassButton from '@/components/ui/GlassButton'
import { SITE } from '@/lib/constants'

export default function Contact() {
  return (
    <section
      id="contact"
      className="relative py-section-sm lg:py-section overflow-hidden"
      style={{ padding: '120px clamp(24px, 5vw, 80px)' }}
    >
      {/* Glow decoration */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.12), transparent 70%)',
          filter: 'blur(60px)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-[1400px] mx-auto text-center">
        <TextReveal tag="p" className="font-mono text-xs tracking-[0.15em] uppercase mb-6">
          Ready to build?
        </TextReveal>

        <div className="mb-4">
          <TextReveal
            tag="h2"
            className="font-display font-extrabold leading-[1.05]"
            splitBy="chars"
          >
            Let&apos;s create
          </TextReveal>
        </div>
        <div
          className="mb-10"
          style={{
            fontSize: 'clamp(40px, 8vw, 100px)',
            background: 'linear-gradient(135deg, #6366f1, #a78bfa, #6366f1)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gradientShift 4s ease infinite',
          }}
        >
          <TextReveal
            tag="span"
            className="font-display font-extrabold leading-[1.05]"
            splitBy="chars"
            delay={0.2}
          >
            something extraordinary.
          </TextReveal>
        </div>

        <ScrollReveal delay={0.5} className="mb-8">
          <GlassButton variant="primary" size="lg" href={`mailto:${SITE.email}`}>
            Start a Project
          </GlassButton>
        </ScrollReveal>

        <ScrollReveal delay={0.7}>
          <a
            href={`mailto:${SITE.email}`}
            className="font-body text-[15px] inline-block relative group"
            style={{ color: 'rgba(255, 255, 255, 0.3)' }}
            data-cursor="pointer"
          >
            {SITE.email}
            <span
              className="absolute bottom-0 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full"
            />
          </a>
        </ScrollReveal>
      </div>

      <style jsx>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </section>
  )
}
