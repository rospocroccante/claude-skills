'use client'

import { useEffect, useRef } from 'react'
import { useStore } from '@/lib/store'
import type { CursorState } from '@/lib/store'

function noise2D(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return (n - Math.floor(n)) * 2 - 1
}

function smoothNoise2D(x: number, y: number): number {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy
  const sx = fx * fx * (3 - 2 * fx)
  const sy = fy * fy * (3 - 2 * fy)
  const n00 = noise2D(ix, iy)
  const n10 = noise2D(ix + 1, iy)
  const n01 = noise2D(ix, iy + 1)
  const n11 = noise2D(ix + 1, iy + 1)
  const nx0 = n00 + (n10 - n00) * sx
  const nx1 = n01 + (n11 - n01) * sx
  return nx0 + (nx1 - nx0) * sy
}

interface StateConfig { radius: number; noiseAmp: number; opacity: number }

const STATE_CONFIGS: Record<CursorState, StateConfig> = {
  default:  { radius: 10, noiseAmp: 2, opacity: 0.7 },
  hover:    { radius: 30, noiseAmp: 5, opacity: 0.4 },
  text:     { radius: 1,  noiseAmp: 0, opacity: 0.5 },
  drag:     { radius: 12, noiseAmp: 3, opacity: 0.6 },
  explore:  { radius: 15, noiseAmp: 4, opacity: 0.6 },
  magnetic: { radius: 10, noiseAmp: 2, opacity: 0.7 },
}

const TRAIL_OPACITIES = [0.25, 0.15, 0.10, 0.06, 0.03, 0.01]
const TRAIL_SCALES = [0.85, 0.7, 0.55, 0.4, 0.3, 0.2]
const NUM_CONTROL_POINTS = 10
const CANVAS_SIZE = 80

// Chalk color for cursor: #E7E5DF → rgb(231, 229, 223)
const CURSOR_COLOR = '231, 229, 223'

function drawShape(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  radius: number, noiseAmp: number,
  time: number, opacity: number,
  state: CursorState, scrollVelocity: number
) {
  if (state === 'text') {
    const lineHeight = 20
    ctx.fillStyle = `rgba(${CURSOR_COLOR}, ${opacity})`
    ctx.fillRect(cx - 0.5, cy - lineHeight / 2, 1, lineHeight)
    return
  }

  const coords: Array<{ x: number; y: number }> = []
  for (let i = 0; i < NUM_CONTROL_POINTS; i++) {
    const angle = (i / NUM_CONTROL_POINTS) * Math.PI * 2
    const n = smoothNoise2D(Math.cos(angle) + time, Math.sin(angle) + time) * noiseAmp
    let r = radius + n
    if (state === 'drag') {
      const verticalFactor = Math.abs(Math.sin(angle))
      const stretch = Math.min(Math.abs(scrollVelocity) * 0.5, 15)
      r += verticalFactor * stretch
    }
    coords.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r })
  }

  ctx.beginPath()
  const lastPt = coords[coords.length - 1]
  const firstPt = coords[0]
  ctx.moveTo((lastPt.x + firstPt.x) / 2, (lastPt.y + firstPt.y) / 2)
  for (let i = 0; i < coords.length; i++) {
    const curr = coords[i]
    const next = coords[(i + 1) % coords.length]
    ctx.quadraticCurveTo(curr.x, curr.y, (curr.x + next.x) / 2, (curr.y + next.y) / 2)
  }
  ctx.closePath()
  ctx.fillStyle = `rgba(${CURSOR_COLOR}, ${opacity})`
  ctx.fill()
}

export default function CursorEntity() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (!canvasRef.current) return
    const canvas = canvasRef.current as HTMLCanvasElement
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio, 2)
    canvas.width = CANVAS_SIZE * dpr
    canvas.height = CANVAS_SIZE * dpr
    ctx.scale(dpr, dpr)

    let cx = 0, cy = 0, time = 0
    let currentRadius = 10, currentNoiseAmp = 2, currentOpacity = 0.7
    let trail: Array<{ x: number; y: number }> = []
    let magnetTarget: { x: number; y: number } | null = null
    let rafId: number

    function handleMouseOver(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target || !target.closest) return
      const cursorEl = target.closest('[data-cursor]')
      if (cursorEl) {
        const cursorAttr = cursorEl.getAttribute('data-cursor') as CursorState
        if (cursorAttr && cursorAttr in STATE_CONFIGS) {
          useStore.getState().setCursorState(cursorAttr)
          if (cursorAttr === 'magnetic') {
            const rect = (cursorEl as HTMLElement).getBoundingClientRect()
            magnetTarget = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
          }
          return
        }
      }
      const tag = target.tagName?.toLowerCase()
      if (tag === 'a' || tag === 'button') {
        useStore.getState().setCursorState('hover')
        magnetTarget = null
      } else if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span'].includes(tag) && target.textContent?.trim()) {
        useStore.getState().setCursorState('text')
        magnetTarget = null
      } else {
        useStore.getState().setCursorState('default')
        magnetTarget = null
      }
    }

    document.addEventListener('mouseover', handleMouseOver, { passive: true })

    const observer = new MutationObserver(() => {})
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-cursor'] })

    function animate() {
      const state = useStore.getState()
      const { mouse, cursorState, scrollVelocity } = state
      time += 0.03

      let effectiveState = cursorState
      if (Math.abs(scrollVelocity) > 2) effectiveState = 'drag'

      const config = STATE_CONFIGS[effectiveState]
      currentRadius += (config.radius - currentRadius) * 0.1
      currentNoiseAmp += (config.noiseAmp - currentNoiseAmp) * 0.1
      currentOpacity += (config.opacity - currentOpacity) * 0.1

      let tx = mouse.x, ty = mouse.y
      if (effectiveState === 'magnetic' && magnetTarget) {
        tx = tx + (magnetTarget.x - tx) * 0.5
        ty = ty + (magnetTarget.y - ty) * 0.5
      }

      cx += (tx - cx) * 0.15
      cy += (ty - cy) * 0.15
      trail.unshift({ x: cx, y: cy })
      if (trail.length > 7) trail.pop()

      canvas!.style.left = `${cx - CANVAS_SIZE / 2}px`
      canvas!.style.top = `${cy - CANVAS_SIZE / 2}px`

      ctx!.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

      for (let t = Math.min(trail.length - 1, 6); t >= 1; t--) {
        const tp = trail[t]
        const dx = tp.x - cx, dy = tp.y - cy
        drawShape(ctx!, CANVAS_SIZE / 2 + dx * 0.3, CANVAS_SIZE / 2 + dy * 0.3,
          currentRadius * TRAIL_SCALES[t - 1], currentNoiseAmp * 0.5,
          time - t * 0.1, TRAIL_OPACITIES[t - 1], effectiveState, scrollVelocity)
      }

      drawShape(ctx!, CANVAS_SIZE / 2, CANVAS_SIZE / 2,
        currentRadius, currentNoiseAmp, time, currentOpacity, effectiveState, scrollVelocity)

      if (effectiveState === 'explore') {
        for (let i = 0; i < 4; i++) {
          const angle = time * 2 + i * Math.PI * 0.5
          const ox = CANVAS_SIZE / 2 + Math.cos(angle) * (currentRadius + 8)
          const oy = CANVAS_SIZE / 2 + Math.sin(angle) * (currentRadius + 8)
          ctx!.beginPath()
          ctx!.arc(ox, oy, 2, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(${CURSOR_COLOR}, 0.5)`
          ctx!.fill()
        }
      }

      rafId = requestAnimationFrame(animate)
    }

    rafId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafId)
      document.removeEventListener('mouseover', handleMouseOver)
      observer.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed z-50 pointer-events-none"
      style={{ width: CANVAS_SIZE, height: CANVAS_SIZE, mixBlendMode: 'difference' }}
    />
  )
}
