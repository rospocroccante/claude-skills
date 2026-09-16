# BUILDA Immersive Experience — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform BUILDA from a traditional website into a full-screen immersive 3D experience with scroll-driven camera navigation through 6 worlds on a single Three.js canvas.

**Architecture:** Single fixed `<Canvas>` (React Three Fiber) with all 6 worlds positioned at different Z depths. Scroll drives a camera along a CatmullRomCurve3. HTML text floats above the canvas as a transparent overlay. Zustand manages global state (scroll, mouse, cursor, world).

**Tech Stack:** Next.js 14, TypeScript, React Three Fiber, Drei, GSAP + ScrollTrigger, Lenis, Zustand, Tailwind CSS, custom GLSL shaders, Web Audio API.

**Design Doc:** `docs/plans/2026-02-19-immersive-experience-design.md`

---

## Phase 1: Foundation

### Task 1: Create branch and install dependencies

**Files:**
- Modify: `package.json`

**Step 1: Create the immersive branch**

```bash
git checkout -b immersive
```

**Step 2: Install zustand**

```bash
cd <project-root> && npm install zustand
```

**Step 3: Verify**

Run: `npm ls zustand`
Expected: zustand listed

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add zustand dependency for immersive experience"
```

---

### Task 2: Update Tailwind config with immersive color palette

**Files:**
- Modify: `tailwind.config.ts`

**Step 1: Update colors and add immersive palette**

Replace the colors in `tailwind.config.ts` theme.extend.colors:

```typescript
colors: {
  // Immersive palette
  void: '#07070a',
  ash: '#16161a',
  smoke: '#2a2a2e',
  mist: 'rgba(255, 255, 255, 0.06)',
  phantom: '#6366f1',
  glow: '#a78bfa',
  pulse: '#ec4899',
  // Keep legacy for transition
  anthracite: '#1a1a1d',
  carbon: '#0d0d0f',
  glass: 'rgba(255, 255, 255, 0.04)',
  accent: '#6366f1',
},
```

**Step 2: Build to verify config**

Run: `npx next build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add tailwind.config.ts
git commit -m "feat: update Tailwind colors with immersive palette"
```

---

### Task 3: Update globals.css for immersive experience

**Files:**
- Modify: `app/globals.css`

**Step 1: Replace globals.css content**

Key changes:
- Hide scrollbar completely (Lenis handles scroll)
- Body uses `void` background
- `overflow: hidden` on html (Lenis manages scroll)
- Keep `::selection` with phantom color
- Keep `prefers-reduced-motion` support
- Remove any section-specific styles from old site

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-void: #07070a;
  --color-ash: #16161a;
  --color-smoke: #2a2a2e;
  --color-phantom: #6366f1;
  --color-glow: #a78bfa;
  --color-pulse: #ec4899;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  overflow: hidden;
}

body {
  background: var(--color-void);
  color: white;
  font-family: var(--font-inter), sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

::selection {
  background: rgba(99, 102, 241, 0.3);
}

/* Hide scrollbar completely - Lenis handles scroll */
::-webkit-scrollbar {
  display: none;
}

html {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Hide default cursor - CursorEntity replaces it */
@media (pointer: fine) {
  * {
    cursor: none !important;
  }
}

/* Reduced motion: disable all animations */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Step 2: Build to verify**

Run: `npx next build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: update globals.css for immersive experience"
```

---

### Task 4: Create Zustand store

**Files:**
- Create: `lib/store.ts`

**Step 1: Create the global store**

```typescript
'use client'

import { create } from 'zustand'

const WORLD_RANGES = [
  { min: 0.0, max: 0.12 },   // 0: Portal
  { min: 0.12, max: 0.30 },  // 1: Universe
  { min: 0.30, max: 0.52 },  // 2: Services
  { min: 0.52, max: 0.75 },  // 3: Projects
  { min: 0.75, max: 0.88 },  // 4: About
  { min: 0.88, max: 1.0 },   // 5: Contact
] as const

export const WORLD_NAMES = ['Portal', 'Universe', 'Services', 'Projects', 'DNA', 'Contact'] as const

function getActiveWorld(progress: number): number {
  for (let i = WORLD_RANGES.length - 1; i >= 0; i--) {
    if (progress >= WORLD_RANGES[i].min) return i
  }
  return 0
}

export type CursorState = 'default' | 'hover' | 'text' | 'drag' | 'explore' | 'magnetic'

interface BuildaStore {
  // Scroll
  scrollProgress: number
  scrollVelocity: number
  activeWorld: number
  setScrollProgress: (v: number) => void
  setScrollVelocity: (v: number) => void

  // Mouse
  mouse: { x: number; y: number }
  mouseNormalized: { x: number; y: number }
  setMouse: (x: number, y: number) => void

  // Cursor
  cursorState: CursorState
  setCursorState: (state: CursorState) => void

  // UI
  isLoaded: boolean
  isSoundOn: boolean
  isMobile: boolean
  setLoaded: (v: boolean) => void
  toggleSound: () => void
  setMobile: (v: boolean) => void

  // Active content
  activeService: number | null
  activeProject: number | null
  setActiveService: (i: number | null) => void
  setActiveProject: (i: number | null) => void
}

export const useStore = create<BuildaStore>((set) => ({
  // Scroll
  scrollProgress: 0,
  scrollVelocity: 0,
  activeWorld: 0,
  setScrollProgress: (v) => set({ scrollProgress: v, activeWorld: getActiveWorld(v) }),
  setScrollVelocity: (v) => set({ scrollVelocity: v }),

  // Mouse
  mouse: { x: 0, y: 0 },
  mouseNormalized: { x: 0, y: 0 },
  setMouse: (x, y) => {
    const nx = (x / window.innerWidth) * 2 - 1
    const ny = -(y / window.innerHeight) * 2 + 1
    set({ mouse: { x, y }, mouseNormalized: { x: nx, y: ny } })
  },

  // Cursor
  cursorState: 'default',
  setCursorState: (state) => set({ cursorState: state }),

  // UI
  isLoaded: false,
  isSoundOn: false,
  isMobile: false,
  setLoaded: (v) => set({ isLoaded: v }),
  toggleSound: () => set((s) => ({ isSoundOn: !s.isSoundOn })),
  setMobile: (v) => set({ isMobile: v }),

  // Active content
  activeService: null,
  activeProject: null,
  setActiveService: (i) => set({ activeService: i }),
  setActiveProject: (i) => set({ activeProject: i }),
}))

export { WORLD_RANGES }
```

**Step 2: Build to verify**

Run: `npx next build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add lib/store.ts
git commit -m "feat: create Zustand global store for immersive experience"
```

---

### Task 5: Create custom hooks

**Files:**
- Create: `hooks/useScrollProgress.ts`
- Create: `hooks/useMouse.ts`
- Create: `hooks/useLerpedValue.ts`
- Create: `hooks/useMediaQuery.ts`

**Step 1: Create useScrollProgress hook**

This integrates Lenis smooth scroll with the Zustand store.

```typescript
'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { useStore } from '@/lib/store'
import { ScrollTrigger } from '@/lib/gsap-config'

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

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [setScrollProgress, setScrollVelocity])

  return lenisRef
}
```

**Step 2: Create useMouse hook**

```typescript
'use client'

import { useEffect } from 'react'
import { useStore } from '@/lib/store'

export function useMouse() {
  const setMouse = useStore((s) => s.setMouse)

  useEffect(() => {
    let rafId: number
    let mx = 0
    let my = 0

    function onMouseMove(e: MouseEvent) {
      mx = e.clientX
      my = e.clientY
    }

    function update() {
      setMouse(mx, my)
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
```

**Step 3: Create useLerpedValue hook**

```typescript
'use client'

import { useRef, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'

export function useLerpedValue(target: number, factor = 0.08) {
  const ref = useRef(target)

  useFrame(() => {
    ref.current += (target - ref.current) * factor
  })

  return ref
}

// For use outside R3F canvas
export function useLerpedValueRAF(factor = 0.08) {
  const currentRef = useRef(0)
  const targetRef = useRef(0)

  const setTarget = useCallback((v: number) => {
    targetRef.current = v
  }, [])

  // Call this in your animation loop
  const update = useCallback(() => {
    currentRef.current += (targetRef.current - currentRef.current) * factor
    return currentRef.current
  }, [factor])

  return { current: currentRef, setTarget, update }
}
```

**Step 4: Create useMediaQuery hook**

```typescript
'use client'

import { useEffect } from 'react'
import { useStore } from '@/lib/store'

export function useMediaQuery() {
  const setMobile = useStore((s) => s.setMobile)

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

  const isMobile = useStore((s) => s.isMobile)
  const reducedMotion = useReducedMotion()

  return { isMobile, reducedMotion }
}

function useReducedMotion() {
  const ref = useRef(false)

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    ref.current = mql.matches

    function handleChange(e: MediaQueryListEvent) {
      ref.current = e.matches
    }

    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [])

  return ref
}
```

Note: `useMediaQuery` needs `useRef` imported — add `import { useEffect, useRef } from 'react'`.

**Step 5: Build to verify all hooks compile**

Run: `npx next build`
Expected: Build succeeds (hooks aren't used yet but must compile)

**Step 6: Commit**

```bash
git add hooks/
git commit -m "feat: create custom hooks (scroll, mouse, lerp, media query)"
```

---

## Phase 2: Canvas System

### Task 6: Create MainCanvas

**Files:**
- Create: `components/canvas/MainCanvas.tsx`

**Step 1: Create the global canvas component**

```typescript
'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useStore } from '@/lib/store'
import ShaderBackground from './ShaderBackground'
import ParticleField from './ParticleField'
import CameraRig from './CameraRig'

export default function MainCanvas() {
  const isMobile = useStore((s) => s.isMobile)

  return (
    <Canvas
      style={{ position: 'fixed', inset: 0, zIndex: 0 }}
      frameloop="always"
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ fov: 45, near: 0.1, far: 1000, position: [0, 0, 0] }}
    >
      <ShaderBackground />
      <ParticleField />
      <CameraRig />
      {/* Worlds will be added here as children in later tasks */}
      <Suspense fallback={null}>
        {/* World components go here */}
      </Suspense>
    </Canvas>
  )
}
```

**Step 2: Build to verify**

This requires ShaderBackground, ParticleField, CameraRig to exist — create stub files:

Create stub `components/canvas/ShaderBackground.tsx`:
```typescript
'use client'
export default function ShaderBackground() { return null }
```

Create stub `components/canvas/ParticleField.tsx`:
```typescript
'use client'
export default function ParticleField() { return null }
```

Create stub `components/canvas/CameraRig.tsx`:
```typescript
'use client'
export default function CameraRig() { return null }
```

Run: `npx next build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add components/canvas/
git commit -m "feat: create MainCanvas with stubs for shader, particles, camera"
```

---

### Task 7: Create ShaderBackground

**Files:**
- Modify: `components/canvas/ShaderBackground.tsx`

**Step 1: Implement the living shader background**

Replace the stub with the full implementation. Key elements:
- Fullscreen quad (PlaneGeometry 2x2 in NDC space, or use `<ScreenQuad>` from drei)
- Custom ShaderMaterial with:
  - Vertex: pass through UV coordinates
  - Fragment: diagonal gradient base + 3 simplex noise color blobs + film grain + vignette
- Uniforms: `uTime` (auto-increment), `uMouse` (from store), `uScroll` (from store)
- Include inline simplex noise 3D GLSL function

The fragment shader must:
1. Compute a diagonal gradient from ash to void
2. Add 3 blobs using `snoise(vec3(uv * scale + time * speed))` with different colors/opacities
3. Shift blob positions slightly toward mouse
4. Add per-frame random grain (use `fract(sin(dot(...)))` hash)
5. Apply vignette (distance from center)
6. Scroll subtly shifts overall hue

Use `useFrame` to update `uTime` uniform. Read `scrollProgress` and `mouseNormalized` from the store via `useStore.getState()` (non-reactive, in animation loop) to avoid re-renders.

The simplex noise GLSL should be the standard Ashima implementation (MIT licensed), inlined as a string in the shader code.

**Step 2: Build to verify**

Run: `npx next build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add components/canvas/ShaderBackground.tsx
git commit -m "feat: implement living shader background with noise blobs and grain"
```

---

### Task 8: Create ParticleField

**Files:**
- Modify: `components/canvas/ParticleField.tsx`

**Step 1: Implement the global particle field**

Replace the stub with the full implementation:

- Use `<Points>` from drei with custom `BufferGeometry`
- Generate 400 particles (120 on mobile) with random positions in a large 3D volume
- Custom attributes: `aSize` (random 1-8), `aSpeed` (random 0.5-1.5), `aOpacity` (random 0.05-0.2)
- Custom vertex shader:
  - Base position + diagonal drift (time * speed * direction)
  - Z-depth parallax (deeper particles move slower)
  - Sine oscillation on X and Y
  - `uScroll` drives parallax in opposite direction
  - `uMouse` creates repulsion force field (radius ~0.3 in normalized coords)
  - `gl_PointSize` scaled by `aSize` and perspective divide
- Custom fragment shader:
  - Soft circle: `smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5))`
  - Larger points = more blur (multiply smoothstep radius by aSize factor)
  - Color: white with hint of violet for larger particles
  - Alpha: `aOpacity * circle`
- Uniforms: `uTime`, `uScroll`, `uMouse` (vec2), `uIsMobile` (float, 0 or 1)
  - When `uIsMobile > 0.5`, skip mouse repulsion calculation
- Use `useFrame` to update uniforms from store

Positions should wrap/recycle when particles drift too far (modulo in shader or periodic reset).

**Step 2: Build to verify**

Run: `npx next build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add components/canvas/ParticleField.tsx
git commit -m "feat: implement global particle field with custom shaders"
```

---

### Task 9: Create CameraRig

**Files:**
- Modify: `components/canvas/CameraRig.tsx`

**Step 1: Implement the scroll-driven camera**

Replace the stub with:

```typescript
'use client'

import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '@/lib/store'

const CAMERA_POINTS = [
  new THREE.Vector3(0, 0, 5),       // Portal (camera starts slightly back)
  new THREE.Vector3(2, 1, -25),     // Universe
  new THREE.Vector3(-1, -0.5, -65), // Services
  new THREE.Vector3(0, 0, -115),    // Projects (centered for tunnel)
  new THREE.Vector3(3, 2, -165),    // About (elevated)
  new THREE.Vector3(0, 0, -205),    // Contact
]

// LookAt targets are slightly ahead of camera positions
const LOOKAT_POINTS = [
  new THREE.Vector3(0, 0, -5),
  new THREE.Vector3(1, 0.5, -35),
  new THREE.Vector3(-0.5, -0.3, -75),
  new THREE.Vector3(0, 0, -125),
  new THREE.Vector3(2, 1.5, -175),
  new THREE.Vector3(0, 0, -215),
]

export default function CameraRig() {
  const { camera } = useThree()
  const currentPos = useRef(new THREE.Vector3(0, 0, 5))
  const currentLookAt = useRef(new THREE.Vector3(0, 0, -5))
  const mouseRotation = useRef({ x: 0, y: 0 })

  const cameraCurve = useMemo(
    () => new THREE.CatmullRomCurve3(CAMERA_POINTS, false, 'catmullrom', 0.5),
    []
  )
  const lookAtCurve = useMemo(
    () => new THREE.CatmullRomCurve3(LOOKAT_POINTS, false, 'catmullrom', 0.5),
    []
  )

  useFrame(() => {
    const state = useStore.getState()
    const t = Math.max(0, Math.min(1, state.scrollProgress))
    const { mouseNormalized } = state

    // Target position on curve
    const targetPos = cameraCurve.getPointAt(t)
    const targetLookAt = lookAtCurve.getPointAt(Math.min(1, t + 0.02))

    // Lerp camera position
    currentPos.current.lerp(targetPos, 0.06)
    currentLookAt.current.lerp(targetLookAt, 0.06)

    camera.position.copy(currentPos.current)

    // Mouse influence on rotation (±3 degrees max)
    const maxAngle = THREE.MathUtils.degToRad(3)
    mouseRotation.current.x += (mouseNormalized.y * maxAngle - mouseRotation.current.x) * 0.03
    mouseRotation.current.y += (mouseNormalized.x * maxAngle - mouseRotation.current.y) * 0.03

    // Apply lookAt then add mouse rotation
    camera.lookAt(currentLookAt.current)
    camera.rotation.x += mouseRotation.current.x
    camera.rotation.y += mouseRotation.current.y
  })

  return null
}
```

**Step 2: Build to verify**

Run: `npx next build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add components/canvas/CameraRig.tsx
git commit -m "feat: implement scroll-driven CameraRig with curve path"
```

---

## Phase 3: Page Assembly

### Task 10: Rewrite page.tsx and layout.tsx

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`

**Step 1: Simplify layout.tsx**

The layout should only load fonts and provide metadata. No LenisProvider (scroll is handled in page), no CustomCursor (CursorEntity replaces it), no ParticleBackground (shader replaces it).

```typescript
import type { Metadata } from 'next'
import { Inter, Syne, Space_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
  weight: ['400', '700'],
})

export const metadata: Metadata = {
  title: 'BUILDA — We build the future.',
  description:
    'Digital products that merge intelligence with craft. From concept to scale. AI, Automation, SaaS, Software.',
  openGraph: {
    title: 'BUILDA — We build the future.',
    description:
      'Digital products that merge intelligence with craft. From concept to scale.',
    siteName: 'BUILDA',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable} ${spaceMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

**Step 2: Rewrite page.tsx as the immersive experience orchestrator**

```typescript
'use client'

import dynamic from 'next/dynamic'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import { useMouse } from '@/hooks/useMouse'
import { useMediaQuery } from '@/hooks/useMediaQuery'

const MainCanvas = dynamic(() => import('@/components/canvas/MainCanvas'), {
  ssr: false,
  loading: () => null,
})

export default function Home() {
  // Initialize global hooks
  useScrollProgress()
  useMouse()
  useMediaQuery()

  return (
    <>
      {/* Layer 1: Three.js Canvas (fixed, fullscreen) */}
      <MainCanvas />

      {/* Layer 2: DOM Overlay (fixed, pointer-events-none) */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        {/* World overlays, navigation, etc. will be added in later tasks */}
      </div>

      {/* Layer 3: Scroll Container (generates scroll events) */}
      <div style={{ height: '600vh' }} />

      {/* Layer 4: Cursor (added in later task) */}
      {/* Layer 5: Loading Ritual (added in later task) */}
    </>
  )
}
```

**Step 3: Build to verify**

Run: `npx next build`
Expected: Build succeeds. The page should show the shader background with particles when running dev server.

**Step 4: Commit**

```bash
git add app/layout.tsx app/page.tsx
git commit -m "feat: rewrite page/layout as immersive experience orchestrator"
```

---

### Task 11: Verify canvas renders

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Visual verification**

Open `http://localhost:3000` in browser. You should see:
- A dark gradient background (shader)
- Floating particles
- Scrolling moves the camera (view changes as you scroll)
- No errors in console

**Step 3: Fix any issues, then commit if fixes were needed**

---

## Phase 4: Loading & Cursor

### Task 12: Create LoadingRitual

**Files:**
- Create: `components/interface/LoadingRitual.tsx`
- Modify: `app/page.tsx` (add LoadingRitual)

**Step 1: Implement the loading ritual**

The loading ritual is a GSAP timeline sequence (~4 seconds):
1. Black screen (0.5s)
2. Thin horizontal line expands from center to full width (1.5s, power3.inOut)
3. Line splits — halves move up/down, revealing "BUILDA" text in gap
   - Text uses scramble/decrypt effect: each letter starts as random char, stabilizes to correct letter (use GSAP onUpdate to set textContent per span)
   - Font: Syne, weight 800, 8vw
4. Violet flash pulse (opacity flash on a full-screen overlay div)
5. Clip-path circle expands from center revealing the experience behind
6. Component unmounts, `store.setLoaded(true)` called

Implementation:
- Use `useRef` for DOM elements, GSAP timeline in useEffect with cleanup
- Scramble effect: create a `<span>` per letter of "BUILDA", in the timeline tween each span's textContent from random chars to the target letter using `onUpdate`
- The component is `position: fixed, inset: 0, z-index: 100`
- After complete, call `onComplete` prop and set `done` state to unmount

**Step 2: Add to page.tsx**

Add `<LoadingRitual />` as the last element in page.tsx (highest z-index). Pass `onComplete` that calls `useStore.getState().setLoaded(true)`.

**Step 3: Build to verify**

Run: `npx next build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add components/interface/LoadingRitual.tsx app/page.tsx
git commit -m "feat: implement LoadingRitual with scramble text effect"
```

---

### Task 13: Create CursorEntity

**Files:**
- Create: `components/interface/CursorEntity.tsx`
- Modify: `app/page.tsx` (add CursorEntity)

**Step 1: Implement the organic cursor entity**

Key implementation:
- Render only on non-touch devices (`pointer: fine` media query or check in useEffect)
- Use a `<canvas>` element (~80x80px) for drawing the organic shape
- 10 control points on a circle, each displaced radially by simplex noise (use a simple JS noise function — 2D is sufficient)
- Draw the shape as a closed bezier curve on the canvas each frame
- Follow mouse with lerp (factor 0.15)
- `mix-blend-mode: difference` on the canvas element
- Read `cursorState` from Zustand store to adjust size/behavior
- Trail: 6 copies of the shape with decreasing opacity, each following with increasing delay (store last 6 positions with timestamps)

States:
- `default`: radius 10, gentle noise amplitude (2-3px)
- `hover`: radius 30, higher noise amplitude (5-8px), lower opacity
- `text`: morph to thin vertical line (squash X, stretch Y)
- `drag`: elongate in scroll direction (read scrollVelocity from store)
- `explore`: radius 15, emit 4 small dots that orbit (track angles, draw small circles)
- `magnetic`: lerp position toward the target element's center

To detect state: use MutationObserver + event delegation. Elements with `data-cursor="hover"` etc. trigger state changes. Also detect hovering over `<p>`, `<span>`, `<h1>`-`<h6>` for "text" state.

**Step 2: Add to page.tsx**

Add `<CursorEntity />` after the scroll container div, so it has the highest z-index.

**Step 3: Build to verify**

Run: `npx next build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add components/interface/CursorEntity.tsx app/page.tsx
git commit -m "feat: implement organic CursorEntity with states and trail"
```

---

## Phase 5: DOM Overlay Components

### Task 14: Create RevealText

**Files:**
- Create: `components/dom/RevealText.tsx`

**Step 1: Implement the text reveal component**

A component that splits text into individual characters and reveals them with animation based on scroll progress range.

Props:
- `children: string` — the text to reveal
- `start: number` — scrollProgress at which reveal begins (0-1)
- `end: number` — scrollProgress at which text is fully visible
- `exitStart?: number` — scrollProgress at which dissolve begins
- `exitEnd?: number` — scrollProgress at which text is fully hidden
- `className?: string` — additional classes
- `as?: 'h1' | 'h2' | 'p' | 'span'` — wrapper element tag
- `mode?: 'materialize' | 'scramble'` — animation style

Implementation:
- Split text into `<span>` per character
- Read `scrollProgress` from Zustand store (use `useStore` with selector for reactivity)
- Calculate per-character progress based on stagger
- `materialize` mode: each char goes from `opacity: 0; filter: blur(20px); transform: translateY(20px)` to `opacity: 1; filter: blur(0); transform: translateY(0)` based on its individual progress
- `scramble` mode: each char shows random characters until its progress > threshold, then shows the correct character
- Exit: reverse the animation when scrollProgress enters exit range
- Use CSS transitions or direct style manipulation (prefer direct style for 60fps performance — avoid React re-renders per frame)
- Use `useRef` + `requestAnimationFrame` for the animation loop instead of re-renders

**Step 2: Build to verify**

Run: `npx next build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add components/dom/RevealText.tsx
git commit -m "feat: create RevealText component with materialize and scramble modes"
```

---

### Task 15: Create FloatingLabel

**Files:**
- Create: `components/dom/FloatingLabel.tsx`

**Step 1: Implement floating label component**

A simple label that fades in/out based on scroll progress.

Props:
- `children: React.ReactNode`
- `start: number` — appear scroll progress
- `end: number` — disappear scroll progress
- `className?: string`
- `style?: React.CSSProperties` — for positioning (top, left, etc.)

Implementation:
- Read `scrollProgress` from store
- Calculate opacity: 0 outside range, fade in over first 10% of range, fade out over last 10%
- Apply opacity and slight translateY (parallax feel)

**Step 2: Build to verify**

Run: `npx next build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add components/dom/FloatingLabel.tsx
git commit -m "feat: create FloatingLabel for scroll-synced text overlays"
```

---

### Task 16: Create MorphingTitle

**Files:**
- Create: `components/dom/MorphingTitle.tsx`
- Modify: `app/page.tsx` (add to DOM overlay)

**Step 1: Implement morphing title**

Shows current world name with scramble transition when world changes.

Implementation:
- Read `activeWorld` from store
- Map to world name using `WORLD_NAMES` from store
- When `activeWorld` changes: animate each letter through random characters for 0.3s, then settle on new letters
- Use a `useEffect` that watches `activeWorld` and triggers GSAP animation
- Each letter is a `<span>` that GSAP animates via `onUpdate` changing `textContent`
- Position: fixed, bottom: 40px, left: 40px
- Font: Space Mono, 11px, uppercase, letter-spacing 0.15em, opacity 0.25

**Step 2: Add to page.tsx DOM overlay section**

**Step 3: Build to verify**

Run: `npx next build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add components/dom/MorphingTitle.tsx app/page.tsx
git commit -m "feat: create MorphingTitle with scramble world name transition"
```

---

## Phase 6: The 6 Worlds

### Task 17: World 0 — IntroPortal

**Files:**
- Create: `components/experience/IntroPortal.tsx`
- Modify: `components/canvas/MainCanvas.tsx` (add IntroPortal)
- Modify: `app/page.tsx` (add HTML overlay for portal)

**Step 1: Create the 3D scene**

IntroPortal is a `<group>` positioned at z: 0 (the start of the camera path).

Contains:
- `<Torus>` (args: [3, 0.02, 16, 100]) — wireframe, emissive indigo
  - Animate: slow Z rotation via `useFrame`, scale pulse between 1.0 and 1.03 (sine)
- Vortex plane: `<Circle>` (args: [2.8, 64]) inside the torus with custom ShaderMaterial
  - Vertex: simple passthrough
  - Fragment: simplex noise flowing toward center (distort UV to polar, scroll noise radially inward, color: black center, violet/indigo edges)
  - Uniform: `uTime`
- 25 orbiting spheres: small `<Sphere>` (args: [0.03, 8, 8]) in elliptical orbits
  - Use `useFrame` to update positions: `x = cos(t * speed + offset) * radiusX`, `z = sin(t * speed + offset) * radiusZ`, y varies slightly
  - Material: MeshBasicMaterial white, with bloom layers

Activation logic:
- Read `scrollProgress` from store
- When progress > 0.06: increase vortex shader speed, increase torus emissive intensity
- When progress > 0.10: the group starts fading (opacity → 0) as camera moves through

**Step 2: Add to MainCanvas**

In `MainCanvas.tsx`, import IntroPortal and add it inside `<Suspense>`:

```tsx
<Suspense fallback={null}>
  <IntroPortal />
</Suspense>
```

**Step 3: Add HTML overlay for portal text**

In `page.tsx` DOM overlay section, add RevealText components for the portal:
- "BUILDA" with `mode="materialize"`, start: 0, end: 0.04, exitStart: 0.06, exitEnd: 0.10
  - Styled: Syne, 12vw, weight 800, centered
- "We don't build websites. We build experiences." with start: 0.03, end: 0.05, exitStart: 0.06, exitEnd: 0.09
  - Styled: Inter, 16px, opacity 0.5, centered below title

**Step 4: Build to verify**

Run: `npx next build`
Expected: Build succeeds

**Step 5: Visual check**

Run dev server, verify:
- Torus ring visible at start
- Vortex shader inside ring
- Orbiting particles
- Text appears then dissolves on scroll

**Step 6: Commit**

```bash
git add components/experience/IntroPortal.tsx components/canvas/MainCanvas.tsx app/page.tsx
git commit -m "feat: implement World 0 IntroPortal with vortex shader and text reveal"
```

---

### Task 18: World 1 — UniverseScene

**Files:**
- Create: `components/experience/UniverseScene.tsx`
- Modify: `components/canvas/MainCanvas.tsx` (add)
- Modify: `app/page.tsx` (add HTML overlay)

**Step 1: Create the 3D universe scene**

A `<group>` positioned at approximately z: -30.

Contains 6-8 spheres with unique materials:
1. "Intelligence" sphere — `<Sphere args={[1, 64, 64]}>`
   - Custom ShaderMaterial: vertex displacement with simplex noise (organic wobble), fragment: violet gradient with noise
   - Position: (-3, 0.5, -30)
2. "Automation" sphere — `<Sphere args={[0.6, 32, 32]}>`
   - Custom ShaderMaterial: geometric pulse pattern (fragment shader using sin of UV * frequency * time)
   - Position: (2, -0.5, -33)
3. "Design" sphere — `<Sphere args={[0.8, 32, 32]}>`
   - MeshPhysicalMaterial: pink/rose gradient (use gradient map or custom shader), high roughness
   - Position: (-1.5, 1.5, -28)
4. "Engineering" sphere — `<Sphere args={[0.5, 16, 16]}>`
   - MeshBasicMaterial: wireframe, white
   - Position: (3.5, 1, -35)
5-8: Small decorative spheres (radius 0.1-0.3, MeshBasicMaterial white/faint violet)

Each sphere:
- `useFrame`: sinusoidal float (amplitude 0.3-0.5, unique frequency per sphere)
- Unique rotation speed
- Raycast hover detection: use `onPointerOver`/`onPointerOut` to:
  - Scale up 1.2x (GSAP tween or spring)
  - Increase emissive/bloom
  - Set cursor state to "explore"
  - Show associated FloatingLabel

Constellation lines:
- Use `<Line>` from drei connecting select sphere pairs
- Opacity 0.15, white, dash pattern optional
- Pulsing: modulate opacity with sine in `useFrame`

**Step 2: Add to MainCanvas inside Suspense**

**Step 3: Add HTML overlay**

In page.tsx DOM overlay, add for scroll range 0.15–0.27:
- RevealText: "We exist at" (Inter, small, opacity 0.4, left-aligned ~10% from left, ~40% from top)
- RevealText: "the intersection" (Syne, large ~6vw, weight 700, below previous)
- RevealText: "of AI & craft" (same size, gradient text — use CSS gradient on text, animated background-position)
- Floating labels near each sphere (show based on hover state in store or scroll sub-ranges)

**Step 4: Build and visual check**

**Step 5: Commit**

```bash
git add components/experience/UniverseScene.tsx components/canvas/MainCanvas.tsx app/page.tsx
git commit -m "feat: implement World 1 UniverseScene with concept spheres"
```

---

### Task 19: World 2 — ServiceOrbs

**Files:**
- Create: `components/experience/ServiceOrbs.tsx`
- Modify: `components/canvas/MainCanvas.tsx`
- Modify: `app/page.tsx`

**Step 1: Create the 4 service objects**

A `<group>` positioned around z: -70, objects spread in an arc.

**Object 1: AI Blob (z: -65)**
- `<Sphere args={[2, 64, 64]}` with custom ShaderMaterial
- Vertex: 3-octave simplex noise displacement (uniform `uTime`, varying amplitude with sine)
- Fragment: violet/indigo noise gradient
- Breathing: amplitude oscillates between 0.2 and 0.5

**Object 2: Automation Gyroscope (z: -72)**
- 3 nested `<Torus>` with different args, each on a different rotation axis
- Wireframe or semi-transparent MeshPhysicalMaterial, cyan/teal, emissive
- Different rotation speeds in `useFrame`

**Object 3: SaaS Decomposing Cube (z: -78)**
- Use `<Instances>` from drei for ~150 small boxes arranged in a 5x5x6 grid
- Each instance: base position in grid + small oscillation offset (noise-based)
- When activated (scroll sub-range 0.42-0.48 or hover): increase oscillation amplitude (cubes spread out) then ease back
- Material: MeshStandardMaterial white/gray, slight emissive on edges

**Object 4: Web DNA Helix (z: -84)**
- Procedurally generate two spirals of 30 small spheres each
  - x = cos(angle) * radius, z = sin(angle) * radius, y = incrementing
  - Second spiral offset by PI
- Connect with `<Line>` segments between corresponding spheres
- Material: MeshBasicMaterial pink/magenta, bloom
- Y-axis rotation in useFrame
- Wave animation: pulse scale of each sphere based on (index * 0.1 + time)

Each object:
- Fade in as camera approaches (scale 0.5→1 based on scroll sub-range)
- Raycast hover → set cursorState to "explore"
- Read `activeService` from store for highlight state

**Step 2: Add HTML overlay per service**

For each service sub-range (0.30-0.36, 0.36-0.42, 0.42-0.48, 0.48-0.52):
- Title with `mode="scramble"` (typewriter/decode effect)
- Description: Inter, small, opacity 0.5, delayed fade
- Tags: rendered as small glass-effect pills with stagger animation
- Position text relative to the active object (use CSS positioning based on which service is active)

**Step 3: Build, visual check**

**Step 4: Commit**

```bash
git add components/experience/ServiceOrbs.tsx components/canvas/MainCanvas.tsx app/page.tsx
git commit -m "feat: implement World 2 ServiceOrbs with 4 interactive 3D objects"
```

---

### Task 20: World 3 — ProjectTunnel

**Files:**
- Create: `components/experience/ProjectTunnel.tsx`
- Modify: `components/canvas/MainCanvas.tsx`
- Modify: `app/page.tsx`

**Step 1: Create the tunnel geometry**

A `<group>` positioned around z: -120.

**Tunnel:**
- Generate a wavy `CatmullRomCurve3` extending from z: -100 to z: -160 with slight X/Y undulations
- `<Tube args={[curve, 128, 8, 32, false]}>` — radius 8, camera flies through the center
- Custom ShaderMaterial:
  - Fragment: draw lines flowing along the tube in reverse direction (warp speed effect)
  - Use `uTime` to animate line positions
  - Colors: thin indigo/violet/white lines on near-transparent dark
  - The material should be transparent (alphaTest, transparent: true)

**Project Windows (4 planes along the tunnel):**
- For each project, create a `<Plane args={[4, 6]}` positioned along the tunnel curve
- Each plane is slightly angled (rotated to face the curve tangent)
- Custom ShaderMaterial per plane:
  - Base color from `project.color`
  - Animated noise pattern (abstract visuals in motion)
  - When camera is aligned (within project's scroll sub-range): increase glow/opacity

Position the 4 planes at intervals along the tunnel curve.

**Step 2: Add HTML overlay for project titles**

For each sub-range (0.54-0.60, 0.60-0.66, 0.66-0.72, 0.72-0.75):
- RevealText with `mode="scramble"`: project title in Syne, huge size `clamp(48px, 10vw, 120px)`, weight 800, centered
- Below: category + year in Space Mono, small, opacity 0.4
- Text has slight parallax (moves slower than scroll — offset by 10% of progress)

**Step 3: Build, visual check**

**Step 4: Commit**

```bash
git add components/experience/ProjectTunnel.tsx components/canvas/MainCanvas.tsx app/page.tsx
git commit -m "feat: implement World 3 ProjectTunnel with warp lines and project windows"
```

---

### Task 21: World 4 — AboutDNA

**Files:**
- Create: `components/experience/AboutDNA.tsx`
- Modify: `components/canvas/MainCanvas.tsx`
- Modify: `app/page.tsx`

**Step 1: Create the DNA double helix**

A `<group>` positioned at z: -170.

**DNA Structure:**
- Procedurally generate 2 spirals, 40 spheres each:
  - For sphere i (0-39): angle = i * (2 * PI / 10), y = i * 0.3 - 6 (centered vertically)
  - Spiral 1: x = cos(angle) * radius, z = sin(angle) * radius
  - Spiral 2: x = cos(angle + PI) * radius, z = sin(angle + PI) * radius
  - Radius parameter driven by `scrollProgress` (0.75-0.88) — starts at 1.5, "unwinds" to 2.5 at 0.88
- Use `<Instances>` from drei for spheres
- Material: MeshBasicMaterial, alternating white / soft violet, bloom
- Connect corresponding spheres (i from spiral 1 to i from spiral 2) with `<Line>`, opacity 0.15

Animation:
- Slow Y-axis rotation on the whole group
- Wave pulse: each sphere's scale = 1 + 0.15 * sin(i * 0.5 + time * 2) (wave climbing from bottom)

**Extra particles:**
- Add 50 small local particles (separate Points geometry) around the DNA
- Slower movement, denser, creating a nebula atmosphere

**Step 2: Add HTML overlay**

- Scroll 0.76-0.80: RevealText "Built different." — Syne 10vw weight 800, mode="materialize", positioned ~15% from left, ~30% from top
- Scroll 0.80-0.85: Paragraph, line-by-line fade — use multiple FloatingLabel components or a custom paragraph reveal. Inter 18px weight 300, opacity 0.5, max-width 500px, right side (~55% from left)
- Scroll 0.83-0.88: 4 stat counters at different positions
  - Each stat: number (Syne 8vw gradient) + label (Space Mono 10px opacity 0.3)
  - Positioned asymmetrically (top-left, top-right, bottom-left, bottom-right offsets)
  - Count-up animation: use GSAP or requestAnimationFrame to animate from 0 to target
  - Stagger appearance by 0.3s

**Step 3: Build, visual check**

**Step 4: Commit**

```bash
git add components/experience/AboutDNA.tsx components/canvas/MainCanvas.tsx app/page.tsx
git commit -m "feat: implement World 4 AboutDNA with helix and stat counters"
```

---

### Task 22: World 5 — ContactField

**Files:**
- Create: `components/experience/ContactField.tsx`
- Modify: `components/canvas/MainCanvas.tsx`
- Modify: `app/page.tsx`

**Step 1: Create the galaxy/force field**

A `<group>` positioned at z: -210.

**Particle Disk:**
- 200 particles arranged in a horizontal disk (ring distribution)
  - For each particle: random angle, random radius (2-8), y near 0 (±0.3 random)
  - Use `<Points>` with BufferGeometry and custom attributes
- Custom vertex shader:
  - Each particle spirals outward slowly (radius increases, angle increases with time)
  - When reaching max radius, respawn at center (modulo)
  - Mouse interaction: attract/repulse based on proximity (read uMouse uniform)
- Custom fragment shader:
  - Color gradient: white at center (small radius) → violet → indigo at edges (large radius)
  - Soft circle, opacity based on distance from disk center
- Bloom on the center region (selective bloom layer or just high emissive)

**Distant Portal (visual loop):**
- A small torus (radius 1, same style as IntroPortal) positioned at z: -230
- Very subtle, almost silhouette-like, communicating "the journey loops"

**Step 2: Add HTML overlay**

- Scroll 0.89-0.92: RevealText "Ready?" — Syne, opacity 0.3, centered, with CSS pulse animation (scale 1.0-1.02-1.0)
- Scroll 0.92-0.98:
  - "Let's create" — Syne weight 800, white, large `clamp(36px, 8vw, 100px)`, centered, mode="materialize"
  - "something extraordinary." — same size, CSS gradient text (violet→glow→violet, animated), below
- Email link: `hello@builda.studio` — `pointer-events: auto` (clickable!), Inter 18px, opacity 0.4
  - `data-cursor="magnetic"` for cursor attraction
  - Hover: opacity → 0.8, particles should agitate (communicate via store)
- Interactive "Start" orb:
  - A circular div (100px), centered below email
  - `pointer-events: auto`, `data-cursor="magnetic"`
  - Styled: glass effect, "Start" text inside, border: 1px solid rgba(255,255,255,0.1)
  - Hover: scale 1.2, border brightens, glow shadow
  - Click: `window.location.href = 'mailto:hello@builda.studio'`
- Scroll 0.98-1.0: Footer
  - "© 2025 BUILDA" left — Space Mono 11px opacity 0.2
  - "Tw · Li · Dr · Gh" right — Space Mono 11px opacity 0.2, each linked

**Step 3: Build, visual check**

**Step 4: Commit**

```bash
git add components/experience/ContactField.tsx components/canvas/MainCanvas.tsx app/page.tsx
git commit -m "feat: implement World 5 ContactField with galaxy particles and contact CTA"
```

---

## Phase 7: Navigation & Progress UI

### Task 23: Create NavigationWhisper

**Files:**
- Create: `components/interface/NavigationWhisper.tsx`
- Modify: `app/page.tsx`

**Step 1: Implement navigation dots**

Fixed right side, vertically centered. 6 dots representing each world.

Implementation:
- Read `activeWorld` and `scrollProgress` from store
- 6 `<button>` elements stacked vertically, each is a small circle
- Active dot: 10px, white, with animated pulse ring (CSS animation: scale ring 1→1.5 with opacity 1→0, infinite)
- Inactive: 6px, white, opacity 0.2
- Connected by a thin vertical line (before pseudo-element or separate div, 1px, opacity 0.05)
- Hover: tooltip appears to the left — GSAP fade-in of a `<span>` with world name (Space Mono, 10px)
- Click: set `scrollProgress` target — use `window.scrollTo` with smooth behavior, calculating the scroll position from the target world's scrollProgress range × total scroll height
- `pointer-events: auto` on the navigation container
- The active indicator position should lerp smoothly (translate the highlight dot)
- Position: fixed, right: 24px, top: 50%, transform: translateY(-50%)

**Step 2: Add to page.tsx inside the DOM overlay div**

Make sure NavigationWhisper has `pointer-events: auto` on its container while the overlay parent is `pointer-events: none`.

**Step 3: Build, visual check**

**Step 4: Commit**

```bash
git add components/interface/NavigationWhisper.tsx app/page.tsx
git commit -m "feat: implement NavigationWhisper dot navigation"
```

---

### Task 24: Create ScrollProgress

**Files:**
- Create: `components/interface/ScrollProgress.tsx`
- Modify: `app/page.tsx`

**Step 1: Implement scroll progress bar**

Very minimal — a 2px line at the bottom of the viewport.

```typescript
'use client'

import { useStore } from '@/lib/store'

export default function ScrollProgress() {
  const progress = useStore((s) => s.scrollProgress)

  return (
    <div
      className="fixed bottom-0 left-0 h-[2px] z-20"
      style={{
        width: `${progress * 100}%`,
        background: 'linear-gradient(90deg, #6366f1, #a78bfa, #ec4899)',
        opacity: 0.3,
        transition: 'width 0.1s linear',
      }}
    />
  )
}
```

**Step 2: Add to page.tsx**

**Step 3: Build, commit**

```bash
git add components/interface/ScrollProgress.tsx app/page.tsx
git commit -m "feat: add ScrollProgress indicator line"
```

---

## Phase 8: Audio System

### Task 25: Create Audio Engine

**Files:**
- Create: `lib/audio.ts`

**Step 1: Implement Web Audio API ambient engine**

```typescript
'use client'

// 6 world audio presets: frequency, filter cutoff, gain
const WORLD_PRESETS = [
  { freq: 55, filter: 200, gain: 0.08 },    // Portal: deep, mysterious
  { freq: 65, filter: 300, gain: 0.06 },    // Universe: slightly higher
  { freq: 80, filter: 400, gain: 0.07 },    // Services: mid-low
  { freq: 100, filter: 500, gain: 0.06 },   // Projects: building energy
  { freq: 75, filter: 350, gain: 0.05 },    // About: calm, intimate
  { freq: 110, filter: 600, gain: 0.08 },   // Contact: bright, inviting
]

class AudioEngine {
  private ctx: AudioContext | null = null
  private oscillator: OscillatorNode | null = null
  private gainNode: GainNode | null = null
  private filterNode: BiquadFilterNode | null = null
  private isPlaying = false

  init() {
    if (this.ctx) return
    this.ctx = new AudioContext()
    this.oscillator = this.ctx.createOscillator()
    this.gainNode = this.ctx.createGain()
    this.filterNode = this.ctx.createBiquadFilter()

    this.oscillator.type = 'sine'
    this.oscillator.frequency.value = WORLD_PRESETS[0].freq
    this.filterNode.type = 'lowpass'
    this.filterNode.frequency.value = WORLD_PRESETS[0].filter
    this.gainNode.gain.value = 0

    this.oscillator.connect(this.filterNode)
    this.filterNode.connect(this.gainNode)
    this.gainNode.connect(this.ctx.destination)
    this.oscillator.start()
  }

  play() {
    if (!this.ctx) this.init()
    if (this.ctx?.state === 'suspended') this.ctx.resume()
    this.isPlaying = true
    this.gainNode?.gain.linearRampToValueAtTime(
      WORLD_PRESETS[0].gain,
      (this.ctx?.currentTime ?? 0) + 0.5
    )
  }

  stop() {
    this.isPlaying = false
    this.gainNode?.gain.linearRampToValueAtTime(0, (this.ctx?.currentTime ?? 0) + 0.5)
  }

  setWorld(worldIndex: number) {
    if (!this.isPlaying || !this.ctx) return
    const preset = WORLD_PRESETS[worldIndex] ?? WORLD_PRESETS[0]
    const t = this.ctx.currentTime + 1 // crossfade over 1 second
    this.oscillator?.frequency.linearRampToValueAtTime(preset.freq, t)
    this.filterNode?.frequency.linearRampToValueAtTime(preset.filter, t)
    this.gainNode?.gain.linearRampToValueAtTime(preset.gain, t)
  }

  dispose() {
    this.oscillator?.stop()
    this.ctx?.close()
    this.ctx = null
  }
}

export const audioEngine = new AudioEngine()
```

**Step 2: Build to verify**

Run: `npx next build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add lib/audio.ts
git commit -m "feat: create Web Audio API ambient engine with world presets"
```

---

### Task 26: Create SoundToggle

**Files:**
- Create: `components/interface/SoundToggle.tsx`
- Modify: `app/page.tsx`

**Step 1: Implement the sound toggle button**

- Position: fixed, bottom: 80px, left: 40px (above MorphingTitle)
- A 24px circle with 3 vertical bars that animate when sound is on
- Click: toggle `isSoundOn` in store, call `audioEngine.play()` or `.stop()`
- Watch `activeWorld` from store to call `audioEngine.setWorld()`
- `pointer-events: auto`
- `data-cursor="hover"`

The bars animation: 3 small divs (2px wide, varying heights) that oscillate height with CSS animation when active, static when inactive.

**Step 2: Add to page.tsx**

**Step 3: Build, commit**

```bash
git add components/interface/SoundToggle.tsx app/page.tsx
git commit -m "feat: add SoundToggle with ambient audio control"
```

---

## Phase 9: Polish & Responsive

### Task 27: Mobile optimizations

**Files:**
- Modify: `components/canvas/MainCanvas.tsx`
- Modify: `components/canvas/ParticleField.tsx`
- Modify: `components/experience/IntroPortal.tsx`
- Modify: `components/experience/UniverseScene.tsx`
- Modify: `components/experience/ServiceOrbs.tsx`
- Modify: `components/experience/ProjectTunnel.tsx`
- Modify: `components/experience/AboutDNA.tsx`
- Modify: `components/experience/ContactField.tsx`
- Modify: `components/interface/NavigationWhisper.tsx`

**Step 1: Add mobile checks to all components**

Each component should read `isMobile` from store and conditionally:
- MainCanvas: set `dpr={[1, 1.5]}`, remove post-processing
- ParticleField: reduce to 120 particles, disable mouse repulsion
- IntroPortal: fewer orbiting spheres (10 instead of 25)
- UniverseScene: 3 spheres only, no constellation lines
- ServiceOrbs: reduce geometry detail (lower subdivision), simpler materials
- ProjectTunnel: replace TubeGeometry with simple planes scrolling past on mobile
- AboutDNA: 20 spheres per spiral instead of 40
- ContactField: 80 particles, no mouse interaction
- NavigationWhisper: reposition to horizontal bottom bar
- CursorEntity should already be hidden (check and ensure)
- All text overlays: re-center, use `clamp()` for font sizes

**Step 2: Test on mobile viewport (Chrome DevTools), verify no crashes**

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add mobile responsive optimizations to all worlds"
```

---

### Task 28: Performance tuning

**Files:**
- All experience and canvas components (as needed)

**Step 1: Verify performance patterns**

Check all components for:
- `useMemo` on all geometries and materials that don't change
- Uniforms updated via `ref.current` in `useFrame` (never via state/props)
- No `useStore()` calls inside `useFrame` — use `useStore.getState()` instead
- No unnecessary React re-renders during animation (check with React DevTools profiler)
- All `<Suspense>` boundaries in place for world components
- Visibility: worlds far from camera can be `visible={false}` to skip rendering
  - In each world component: calculate distance from camera, set `<group visible={...}>`

**Step 2: Add visibility optimization to MainCanvas or each world**

Each world can check if `scrollProgress` is within its range ± buffer and set `visible` accordingly.

Example pattern per world:
```typescript
const progress = useStore((s) => s.scrollProgress)
const isVisible = progress > (WORLD_MIN - 0.05) && progress < (WORLD_MAX + 0.05)
return <group visible={isVisible}>...</group>
```

**Step 3: Build and verify**

Run: `npx next build`
Expected: Build succeeds, no warnings

**Step 4: Commit**

```bash
git add -A
git commit -m "perf: add visibility culling and useMemo optimizations"
```

---

### Task 29: Accessibility & reduced motion fallback

**Files:**
- Modify: `app/page.tsx`
- Modify: `hooks/useMediaQuery.ts`

**Step 1: Add reduced-motion check**

In `useMediaQuery`, we already track `prefers-reduced-motion`. When active:
- The Canvas should render a static frame (or a simplified static background)
- All GSAP animations should be disabled
- Text overlays should be visible without animation
- The page should function as a simple scrollable page with content visible

Implementation: In `page.tsx`, conditionally render a simplified static version when `reducedMotion` is true. This can be a simple dark page with the key text content visible in order.

**Step 2: Build and verify**

**Step 3: Commit**

```bash
git add app/page.tsx hooks/useMediaQuery.ts
git commit -m "feat: add prefers-reduced-motion accessibility fallback"
```

---

### Task 30: Final build verification

**Step 1: Full production build**

```bash
npx next build
```

Expected: Build succeeds with no errors. Note the route sizes.

**Step 2: Start production server and test**

```bash
npm start
```

Test:
- Full scroll journey through all 6 worlds
- All text appears and disappears correctly
- Navigation dots work
- Sound toggle works
- No console errors
- Smooth 60fps on desktop

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete BUILDA immersive experience - all 6 worlds operational"
```

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | 1-5 | Foundation: branch, deps, Tailwind, store, hooks |
| 2 | 6-9 | Canvas system: MainCanvas, shader bg, particles, camera |
| 3 | 10-11 | Page assembly: layout, page, verify renders |
| 4 | 12-13 | Loading ritual, cursor entity |
| 5 | 14-16 | DOM overlays: RevealText, FloatingLabel, MorphingTitle |
| 6 | 17-22 | The 6 worlds (IntroPortal through ContactField) |
| 7 | 23-24 | Navigation whisper, scroll progress |
| 8 | 25-26 | Audio engine, sound toggle |
| 9 | 27-30 | Mobile, performance, accessibility, final verification |

Total: 30 tasks across 9 phases.
