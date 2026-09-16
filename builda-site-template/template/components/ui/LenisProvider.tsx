'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { ScrollTrigger } from '@/lib/gsap-config'

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 0, // disable smooth on touch for native UX
    })

    lenisRef.current = lenis

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return <>{children}</>
}
