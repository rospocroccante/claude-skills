'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap } from '@/lib/gsap-config'

interface LoadingRitualProps {
  onComplete: () => void
}

interface Particle {
  x: number
  y: number
  targetX: number
  targetY: number
  originX: number
  originY: number
  size: number
  color: string
  alpha: number
  // Dispersion velocity
  vx: number
  vy: number
}

// Animation phases
const PHASE_SCATTER = 0    // Particles are scattered randomly
const PHASE_CONVERGE = 1   // Particles move toward text positions
const PHASE_HOLD = 2       // Text is formed, hold in place
const PHASE_DISPERSE = 3   // Particles explode outward and fade
const PHASE_FADEOUT = 4    // Container fades away

const PARTICLE_COUNT = 2500
const STONE = '#D3D0CB'
const CHALK = '#E7E5DF'
const BG_COLOR = '#1E2224'

export default function LoadingRitual({ onComplete }: LoadingRitualProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [done, setDone] = useState(false)
  const animationRef = useRef<number | null>(null)
  const phaseRef = useRef(PHASE_SCATTER)
  const phaseTimeRef = useRef(0)

  const sampleTextPositions = useCallback((
    canvas: HTMLCanvasElement,
    text: string,
    count: number
  ): Array<{ x: number; y: number }> => {
    const offscreen = document.createElement('canvas')
    const w = canvas.width
    const h = canvas.height
    offscreen.width = w
    offscreen.height = h
    const ctx = offscreen.getContext('2d')
    if (!ctx) return []

    // Use a large bold sans-serif font to sample the text
    const fontSize = Math.min(w * 0.13, h * 0.25)
    ctx.fillStyle = '#ffffff'
    ctx.font = `900 ${fontSize}px "Syne", "Inter", "Helvetica Neue", Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    // Add letter spacing by drawing each character manually
    const letterSpacing = fontSize * 0.12
    const chars = text.split('')
    const totalWidth = chars.reduce((sum, char) => {
      return sum + ctx.measureText(char).width + letterSpacing
    }, -letterSpacing) // subtract last spacing

    let xPos = (w - totalWidth) / 2
    const yPos = h / 2
    for (const char of chars) {
      const charWidth = ctx.measureText(char).width
      ctx.fillText(char, xPos + charWidth / 2, yPos)
      xPos += charWidth + letterSpacing
    }

    // Read pixel data and collect positions where text is drawn
    const imageData = ctx.getImageData(0, 0, w, h)
    const pixels = imageData.data
    const textPositions: Array<{ x: number; y: number }> = []

    // Sample every few pixels for efficiency
    const step = 3
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const idx = (y * w + x) * 4
        // Check alpha channel - if text was drawn here
        if (pixels[idx + 3] > 128) {
          textPositions.push({ x, y })
        }
      }
    }

    if (textPositions.length === 0) return []

    // Randomly select `count` positions from the sampled text pixels
    const selected: Array<{ x: number; y: number }> = []
    for (let i = 0; i < count; i++) {
      const pos = textPositions[Math.floor(Math.random() * textPositions.length)]
      // Add slight jitter for organic feel
      selected.push({
        x: pos.x + (Math.random() - 0.5) * 2,
        y: pos.y + (Math.random() - 0.5) * 2,
      })
    }

    return selected
  }, [])

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas to full screen at device pixel ratio
    const dpr = window.devicePixelRatio || 1
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
    ctx.scale(dpr, dpr)

    const w = rect.width
    const h = rect.height

    // Sample text positions from an offscreen canvas (use CSS pixel dimensions)
    const sampleCanvas = document.createElement('canvas')
    sampleCanvas.width = w
    sampleCanvas.height = h
    const textPositions = sampleTextPositions(sampleCanvas, 'BUILDA', PARTICLE_COUNT)

    // Create particles
    const particles: Particle[] = []
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const target = textPositions[i] || { x: w / 2, y: h / 2 }
      // Random scatter positions across the full viewport
      const originX = Math.random() * w
      const originY = Math.random() * h
      // Dispersion velocity for the explosion phase
      const angle = Math.random() * Math.PI * 2
      const speed = 1.5 + Math.random() * 4

      particles.push({
        x: originX,
        y: originY,
        targetX: target.x,
        targetY: target.y,
        originX,
        originY,
        size: 1 + Math.random() * 2,
        color: Math.random() > 0.5 ? STONE : CHALK,
        alpha: 0.3 + Math.random() * 0.5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
      })
    }
    // Phase timing (in seconds)
    // Phase 0 (scatter):   0.0 - 0.4   particles visible, scattered
    // Phase 1 (converge):  0.4 - 2.0   particles converge to text
    // Phase 2 (hold):      2.0 - 2.8   text holds
    // Phase 3 (disperse):  2.8 - 3.8   particles explode and fade
    // Phase 4 (fadeout):   3.8 - 4.2   container fades out

    const PHASE_TIMES = [0.4, 1.6, 0.8, 1.0, 0.4]

    phaseRef.current = PHASE_SCATTER
    phaseTimeRef.current = 0

    let lastTime = performance.now()

    const animate = (now: number) => {
      const dt = (now - lastTime) / 1000
      lastTime = now

      phaseTimeRef.current += dt
      const phase = phaseRef.current
      const pt = phaseTimeRef.current
      const phaseDuration = PHASE_TIMES[phase]

      // Advance phase if time exceeded
      if (pt >= phaseDuration && phase < PHASE_FADEOUT) {
        phaseRef.current = phase + 1
        phaseTimeRef.current = 0

        // When entering disperse phase, set velocities from current position
        if (phaseRef.current === PHASE_DISPERSE) {
          for (const p of particles) {
            const dx = p.x - w / 2
            const dy = p.y - h / 2
            const dist = Math.sqrt(dx * dx + dy * dy) || 1
            const speed = 2 + Math.random() * 5
            p.vx = (dx / dist) * speed + (Math.random() - 0.5) * 3
            p.vy = (dy / dist) * speed + (Math.random() - 0.5) * 3
          }
        }

        // When entering fadeout phase, use GSAP to fade the container
        if (phaseRef.current === PHASE_FADEOUT) {
          gsap.to(container, {
            opacity: 0,
            duration: 0.4,
            ease: 'power2.inOut',
            onComplete: () => {
              if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
                animationRef.current = null
              }
              setDone(true)
              onComplete()
            },
          })
        }
      }

      const currentPhase = phaseRef.current
      const currentPt = phaseTimeRef.current
      const currentDuration = PHASE_TIMES[currentPhase]
      const progress = Math.min(currentPt / currentDuration, 1)

      // Clear canvas
      ctx.clearRect(0, 0, w, h)

      // Update and draw particles
      for (const p of particles) {
        if (currentPhase === PHASE_SCATTER) {
          // Particles are at their scattered positions, gently drifting
          // Ease in alpha from 0
          const fadeIn = Math.min(progress * 2, 1)
          p.alpha = (0.3 + Math.random() * 0.1) * fadeIn
          // Subtle drift
          p.x += (Math.random() - 0.5) * 0.3
          p.y += (Math.random() - 0.5) * 0.3
        } else if (currentPhase === PHASE_CONVERGE) {
          // Ease particles toward their target positions
          // Use a cubic ease-in-out for smooth convergence
          const t = progress
          const ease = t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2

          p.x = p.originX + (p.targetX - p.originX) * ease
          p.y = p.originY + (p.targetY - p.originY) * ease

          // Alpha increases as particles converge
          p.alpha = 0.3 + 0.7 * ease
        } else if (currentPhase === PHASE_HOLD) {
          // Particles are at text positions with subtle vibration
          p.x = p.targetX + (Math.random() - 0.5) * 0.5
          p.y = p.targetY + (Math.random() - 0.5) * 0.5
          p.alpha = 0.85 + Math.random() * 0.15
        } else if (currentPhase === PHASE_DISPERSE) {
          // Particles fly outward
          p.x += p.vx * 1.5
          p.y += p.vy * 1.5
          // Slow down slightly
          p.vx *= 0.985
          p.vy *= 0.985
          // Fade out
          p.alpha = Math.max(0, (1 - progress) * 0.9)
        } else {
          // PHASE_FADEOUT - continue drifting, nearly invisible
          p.x += p.vx * 0.5
          p.y += p.vy * 0.5
          p.alpha = Math.max(0, (1 - progress) * 0.3)
        }

        // Draw particle
        if (p.alpha > 0.01) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.globalAlpha = p.alpha
          ctx.fill()
        }
      }

      ctx.globalAlpha = 1

      // Continue animation unless we're done
      if (currentPhase <= PHASE_FADEOUT) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
  }, [onComplete, sampleTextPositions])

  if (done) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100]"
      style={{ background: BG_COLOR }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  )
}
