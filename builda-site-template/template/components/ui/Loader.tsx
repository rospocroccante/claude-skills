'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap-config'

export default function Loader({ onComplete }: { onComplete: () => void }) {
  const loaderRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const loader = loaderRef.current
    const logo = logoRef.current
    if (!loader || !logo) return

    const tl = gsap.timeline({
      onComplete: () => {
        setDone(true)
        onComplete()
      },
    })

    // Logo clip-path reveal from left to right
    tl.fromTo(
      logo,
      { clipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'power3.inOut' }
    )

    // Hold
    tl.to({}, { duration: 0.3 })

    // Slide loader up
    tl.to(loader, {
      y: '-100%',
      duration: 0.8,
      ease: 'power3.inOut',
    })

    return () => {
      tl.kill()
    }
  }, [onComplete])

  if (done) return null

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-carbon"
    >
      <div
        ref={logoRef}
        className="font-display font-extrabold text-4xl md:text-6xl"
        style={{
          background: 'linear-gradient(135deg, #6366f1, #a78bfa, #6366f1)',
          backgroundSize: '200% 200%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          clipPath: 'inset(0 100% 0 0)',
        }}
      >
        BUILDA
      </div>
    </div>
  )
}
