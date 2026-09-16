'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap-config'

interface SectionDividerProps {
  className?: string
}

export default function SectionDivider({ className = '' }: SectionDividerProps) {
  const lineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const line = lineRef.current
    if (!line) return

    gsap.set(line, { scaleX: 0, transformOrigin: 'center center' })

    const trigger = ScrollTrigger.create({
      trigger: line,
      start: 'top 90%',
      onEnter: () => {
        gsap.to(line, { scaleX: 1, duration: 1.2, ease: 'power3.inOut' })
      },
      once: true,
    })

    return () => { trigger.kill() }
  }, [])

  return (
    <div
      ref={lineRef}
      className={`w-full h-px ${className}`}
      style={{
        background: 'linear-gradient(90deg, transparent 0%, rgba(57,62,65,0.3) 20%, rgba(57,62,65,0.3) 80%, transparent 100%)',
      }}
    />
  )
}
