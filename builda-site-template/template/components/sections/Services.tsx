'use client'

import { useRef, useCallback } from 'react'
import { gsap } from '@/lib/gsap-config'
import { SERVICES } from '@/lib/constants'
import TextReveal from '@/components/animations/TextReveal'
import ScrollReveal from '@/components/animations/ScrollReveal'
import SectionDivider from '@/components/ui/SectionDivider'

function ServiceItem({
  service,
}: {
  service: (typeof SERVICES)[number]
}) {
  const rowRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = useCallback(() => {
    const row = rowRef.current
    if (!row) return
    gsap.to(row, {
      x: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      duration: 0.4,
      ease: 'power2.out',
    })
    gsap.to(row.querySelector('.service-title'), {
      color: 'rgba(255, 255, 255, 1)',
      duration: 0.3,
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    const row = rowRef.current
    if (!row) return
    gsap.to(row, {
      x: 0,
      backgroundColor: 'rgba(255, 255, 255, 0)',
      duration: 0.4,
      ease: 'power2.out',
    })
    gsap.to(row.querySelector('.service-title'), {
      color: 'rgba(255, 255, 255, 0.9)',
      duration: 0.3,
    })
  }, [])

  return (
    <div
      ref={rowRef}
      className="flex flex-col md:flex-row gap-6 md:gap-12 py-10 px-4 rounded-lg cursor-default"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Number */}
      <div className="shrink-0">
        <span
          className="font-mono text-[13px]"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {service.num}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3
          className="service-title font-display font-semibold mb-3"
          style={{
            fontSize: 'clamp(24px, 3.5vw, 42px)',
            color: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          {service.title}
        </h3>
        <p
          className="font-body font-light text-[15px] max-w-[480px] mb-5 leading-relaxed"
          style={{ color: 'rgba(255, 255, 255, 0.4)' }}
        >
          {service.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {service.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[11px] px-3 py-1.5 rounded-full transition-colors duration-200 hover:bg-accent/15 hover:border-accent/40"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: 'rgba(255, 255, 255, 0.45)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Services() {
  return (
    <section id="services" className="py-section-sm lg:py-section" style={{ padding: '0 clamp(24px, 5vw, 80px)' }}>
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16">
          <div>
            <TextReveal tag="p" className="font-mono text-xs tracking-[0.15em] uppercase mb-4" style-override="true">
              What we do
            </TextReveal>
            <TextReveal tag="h2" className="font-display font-bold text-5xl md:text-6xl">
              Services
            </TextReveal>
          </div>
          <ScrollReveal className="max-w-md">
            <p className="font-body font-light text-[15px] leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
              We combine deep technical expertise with refined design thinking to deliver products that perform and inspire.
            </p>
          </ScrollReveal>
        </div>

        {/* Service List */}
        <div>
          {SERVICES.map((service, i) => (
            <ScrollReveal key={service.num} delay={i * 0.1}>
              <SectionDivider />
              <ServiceItem service={service} />
            </ScrollReveal>
          ))}
          <SectionDivider />
        </div>
      </div>
    </section>
  )
}
