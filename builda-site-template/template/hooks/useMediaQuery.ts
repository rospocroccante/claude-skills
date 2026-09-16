'use client'

import { useEffect, useRef } from 'react'
import { useStore } from '@/lib/store'

export function useMediaQuery() {
  const setMobile = useStore((s) => s.setMobile)
  const isMobile = useStore((s) => s.isMobile)
  const reducedMotionRef = useRef(false)

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)')

    function handleChange(e: MediaQueryListEvent | MediaQueryList) {
      setMobile(e.matches)
    }

    handleChange(mql)
    mql.addEventListener('change', handleChange)

    return () => {
      mql.removeEventListener('change', handleChange)
    }
  }, [setMobile])

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotionRef.current = mql.matches

    function handleChange(e: MediaQueryListEvent) {
      reducedMotionRef.current = e.matches
    }

    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [])

  return { isMobile, reducedMotion: reducedMotionRef }
}
