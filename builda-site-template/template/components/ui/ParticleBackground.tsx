'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  radius: number
  baseSpeed: number
  speedX: number
  speedY: number
  opacity: number
  color: string
  depth: number // 0-1, affects parallax and blur
  phase: number // for sinusoidal oscillation
  oscillationAmplitude: number
  oscillationSpeed: number
}

const PARTICLE_COLORS = [
  '99, 102, 241',   // indigo
  '139, 92, 246',   // violet
  '129, 140, 248',  // light indigo
  '167, 139, 250',  // light violet
  '255, 255, 255',  // white
]

function createParticle(canvasWidth: number, canvasHeight: number): Particle {
  const depth = Math.random() // 0 = far (big, slow, blurry), 1 = near (small, fast, sharp)
  const radius = depth < 0.3
    ? 40 + Math.random() * 80   // big particles (far)
    : depth < 0.7
      ? 10 + Math.random() * 30  // medium
      : 2 + Math.random() * 10   // small (near)

  const baseSpeed = 0.1 + Math.random() * 0.3
  const colorIndex = Math.floor(Math.random() * PARTICLE_COLORS.length)
  const opacity = 0.03 + Math.random() * 0.09

  return {
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    radius,
    baseSpeed,
    speedX: baseSpeed * (0.3 + Math.random() * 0.7), // diagonal: bottom-left to top-right
    speedY: -baseSpeed * (0.5 + Math.random() * 0.5),
    opacity,
    color: PARTICLE_COLORS[colorIndex],
    depth,
    phase: Math.random() * Math.PI * 2,
    oscillationAmplitude: 0.3 + Math.random() * 0.7,
    oscillationSpeed: 0.005 + Math.random() * 0.01,
  }
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scrollRef = useRef(0)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const PARTICLE_COUNT = 70
    const TARGET_FPS = 60
    const FRAME_TIME = 1000 / TARGET_FPS

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx!.scale(dpr, dpr)
    }

    resize()

    // Initialize particles
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () =>
      createParticle(window.innerWidth, window.innerHeight)
    )

    // Track scroll
    function onScroll() {
      scrollRef.current = window.scrollY
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius)
      gradient.addColorStop(0, `rgba(${p.color}, ${p.opacity})`)
      gradient.addColorStop(0.4, `rgba(${p.color}, ${p.opacity * 0.6})`)
      gradient.addColorStop(1, `rgba(${p.color}, 0)`)

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()
    }

    function animate(time: number) {
      if (!ctx || !canvas) return

      // Frame rate limiting
      const delta = time - lastTimeRef.current
      if (delta < FRAME_TIME) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }
      lastTimeRef.current = time

      const w = window.innerWidth
      const h = window.innerHeight
      const scroll = scrollRef.current

      ctx.clearRect(0, 0, w, h)

      for (const p of particlesRef.current) {
        // Update position with sinusoidal oscillation
        p.phase += p.oscillationSpeed
        const oscillation = Math.sin(p.phase) * p.oscillationAmplitude

        p.x += p.speedX + oscillation
        p.y += p.speedY

        // Parallax: far particles (depth < 0.3) move slower with scroll
        const parallaxFactor = 1 - p.depth * 0.8
        const scrollOffset = scroll * parallaxFactor * 0.05

        // Recycle particles that exit viewport
        if (p.y + p.radius < -100 - scrollOffset) {
          p.y = h + p.radius + 50
          p.x = Math.random() * w
        }
        if (p.x - p.radius > w + 100) {
          p.x = -p.radius - 50
          p.y = Math.random() * h
        }
        if (p.x + p.radius < -100) {
          p.x = w + p.radius + 50
          p.y = Math.random() * h
        }

        // Draw with parallax offset
        const drawY = p.y - scrollOffset
        const originalY = p.y
        p.y = drawY
        drawParticle(ctx, p)
        p.y = originalY
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      {/* Diagonal gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #2a2a2e 0%, #0d0d0f 100%)',
        }}
      />

      {/* Noise/grain overlay via SVG filter */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.035 }}>
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>

      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ mixBlendMode: 'screen' }}
      />
    </div>
  )
}
