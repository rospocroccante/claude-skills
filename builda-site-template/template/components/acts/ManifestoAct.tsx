'use client'

import { useRef, useEffect } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap-config'

interface Phrase {
  text: string
  highlight?: { word: string; style: React.CSSProperties }
  bold?: boolean
}

const phrases: Phrase[] = [
  { text: 'Every great product' },
  { text: 'starts with a question.' },
  {
    text: 'What if software could think?',
    highlight: {
      word: 'think',
      style: { textShadow: '0 0 30px rgba(227,229,223,0.2)' },
    },
  },
  { text: 'What if automation felt invisible?' },
  { text: 'We answered.', bold: true },
]

export default function ManifestoAct() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const phraseRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      const section = sectionRef.current!
      const totalPhrases = phrases.length
      // Each phrase gets 40vh of scroll: 20vh appear + 20vh disappear
      // Total scroll distance = totalPhrases * 40vh = 200vh
      // Pin for the full 200vh section minus the viewport (100vh pinned viewport)
      const pinTrigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        pin: '.manifesto-pin-container',
        pinSpacing: false,
      })

      phraseRefs.current.forEach((el, i) => {
        if (!el) return

        const phraseStart = i / totalPhrases
        const phraseMid = (i + 0.5) / totalPhrases
        const phraseEnd = (i + 1) / totalPhrases

        // Appear animation: opacity 0→1, y 30→0, blur 8→0
        gsap.fromTo(
          el,
          {
            opacity: 0,
            y: 30,
            filter: 'blur(8px)',
          },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: `${phraseStart * 100}% top`,
              end: `${phraseMid * 100}% top`,
              scrub: true,
            },
          }
        )

        // Disappear animation: opacity 1→0, y 0→-30, blur 0→8
        gsap.fromTo(
          el,
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
          },
          {
            opacity: 0,
            y: -30,
            filter: 'blur(8px)',
            ease: 'none',
            immediateRender: false,
            scrollTrigger: {
              trigger: section,
              start: `${phraseMid * 100}% top`,
              end: `${phraseEnd * 100}% top`,
              scrub: true,
            },
          }
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const renderPhraseText = (phrase: Phrase) => {
    if (!phrase.highlight) return phrase.text

    const { word, style } = phrase.highlight
    const parts = phrase.text.split(new RegExp(`(${word})`, 'i'))

    return parts.map((part, i) =>
      part.toLowerCase() === word.toLowerCase() ? (
        <span key={i} style={style}>
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      )
    )
  }

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ height: '200vh' }}
    >
      <div className="manifesto-pin-container relative w-full h-screen flex items-center justify-center overflow-hidden">
        {phrases.map((phrase, i) => (
          <div
            key={i}
            ref={(el) => {
              phraseRefs.current[i] = el
            }}
            className="absolute inset-0 flex items-center justify-center px-6"
            style={{
              opacity: 0,
              fontFamily: 'Syne, sans-serif',
              fontSize: 'clamp(28px, 4.5vw, 56px)',
              fontWeight: phrase.bold ? 800 : 600,
              color: '#E7E5DF',
              textAlign: 'center',
              lineHeight: 1.2,
              pointerEvents: 'none',
              willChange: 'opacity, transform, filter',
              ...(phrase.bold ? { letterSpacing: '-0.02em' } : {}),
            }}
          >
            {renderPhraseText(phrase)}
          </div>
        ))}
      </div>
    </section>
  )
}
