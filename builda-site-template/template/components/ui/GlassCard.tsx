'use client'

import { useRef, useCallback } from 'react'
import { gsap } from '@/lib/gsap-config'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
}

export default function GlassCard({ children, className = '' }: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = useCallback(() => {
    const card = cardRef.current
    if (!card) return
    gsap.to(card, {
      borderColor: 'rgba(57, 62, 65, 0.6)',
      duration: 0.3,
      overwrite: true,
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current
    if (!card) return
    gsap.to(card, {
      borderColor: 'rgba(57, 62, 65, 0.3)',
      duration: 0.3,
      overwrite: true,
    })
  }, [])

  return (
    <div
      ref={cardRef}
      className={`rounded-2xl ${className}`}
      style={{
        border: '1px solid rgba(57, 62, 65, 0.3)',
        background: 'rgba(30, 34, 36, 0.6)',
        backdropFilter: 'blur(8px)',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}
