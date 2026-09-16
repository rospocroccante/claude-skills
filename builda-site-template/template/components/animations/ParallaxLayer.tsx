'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap-config'

interface ParallaxLayerProps {
  children: React.ReactNode
  speed?: number
  direction?: 'vertical' | 'horizontal'
  className?: string
}

export default function ParallaxLayer({
  children,
  speed = 0.5,
  direction = 'vertical',
  className = '',
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const distance = 100 * speed
    const prop = direction === 'vertical' ? 'y' : 'x'

    const tween = gsap.fromTo(
      el,
      { [prop]: -distance },
      {
        [prop]: distance,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      }
    )

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [speed, direction])

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform' }}>
      {children}
    </div>
  )
}
