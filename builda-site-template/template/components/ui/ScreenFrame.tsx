'use client'

import { useRef, useEffect } from 'react'
import { gsap } from '@/lib/gsap-config'
import Image from 'next/image'

interface ScreenFrameProps {
  title: string
  category: string
  imageSrc?: string
  aspectRatio?: '16/9' | '4/3' | '9/16'
  variant?: 'browser' | 'device' | 'minimal'
  isActive: boolean
  parallaxSpeed?: number
  className?: string
  style?: React.CSSProperties
}

export default function ScreenFrame({
  title,
  category,
  imageSrc,
  aspectRatio = '16/9',
  variant = 'browser',
  isActive,
  className = '',
  style,
}: ScreenFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const prevActive = useRef(false)

  useEffect(() => {
    if (!frameRef.current) return

    if (isActive && !prevActive.current) {
      // Enter animation
      gsap.fromTo(
        frameRef.current,
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out',
        }
      )
    } else if (!isActive && prevActive.current) {
      gsap.to(frameRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.4,
        ease: 'power2.in',
      })
    }

    prevActive.current = isActive
  }, [isActive])

  const borderRadius =
    variant === 'device' ? 16 : variant === 'minimal' ? 8 : 12

  return (
    <div
      ref={frameRef}
      className={`transition-all duration-400 ${className}`}
      style={{
        borderRadius,
        border:
          variant === 'device'
            ? '2px solid #393E41'
            : `1px solid ${variant === 'minimal' ? 'rgba(57,62,65,0.4)' : '#393E41'}`,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        opacity: isActive ? 1 : 0,
        ...style,
      }}
    >
      {/* Browser bar (only for browser variant) */}
      {variant === 'browser' && (
        <div
          style={{
            height: 32,
            background: '#1E2224',
            borderBottom: '1px solid rgba(57,62,65,0.3)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            position: 'relative',
          }}
        >
          {/* Traffic light dots */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#393E41',
              }}
            />
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#393E41',
              }}
            />
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#393E41',
              }}
            />
          </div>
          {/* Title in center */}
          <span
            className="font-mono"
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 10,
              color: 'rgba(211,208,203,0.5)',
            }}
          >
            {title}
          </span>
        </div>
      )}

      {/* Device padding */}
      {variant === 'device' && (
        <div style={{ padding: 4 }}>
          <ContentArea
            imageSrc={imageSrc}
            title={title}
            category={category}
            aspectRatio={aspectRatio}
          />
        </div>
      )}

      {/* Content area */}
      {variant !== 'device' && (
        <ContentArea
          imageSrc={imageSrc}
          title={title}
          category={category}
          aspectRatio={aspectRatio}
        />
      )}
    </div>
  )
}

function ContentArea({
  imageSrc,
  title,
  category,
  aspectRatio,
}: {
  imageSrc?: string
  title: string
  category: string
  aspectRatio: string
}) {
  if (imageSrc) {
    return (
      <div style={{ aspectRatio, position: 'relative', overflow: 'hidden' }}>
        <Image
          src={imageSrc}
          alt={title}
          fill
          style={{ objectFit: 'cover' }}
        />
      </div>
    )
  }

  // Placeholder
  return (
    <div
      style={{
        aspectRatio,
        background: 'linear-gradient(135deg, #1E2224, #252829)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Diagonal line pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 10px,
            rgba(57,62,65,0.05) 10px,
            rgba(57,62,65,0.05) 11px
          )`,
        }}
      />
      <span
        className="font-mono"
        style={{ fontSize: 14, color: 'rgba(57,62,65,0.3)', zIndex: 1 }}
      >
        Screenshot
      </span>
      <span
        className="font-mono"
        style={{
          fontSize: 10,
          color: 'rgba(57,62,65,0.2)',
          marginTop: 4,
          zIndex: 1,
        }}
      >
        {category}
      </span>
    </div>
  )
}
