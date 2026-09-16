'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { useStore } from '@/lib/store'
import { gsap, ScrollTrigger } from '@/lib/gsap-config'

export function useScrollProgress() {
  const lenisRef = useRef<Lenis | null>(null)
  const setScrollProgress = useStore((s) => s.setScrollProgress)
  const setScrollVelocity = useStore((s) => s.setScrollVelocity)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    })

    lenisRef.current = lenis

    lenis.on('scroll', (e: { scroll: number; limit: number; velocity: number }) => {
      const progress = e.limit > 0 ? e.scroll / e.limit : 0
      setScrollProgress(Math.max(0, Math.min(1, progress)))
      setScrollVelocity(e.velocity)
      ScrollTrigger.update()
    })

    // Use GSAP ticker for better synchronization with ScrollTrigger
    const rafCallback = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(rafCallback)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(rafCallback)
      lenis.destroy()
    }
  }, [setScrollProgress, setScrollVelocity])

  return lenisRef
}
