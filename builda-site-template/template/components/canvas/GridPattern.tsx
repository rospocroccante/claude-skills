'use client'

import { useEffect, useRef } from 'react'
import { useStore } from '@/lib/store'

const SPACING_DESKTOP = 40
const SPACING_MOBILE = 50
const DOT_RADIUS = 1.5
const DOT_COLOR = [57, 62, 65] // #393E41
const DOT_OPACITY = 0.25
const SPECIAL_INTERVAL = 5 // every 5th row/col
const SPECIAL_RADIUS = 2.5
const SPECIAL_OPACITY = 0.35
const RIPPLE_RADIUS = 200
const RIPPLE_MAX_DISPLACEMENT = 8
const LERP_FACTOR = 0.06
const SCROLL_WAVE_HEIGHT = 200
const LINE_OPACITY = 0.08
const LINE_WIDTH = 0.5

interface DotState {
  baseX: number
  baseY: number
  currentX: number
  currentY: number
  isSpecial: boolean
  row: number
  col: number
}

export default function GridPattern() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const isMobile = useStore.getState().isMobile
    const spacing = isMobile ? SPACING_MOBILE : SPACING_DESKTOP
    const margin = 100

    let width = window.innerWidth
    let height = window.innerHeight
    let dpr = Math.min(window.devicePixelRatio, 2)
    let dots: DotState[] = []
    let mouseX = -1000
    let mouseY = -1000
    let rafId: number

    function resize() {
      width = window.innerWidth
      height = window.innerHeight
      dpr = Math.min(window.devicePixelRatio, 2)
      canvas!.width = width * dpr
      canvas!.height = height * dpr
      canvas!.style.width = `${width}px`
      canvas!.style.height = `${height}px`
      ctx!.scale(dpr, dpr)
      buildGrid()
    }

    function buildGrid() {
      dots = []
      const cols = Math.ceil((width + margin * 2) / spacing)
      const rows = Math.ceil((height + margin * 2) / spacing)
      const offsetX = -margin
      const offsetY = -margin

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = offsetX + c * spacing
          const y = offsetY + r * spacing
          const isSpecial = r % SPECIAL_INTERVAL === 0 && c % SPECIAL_INTERVAL === 0
          dots.push({
            baseX: x,
            baseY: y,
            currentX: x,
            currentY: y,
            isSpecial,
            row: r,
            col: c,
          })
        }
      }
    }

    function handleMouseMove(e: MouseEvent) {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    function handleMouseLeave() {
      mouseX = -1000
      mouseY = -1000
    }

    function draw() {
      const state = useStore.getState()
      const scrollProgress = state.scrollProgress
      const isMobileNow = state.isMobile

      // Scroll parallax offset
      const scrollOffset = scrollProgress * height * 0.3

      ctx!.clearRect(0, 0, width, height)

      // Scroll wave position (Y center of the illuminated band)
      const waveCenter = scrollProgress * (height + SCROLL_WAVE_HEIGHT)

      // Draw secondary grid lines first (behind dots)
      ctx!.strokeStyle = `rgba(${DOT_COLOR.join(',')}, ${LINE_OPACITY})`
      ctx!.lineWidth = LINE_WIDTH
      const specialSpacing = spacing * SPECIAL_INTERVAL

      // Vertical lines
      const startCol = Math.floor((-margin) / specialSpacing)
      const endCol = Math.ceil((width + margin) / specialSpacing)
      for (let c = startCol; c <= endCol; c++) {
        const x = c * specialSpacing
        ctx!.beginPath()
        ctx!.moveTo(x, 0)
        ctx!.lineTo(x, height)
        ctx!.stroke()
      }

      // Horizontal lines (with scroll offset)
      const startRow = Math.floor((-margin - scrollOffset) / specialSpacing)
      const endRow = Math.ceil((height + margin - scrollOffset) / specialSpacing)
      for (let r = startRow; r <= endRow; r++) {
        const y = r * specialSpacing + (scrollOffset % specialSpacing)
        ctx!.beginPath()
        ctx!.moveTo(0, y)
        ctx!.lineTo(width, y)
        ctx!.stroke()
      }

      // Update and draw dots
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i]
        const scrolledY = dot.baseY + (scrollOffset % spacing)

        // Wrap vertically
        let targetX = dot.baseX
        let targetY = ((scrolledY % (height + margin * 2)) + (height + margin * 2)) % (height + margin * 2) - margin

        // Mouse ripple (desktop only)
        if (!isMobileNow && mouseX > -500) {
          const dx = targetX - mouseX
          const dy = targetY - mouseY
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < RIPPLE_RADIUS && dist > 0) {
            const force = (1 - dist / RIPPLE_RADIUS) * RIPPLE_MAX_DISPLACEMENT
            const nx = dx / dist
            const ny = dy / dist
            targetX += nx * force
            targetY += ny * force
          }
        }

        // Lerp to target
        dot.currentX += (targetX - dot.currentX) * LERP_FACTOR
        dot.currentY += (targetY - dot.currentY) * LERP_FACTOR

        // Scroll wave illumination
        const distToWave = Math.abs(dot.currentY - waveCenter)
        const isIlluminated = distToWave < SCROLL_WAVE_HEIGHT / 2
        const waveIntensity = isIlluminated
          ? 1 - distToWave / (SCROLL_WAVE_HEIGHT / 2)
          : 0

        // Determine dot properties
        let radius = dot.isSpecial ? SPECIAL_RADIUS : DOT_RADIUS
        let opacity = dot.isSpecial ? SPECIAL_OPACITY : DOT_OPACITY

        if (waveIntensity > 0) {
          radius += (2.5 - radius) * waveIntensity * 0.5
          opacity = opacity + (0.5 - opacity) * waveIntensity
        }

        // Skip dots outside viewport (with padding)
        if (
          dot.currentX < -margin ||
          dot.currentX > width + margin ||
          dot.currentY < -margin ||
          dot.currentY > height + margin
        ) {
          continue
        }

        // Draw dot
        const colorR = waveIntensity > 0.3 ? 211 : DOT_COLOR[0]
        const colorG = waveIntensity > 0.3 ? 208 : DOT_COLOR[1]
        const colorB = waveIntensity > 0.3 ? 203 : DOT_COLOR[2]

        ctx!.beginPath()
        ctx!.arc(dot.currentX, dot.currentY, radius, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${colorR}, ${colorG}, ${colorB}, ${opacity})`
        ctx!.fill()
      }

      rafId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)
    rafId = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  )
}
