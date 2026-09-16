'use client'

import { useRef, useEffect } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap-config'

const TICKER_WORDS = [
  'DESIGN',
  'CODE',
  'AI',
  'SYSTEMS',
  'CRAFT',
  'FUTURE',
  'BUILD',
  'SHIP',
]

export default function HeroAct() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const tickerRef = useRef<HTMLDivElement>(null)
  const scrollIndicatorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const title = titleRef.current
    const subtitle = subtitleRef.current

    if (!section || !title || !subtitle) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          pin: true,
          scrub: true,
        },
      })

      tl.to(
        title,
        {
          scaleY: 0.3,
          y: '-100vh',
          ease: 'none',
        },
        0
      )

      tl.to(
        subtitle,
        {
          opacity: 0,
          ease: 'none',
        },
        0
      )

      // Line expands from center
      if (lineRef.current) {
        tl.fromTo(
          lineRef.current,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.4, ease: 'power2.out' },
          0.05
        )
        tl.to(
          lineRef.current,
          { opacity: 0, duration: 0.3, ease: 'none' },
          0.65
        )
      }

      // Ticker fades in then out
      if (tickerRef.current) {
        tl.fromTo(
          tickerRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: 'none' },
          0.1
        )
        tl.to(
          tickerRef.current,
          { opacity: 0, duration: 0.3, ease: 'none' },
          0.65
        )
      }

      // Scroll indicator fades out early as user begins scrolling
      if (scrollIndicatorRef.current) {
        tl.to(
          scrollIndicatorRef.current,
          { opacity: 0, y: 10, duration: 0.15, ease: 'none' },
          0
        )
      }
    }, section)

    return () => {
      ctx.revert()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden"
      style={{ zIndex: 1, background: 'transparent' }}
    >
      {/* Title */}
      <h1
        ref={titleRef}
        className="will-change-transform"
        style={{
          fontFamily: 'var(--font-syne), Syne, sans-serif',
          fontSize: 'clamp(48px, 15vw, 240px)',
          fontWeight: 800,
          color: '#E7E5DF',
          lineHeight: 1,
          transformOrigin: 'center top',
        }}
      >
        BUILDA
      </h1>

      {/* Subtitle */}
      <p
        ref={subtitleRef}
        className="mt-2 md:mt-4 px-6"
        style={{
          fontFamily: 'var(--font-inter), Inter, sans-serif',
          fontSize: 'clamp(13px, 2.5vw, 18px)',
          fontWeight: 300,
          color: '#D3D0CB',
          opacity: 0.6,
          textAlign: 'center',
        }}
      >
        We build the future of software.
      </p>

      {/* Horizontal animated element — expanding line + scrolling ticker */}
      <div className="absolute left-0 right-0" style={{ bottom: 100 }}>
        {/* Expanding line */}
        <div
          ref={lineRef}
          style={{
            height: 1,
            background:
              'linear-gradient(to right, transparent, rgba(57,62,65,0.4) 20%, rgba(57,62,65,0.4) 80%, transparent)',
            transformOrigin: 'center center',
            transform: 'scaleX(0)',
          }}
        />

        {/* Scrolling ticker */}
        <div
          ref={tickerRef}
          style={{
            marginTop: 12,
            overflow: 'hidden',
            opacity: 0,
            maskImage:
              'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          }}
        >
          <div
            className="hero-ticker-track flex"
            style={{ whiteSpace: 'nowrap' }}
          >
            {[0, 1].map((j) => (
              <div key={j} className="flex items-center shrink-0">
                {TICKER_WORDS.map((word, i) => (
                  <span key={`${j}-${i}`} className="flex items-center">
                    <span
                      style={{
                        fontFamily: '"Space Mono", monospace',
                        fontSize: 9,
                        color: '#393E41',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        padding: '0 24px',
                      }}
                    >
                      {word}
                    </span>
                    <span
                      style={{ color: 'rgba(57,62,65,0.3)', fontSize: 5 }}
                    >
                      ◆
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator — positioned above BottomNav safe zone */}
      <div
        ref={scrollIndicatorRef}
        className="absolute flex flex-col items-center gap-2 md:gap-3"
        style={{ bottom: 56 }}
      >
        {/* Pulsing arrow chevron */}
        <svg
          width="20"
          height="12"
          viewBox="0 0 20 12"
          fill="none"
          className="animate-pulse-arrow"
          style={{ color: '#393E41' }}
        >
          <line
            x1="1"
            y1="1"
            x2="10"
            y2="10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="10"
            y1="10"
            x2="19"
            y2="1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>

        <span
          className="uppercase tracking-widest"
          style={{
            fontFamily: 'var(--font-space-mono), "Space Mono", monospace',
            fontSize: '9px',
            color: '#393E41',
          }}
        >
          Scroll
        </span>
      </div>

      {/* Keyframes */}
      <style jsx>{`
        @keyframes pulse-arrow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(6px);
          }
        }
        :global(.animate-pulse-arrow) {
          animation: pulse-arrow 2s ease-in-out infinite;
        }
        @keyframes hero-ticker-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        :global(.hero-ticker-track) {
          animation: hero-ticker-scroll 25s linear infinite;
        }
      `}</style>
    </section>
  )
}
