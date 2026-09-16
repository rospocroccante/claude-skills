'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap-config'
import { MARQUEE_ITEMS } from '@/lib/constants'

export default function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)

  // Skew effect on fast scroll
  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const trigger = ScrollTrigger.create({
      trigger: track,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        const velocity = self.getVelocity()
        const skew = Math.min(Math.max(velocity / 300, -5), 5)
        gsap.to(track, {
          skewX: skew,
          duration: 0.3,
          overwrite: true,
        })
      },
    })

    return () => trigger.kill()
  }, [])

  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS]

  return (
    <div
      className="relative overflow-hidden py-6"
      style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        ref={trackRef}
        className="flex items-center whitespace-nowrap"
        style={{
          animation: `marquee 40s linear infinite`,
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      >
        {items.map((item, i) => (
          <span key={i} className="flex items-center shrink-0">
            <span className="font-display text-base font-medium" style={{ color: 'rgba(255, 255, 255, 0.12)' }}>
              {item}
            </span>
            <span
              className="w-1 h-1 rounded-full mx-8 shrink-0"
              style={{ backgroundColor: 'rgba(99, 102, 241, 0.5)' }}
            />
          </span>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  )
}
