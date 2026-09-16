'use client'

import { useRef, useCallback } from 'react'
import { gsap } from '@/lib/gsap-config'

interface GlassButtonProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  onClick?: () => void
  className?: string
}

const sizeStyles = {
  sm: 'px-6 py-2.5 text-[13px]',
  md: 'px-9 py-3.5 text-sm',
  lg: 'px-12 py-4.5 text-base',
}

export default function GlassButton({
  children,
  variant = 'default',
  size = 'md',
  href,
  onClick,
  className = '',
}: GlassButtonProps) {
  const buttonRef = useRef<HTMLButtonElement & HTMLAnchorElement>(null)
  const shimmerRef = useRef<HTMLDivElement>(null)

  const baseClasses = `relative overflow-hidden rounded-full font-body font-medium tracking-wide transition-none cursor-pointer inline-flex items-center justify-center ${sizeStyles[size]} ${className}`

  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      background: 'rgba(57, 62, 65, 0.15)',
      border: '1px solid rgba(57, 62, 65, 0.4)',
      backdropFilter: 'blur(12px)',
      color: '#E7E5DF',
    },
    primary: {
      background: 'rgba(211, 208, 203, 0.1)',
      border: '1px solid rgba(211, 208, 203, 0.15)',
      backdropFilter: 'blur(12px)',
      color: '#E7E5DF',
    },
    outline: {
      background: 'transparent',
      border: '1px solid rgba(57, 62, 65, 0.4)',
      color: '#E7E5DF',
    },
  }

  const handleMouseEnter = useCallback(() => {
    const btn = buttonRef.current
    const shimmer = shimmerRef.current
    if (!btn || !shimmer) return

    gsap.to(btn, { scale: 1.02, duration: 0.3, ease: 'power2.out', overwrite: true })

    if (variant === 'default') {
      gsap.to(btn, {
        background: 'rgba(57, 62, 65, 0.3)',
        borderColor: 'rgba(211, 208, 203, 0.2)',
        duration: 0.3,
      })
    } else if (variant === 'primary') {
      gsap.to(btn, {
        background: 'rgba(211, 208, 203, 0.18)',
        duration: 0.3,
      })
    }

    gsap.fromTo(shimmer,
      { x: '-100%', opacity: 1 },
      { x: '200%', opacity: 0, duration: 0.6, ease: 'power2.inOut' }
    )
  }, [variant])

  const handleMouseLeave = useCallback(() => {
    const btn = buttonRef.current
    if (!btn) return

    gsap.to(btn, {
      scale: 1, x: 0, y: 0,
      background: variantStyles[variant].background,
      borderColor: undefined,
      duration: 0.3, ease: 'power2.out', overwrite: true,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const btn = buttonRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const distX = e.clientX - centerX
    const distY = e.clientY - centerY
    const distance = Math.sqrt(distX * distX + distY * distY)
    const maxDistance = 100
    const maxShift = 8
    if (distance < maxDistance) {
      const factor = (1 - distance / maxDistance) * maxShift
      gsap.to(btn, { x: (distX / distance) * factor, y: (distY / distance) * factor, duration: 0.2, overwrite: true })
    }
  }, [])

  const Tag = href ? 'a' : 'button'
  const linkProps = href ? { href } : {}

  return (
    <Tag
      ref={buttonRef as never}
      className={baseClasses}
      style={variantStyles[variant]}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      data-cursor="magnetic"
      {...linkProps}
    >
      <div ref={shimmerRef} className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(227,229,223,0.05), transparent)', transform: 'translateX(-100%)' }} />
      <span className="relative z-10" style={{ color: '#E7E5DF' }}>{children}</span>
    </Tag>
  )
}
