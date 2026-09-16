'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap-config'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const posRef = useRef({ x: 0, y: 0 })
  const ringPosRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    // Skip on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return

    const dot = dotRef.current
    const ring = ringRef.current
    const text = textRef.current
    if (!dot || !ring || !text) return

    let rafId: number

    function onMouseMove(e: MouseEvent) {
      posRef.current = { x: e.clientX, y: e.clientY }
      // Dot follows instantly
      gsap.set(dot, { x: e.clientX, y: e.clientY })
    }

    // Ring follows with lerp
    function updateRing() {
      const { x: targetX, y: targetY } = posRef.current
      const current = ringPosRef.current
      current.x += (targetX - current.x) * 0.1
      current.y += (targetY - current.y) * 0.1
      gsap.set(ring, { x: current.x, y: current.y })
      rafId = requestAnimationFrame(updateRing)
    }
    rafId = requestAnimationFrame(updateRing)

    function onMouseEnterInteractive() {
      gsap.to(ring, {
        width: 80,
        height: 80,
        opacity: 0.5,
        duration: 0.3,
        overwrite: true,
      })
    }

    function onMouseLeaveInteractive() {
      gsap.to(ring, {
        width: 40,
        height: 40,
        opacity: 1,
        duration: 0.3,
        overwrite: true,
      })
      text!.style.opacity = '0'
    }

    function onMouseEnterView() {
      gsap.to(ring, {
        width: 80,
        height: 80,
        opacity: 0.6,
        duration: 0.3,
        overwrite: true,
      })
      text!.style.opacity = '1'
    }

    function onMouseLeaveView() {
      gsap.to(ring, {
        width: 40,
        height: 40,
        opacity: 1,
        duration: 0.3,
        overwrite: true,
      })
      text!.style.opacity = '0'
    }

    window.addEventListener('mousemove', onMouseMove)

    // Observe interactive elements
    const observer = new MutationObserver(() => attachListeners())

    function attachListeners() {
      document
        .querySelectorAll('a, button, [data-cursor="pointer"]')
        .forEach((el) => {
          el.addEventListener('mouseenter', onMouseEnterInteractive)
          el.addEventListener('mouseleave', onMouseLeaveInteractive)
        })

      document
        .querySelectorAll('[data-cursor="view"]')
        .forEach((el) => {
          el.addEventListener('mouseenter', onMouseEnterView)
          el.addEventListener('mouseleave', onMouseLeaveView)
        })
    }

    attachListeners()
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMouseMove)
      observer.disconnect()
    }
  }, [])

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-[6px] h-[6px] bg-white rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{ mixBlendMode: 'difference' }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-[40px] h-[40px] rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 hidden md:block flex items-center justify-center"
        style={{
          border: '1px solid rgba(255, 255, 255, 0.3)',
        }}
      >
        <span
          ref={textRef}
          className="text-[10px] font-mono text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 uppercase tracking-wider"
          style={{ opacity: 0, transition: 'opacity 0.2s' }}
        >
          View
        </span>
      </div>
    </>
  )
}
