'use client'

import { useRef, useCallback } from 'react'
import { gsap } from '@/lib/gsap-config'

interface MagneticWrapperProps {
  children: React.ReactNode
  strength?: number
  className?: string
}

export default function MagneticWrapper({
  children,
  strength = 12,
  className = '',
}: MagneticWrapperProps) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const distX = e.clientX - centerX
      const distY = e.clientY - centerY

      const maxDist = Math.max(rect.width, rect.height)
      const factorX = (distX / maxDist) * strength
      const factorY = (distY / maxDist) * strength

      gsap.to(el, {
        x: factorX,
        y: factorY,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: true,
      })
    },
    [strength]
  )

  const handleMouseLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    gsap.to(el, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.5)',
      overwrite: true,
    })
  }, [])

  return (
    <div
      ref={ref}
      className={`inline-block ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}
