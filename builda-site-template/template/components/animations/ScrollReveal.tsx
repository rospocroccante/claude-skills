'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap-config'

interface ScrollRevealProps {
  children: React.ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
  duration?: number
  distance?: number
  stagger?: number
  className?: string
}

const directionMap = {
  up: { x: 0, y: 1 },
  down: { x: 0, y: -1 },
  left: { x: 1, y: 0 },
  right: { x: -1, y: 0 },
}

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 1,
  distance = 60,
  stagger = 0.1,
  className = '',
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const dir = directionMap[direction]
    const targets = container.children.length > 1
      ? Array.from(container.children)
      : container

    gsap.set(targets, {
      x: dir.x * distance,
      y: dir.y * distance,
      opacity: 0,
    })

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(targets, {
          x: 0,
          y: 0,
          opacity: 1,
          duration,
          stagger: container.children.length > 1 ? stagger : 0,
          ease: 'power3.out',
          delay,
        })
      },
    })

    return () => {
      trigger.kill()
      gsap.killTweensOf(targets)
    }
  }, [direction, delay, duration, distance, stagger])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}
