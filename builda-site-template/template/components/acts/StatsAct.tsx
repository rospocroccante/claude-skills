'use client'

import { useRef, useEffect } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap-config'

const STATS = [
  { value: 150, suffix: '+', label: 'Projects Delivered' },
  { value: 98, suffix: '%', label: 'Client Retention' },
  { value: 40, suffix: '+', label: 'Team Members' },
  { value: 12, suffix: '', label: 'Countries Served' },
]

export default function StatsAct() {
  const sectionRef = useRef<HTMLElement>(null)
  const pinContainerRef = useRef<HTMLDivElement>(null)
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([])
  const suffixRefs = useRef<(HTMLSpanElement | null)[]>([])
  const lineTopRef = useRef<HTMLDivElement>(null)
  const lineBottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      // Pin the container for the full scroll distance
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        pin: pinContainerRef.current,
        pinSpacing: false,
      })

      // Decorative lines: scaleX 0 → 1 from center
      const lines = [lineTopRef.current, lineBottomRef.current].filter(Boolean)
      lines.forEach((line) => {
        gsap.fromTo(
          line,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 30%',
            },
          }
        )
      })

      // Count-up animation for each stat with stagger
      STATS.forEach((stat, i) => {
        const numberEl = numberRefs.current[i]
        const suffixEl = suffixRefs.current[i]
        if (!numberEl) return

        const counter = { val: 0 }
        const staggerDelay = i * 0.3

        // Count-up tween
        gsap.to(counter, {
          val: stat.value,
          duration: 2,
          ease: 'power2.out',
          delay: staggerDelay,
          onUpdate: () => {
            numberEl.innerHTML = Math.round(counter.val).toString()
          },
          scrollTrigger: {
            trigger: section,
            start: 'top 30%',
          },
        })

        // Suffix fade-in: appears 0.2s after the number finishes
        if (suffixEl && stat.suffix) {
          gsap.fromTo(
            suffixEl,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.4,
              ease: 'power2.out',
              delay: staggerDelay + 2 + 0.2,
              scrollTrigger: {
                trigger: section,
                start: 'top 30%',
              },
            }
          )
        }
      })
    }, section)

    return () => {
      ctx.revert()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ height: '150vh', zIndex: 4 }}
    >
      <div
        ref={pinContainerRef}
        className="relative flex h-screen w-full flex-col items-center justify-center"
        style={{
          background: 'radial-gradient(ellipse 130% 130% at 50% 50%, rgba(20,22,24,0.88) 30%, rgba(20,22,24,0.55) 100%)',
        }}
      >
        {/* Top decorative line - desktop only */}
        <div
          ref={lineTopRef}
          className="absolute left-0 right-0 hidden md:block"
          style={{
            top: 'calc(50% - 80px)',
            height: '1px',
            background:
              'linear-gradient(to right, transparent, rgba(57, 62, 65, 0.3) 20%, rgba(57, 62, 65, 0.3) 80%, transparent)',
            transformOrigin: 'center center',
            transform: 'scaleX(0)',
          }}
        />

        {/* Stats grid */}
        <div className="grid w-full max-w-6xl grid-cols-2 gap-y-4 px-6 md:grid-cols-4 md:gap-y-0">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="stat-cell flex flex-col items-center justify-center py-5 md:py-8"
              style={{
                borderRight:
                  i < STATS.length - 1
                    ? '1px solid rgba(57, 62, 65, 0.2)'
                    : 'none',
              }}
            >
              {/* Number + Suffix */}
              <div className="flex items-baseline">
                <span
                  ref={(el) => {
                    numberRefs.current[i] = el
                  }}
                  style={{
                    fontFamily: 'var(--font-syne), Syne, sans-serif',
                    fontSize: 'clamp(36px, 10vw, 80px)',
                    fontWeight: 800,
                    color: '#E7E5DF',
                    lineHeight: 1,
                  }}
                >
                  0
                </span>
                {stat.suffix && (
                  <span
                    ref={(el) => {
                      suffixRefs.current[i] = el
                    }}
                    style={{
                      fontFamily: 'var(--font-syne), Syne, sans-serif',
                      fontSize: 'clamp(36px, 10vw, 80px)',
                      fontWeight: 800,
                      color: '#E7E5DF',
                      lineHeight: 1,
                      opacity: 0,
                    }}
                  >
                    {stat.suffix}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className="mt-2 md:mt-4"
                style={{
                  fontFamily:
                    'var(--font-space-mono), "Space Mono", monospace',
                  fontSize: '9px',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: '#D3D0CB',
                  opacity: 0.4,
                  textAlign: 'center',
                }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom decorative line - desktop only */}
        <div
          ref={lineBottomRef}
          className="absolute left-0 right-0 hidden md:block"
          style={{
            top: 'calc(50% + 80px)',
            height: '1px',
            background:
              'linear-gradient(to right, transparent, rgba(57, 62, 65, 0.3) 20%, rgba(57, 62, 65, 0.3) 80%, transparent)',
            transformOrigin: 'center center',
            transform: 'scaleX(0)',
          }}
        />
      </div>

      {/* Mobile: remove right border on 2nd and 4th items in 2x2 grid */}
      <style jsx>{`
        @media (max-width: 767px) {
          :global(.stat-cell:nth-child(2n)) {
            border-right: none !important;
          }
        }
      `}</style>
    </section>
  )
}
