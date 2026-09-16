'use client'

import { useEffect } from 'react'
import { useStore } from '@/lib/store'

export function useMouse() {
  const setMouse = useStore((s) => s.setMouse)

  useEffect(() => {
    let rafId: number
    let mx = 0
    let my = 0
    let dirty = false

    function onMouseMove(e: MouseEvent) {
      mx = e.clientX
      my = e.clientY
      dirty = true
    }

    function update() {
      if (dirty) {
        setMouse(mx, my)
        dirty = false
      }
      rafId = requestAnimationFrame(update)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    rafId = requestAnimationFrame(update)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [setMouse])
}
