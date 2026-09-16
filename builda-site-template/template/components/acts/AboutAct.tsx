'use client'

import { useRef, useEffect } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap-config'

const revealText =
  'We are a digital studio where artificial intelligence meets exceptional craft. Every algorithm is purposeful. Every pixel is intentional.'

const words = revealText.split(' ')

export default function AboutAct() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const sub1Ref = useRef<HTMLDivElement>(null)
  const sub2Ref = useRef<HTMLDivElement>(null)
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])
  const leftColRef = useRef<HTMLDivElement>(null)
  const rightColRef = useRef<HTMLDivElement>(null)
  const badgeRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      // --- Sub-section 1: Word-by-word reveal (pinned) ---
      if (sub1Ref.current) {
        ScrollTrigger.create({
          trigger: sub1Ref.current,
          start: 'top top',
          end: 'bottom bottom',
          pin: '.about-word-pin',
          pinSpacing: false,
        })
      }

      const wordElements = wordRefs.current.filter(Boolean) as HTMLSpanElement[]

      if (wordElements.length > 0 && sub1Ref.current) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sub1Ref.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
          },
        })

        wordElements.forEach((word, i) => {
          tl.to(
            word,
            {
              opacity: 1,
              duration: 1,
              ease: 'none',
            },
            i * 0.5
          )
        })
      }

      // --- Sub-section 2: Who We Are ---
      if (leftColRef.current) {
        gsap.fromTo(
          leftColRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sub2Ref.current,
              start: 'top 70%',
              end: 'top 30%',
              scrub: true,
            },
          }
        )
      }

      if (rightColRef.current) {
        gsap.fromTo(
          rightColRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sub2Ref.current,
              start: 'top 60%',
              end: 'top 20%',
              scrub: true,
            },
          }
        )
      }

      // Badge stagger animation
      const badgeElements = badgeRefs.current.filter(Boolean) as HTMLDivElement[]
      if (badgeElements.length > 0) {
        gsap.fromTo(
          badgeElements,
          { opacity: 0, y: 20, scale: 0.8 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: 'power3.out',
            stagger: 0.1,
            scrollTrigger: {
              trigger: badgeElements[0].parentElement,
              start: 'top 75%',
              end: 'top 45%',
              scrub: true,
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ height: '170vh', zIndex: 5 }}
    >
      {/* Sub-section 1: Word-by-word reveal (120vh gives 20vh scroll for pin) */}
      <div
        ref={sub1Ref}
        className="relative w-full"
        style={{ height: '120vh' }}
      >
        <div className="about-word-pin h-screen flex items-center justify-center px-5 md:px-6" style={{
          background: 'radial-gradient(ellipse 130% 130% at 50% 50%, rgba(20,22,24,0.88) 30%, rgba(20,22,24,0.55) 100%)',
        }}>
          <p
            className="text-center"
            style={{
              maxWidth: '900px',
              fontFamily: 'Syne, sans-serif',
              fontSize: 'clamp(22px, 4.5vw, 48px)',
              fontWeight: 600,
              color: '#E7E5DF',
              lineHeight: 1.4,
            }}
          >
            {words.map((word, i) => (
              <span
                key={i}
                ref={(el) => {
                  wordRefs.current[i] = el
                }}
                style={{
                  opacity: 0.1,
                  display: 'inline-block',
                  marginRight: '0.3em',
                }}
              >
                {word}
              </span>
            ))}
          </p>
        </div>
      </div>

      {/* Sub-section 2: Who We Are */}
      <div
        ref={sub2Ref}
        className="relative w-full flex items-center justify-center px-5 md:px-6"
        style={{
          height: '50vh',
          background: 'radial-gradient(ellipse 120% 100% at 50% 50%, rgba(20,22,24,0.75) 20%, transparent 100%)',
        }}
      >
        <div className="w-full" style={{ maxWidth: '1200px' }}>
          {/* Two-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-16 items-start">
            {/* Left column */}
            <div
              ref={leftColRef}
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: 'clamp(28px, 7vw, 72px)',
                fontWeight: 700,
                color: '#E7E5DF',
                lineHeight: 1.1,
                opacity: 0,
              }}
            >
              Built different.
            </div>

            {/* Right column */}
            <div
              ref={rightColRef}
              className="flex items-start"
              style={{ opacity: 0 }}
            >
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 'clamp(14px, 2.5vw, 16px)',
                  fontWeight: 300,
                  color: '#D3D0CB',
                  opacity: 0.6,
                  lineHeight: 1.7,
                }}
              >
                We partner with ambitious companies to build what&apos;s next.
                Our team combines deep technical expertise with design
                sensibility to create digital products that matter.
              </p>
            </div>
          </div>

          {/* Badge row - hidden on mobile */}
          <div className="hidden md:flex flex-wrap gap-4 mt-16 justify-start">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                ref={(el) => {
                  badgeRefs.current[i] = el
                }}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(57, 62, 65, 0.2)',
                  opacity: 0,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
