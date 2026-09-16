# BUILDA Immersive Experience — Design Document

**Date:** 2026-02-19
**Status:** Approved
**Branch:** `immersive` (new branch from main)

---

## Overview

Transform the BUILDA website from a traditional section-based site into a full-screen immersive 3D experience. The entire site is a single Three.js canvas where scroll drives a camera through 6 "worlds" in continuous 3D space. HTML text floats above the canvas as a transparent overlay.

**Philosophy:** No navbar, no stacked sections, no conventional buttons. The site is a navigable digital universe — a museum, not a webpage.

**Aesthetic target:** Immersive Garden meets Apple — cinematic, sober, hypnotic.

**References:** Active Theory, Resn, Immersive Garden, Lusion, Aristide Benoist.

---

## Architecture

### Approach: Single Global Canvas

One `<Canvas>` (React Three Fiber) fixed full-screen. All 6 worlds are Three.js groups positioned at different Z depths. Camera moves along a CatmullRomCurve3 driven by scroll progress (0-1).

### Layer Stack (bottom to top)

```
1. <Canvas> — position: fixed, inset: 0
   ├── ShaderBackground (fullscreen quad, living gradient)
   ├── ParticleField (300-500 global particles)
   ├── CameraRig (camera on CatmullRomCurve3)
   └── Worlds 0-5 (at Z depths 0 to -210)

2. <DOMOverlay> — position: fixed, pointer-events: none
   ├── World-specific text (per scroll range)
   ├── NavigationWhisper (dot nav, right)
   ├── ScrollProgress (thin line, bottom)
   ├── MorphingTitle (world name, bottom-left)
   └── SoundToggle (bottom-left)

3. <ScrollContainer> — height: 600vh, transparent
   └── (empty, generates scroll events only)

4. CursorEntity — position: fixed, highest z-index
5. LoadingRitual — position: fixed, z-100 (unmounts after load)
```

### File Structure

```
/components
  /experience          — The 6 "worlds" (3D scenes)
    IntroPortal.tsx
    UniverseScene.tsx
    ServiceOrbs.tsx
    ProjectTunnel.tsx
    AboutDNA.tsx
    ContactField.tsx
  /canvas              — Core canvas system
    MainCanvas.tsx
    ShaderBackground.tsx
    ParticleField.tsx
    CameraRig.tsx
  /interface           — Fixed 2D overlay (minimal UI)
    NavigationWhisper.tsx
    ScrollProgress.tsx
    CursorEntity.tsx
    LoadingRitual.tsx
    SoundToggle.tsx
  /dom                 — HTML text overlays
    FloatingLabel.tsx
    RevealText.tsx
    MorphingTitle.tsx
/shaders               — GLSL files
  background.vert / .frag
  blob.vert / .frag
  particles.vert / .frag
  tunnel.vert / .frag
/lib
  store.ts             — Zustand global state
  gsap-config.ts       — (existing)
  constants.ts         — (existing, extended)
  audio.ts             — Web Audio API engine
/hooks
  useScrollProgress.ts
  useMouse.ts
  useLerpedValue.ts
  useMediaQuery.ts
```

### Dependencies

- **New:** `zustand` (global reactive state)
- **Existing (keep):** next, react, three, @react-three/fiber, @react-three/drei, @react-three/postprocessing, gsap, lenis, framer-motion, tailwindcss

---

## Zustand Store (`lib/store.ts`)

```typescript
interface BuildaStore {
  scrollProgress: number         // 0-1
  scrollVelocity: number
  activeWorld: number            // 0-5 (derived from scrollProgress)
  mouse: { x: number; y: number }
  mouseNormalized: { x: number; y: number }  // -1 to 1
  cursorState: 'default' | 'hover' | 'text' | 'drag' | 'explore' | 'magnetic'
  isLoaded: boolean
  isSoundOn: boolean
  isMobile: boolean
  activeService: number | null   // 0-3
  activeProject: number | null   // 0-3
}
```

**World ranges:**

| World | scrollProgress | Name |
|-------|---------------|------|
| 0 | 0.00–0.12 | Portal |
| 1 | 0.12–0.30 | Universe |
| 2 | 0.30–0.52 | Services |
| 3 | 0.52–0.75 | Projects |
| 4 | 0.75–0.88 | About |
| 5 | 0.88–1.00 | Contact |

---

## Canvas System

### MainCanvas

- `<Canvas>` from R3F: `position: fixed; inset: 0`
- `frameloop="always"`, `dpr={[1, 2]}`, `gl={{ antialias: true, alpha: true }}`
- Perspective camera: fov 45, near 0.1, far 1000
- Each world in `<Suspense>` with null fallback
- Mobile: `dpr={[1, 1.5]}`, no post-processing

### ShaderBackground

Fullscreen quad with custom GLSL fragment shader:
- Base: diagonal gradient 135deg from ash (#1e1e22) to void (#07070a)
- 3-4 color blobs via simplex noise 3D (speeds: time*0.1, *0.07, *0.13)
  - Deep violet (#2d1b69, opacity 0.06)
  - Indigo (#312e81, opacity 0.04)
  - Dark magenta (#4a1942, opacity 0.03)
- Film grain (random per pixel per frame, opacity 0.03)
- Vignette (darker edges)
- Uniforms: uTime, uMouse (vec2), uScroll (float)
- Scroll shifts hue subtly, mouse attracts blobs

### ParticleField

Global particle system (connective tissue):
- 300-500 particles (100-150 mobile) via `<Points>` + BufferGeometry
- Custom vertex shader: diagonal flow, Z-depth parallax, sine oscillation, scroll-driven parallax (opposite direction), mouse repulsion force field
- Custom fragment shader: soft circles (smoothstep), larger = more blur (bokeh)
- Color: white to faint violet, opacity 0.05-0.2
- Only uniforms update per frame (no geometry reallocation)
- Mobile: no mouse repulsion

### CameraRig

- CatmullRomCurve3 through 6 keypoints:
  1. Portal: (0, 0, 0)
  2. Universe: (2, 1, -30)
  3. Services: (-1, -0.5, -70)
  4. Projects: (0, 0, -120)
  5. About: (3, 2, -170)
  6. Contact: (0, 0, -210)
- scrollProgress maps to curve position via `curve.getPointAt(t)`
- lookAt: point slightly ahead on curve
- All movement lerped (factor 0.05-0.08)
- Mouse: ±3 deg rotation (slow lerp)

---

## The 6 Worlds

### World 0: IntroPortal (0.00–0.12)

**3D:**
- Large torus (r3, tube 0.02) — wireframe, indigo emissive, slow Z rotation, scale pulse 1.0-1.03
- Inside: circular plane with vortex shader (noise → center, black center, violet edges)
- 20-30 small orbiting spheres (elliptical, white, bloom)

**HTML:**
- "BUILDA" (Syne 12vw 800): letter-by-letter materialize (blur 20px→0, stagger 0.08s)
- "We don't build websites. We build experiences." (Inter 16px, opacity 0.5, fade-up)
- At 0.06+: text dissolves (fade + scale up)
- Portal activates: vortex accelerates, torus glows, camera enters

### World 1: UniverseScene (0.12–0.30)

**3D:**
- 6-8 spheres with unique shaders: Intelligence (violet noise), Automation (cyan pulse), Design (pink gradient), Engineering (white wireframe) + decoratives
- Each: sinusoidal float, unique rotation, raycast hover → glow + expand + label
- Constellation lines (pulsing, opacity 0.15)

**HTML (0.15–0.27):**
- Left-aligned: "We exist at" / "the intersection" / "of AI & craft" (gradient)
- RevealText char-by-char, dissolve on exit

### World 2: ServiceOrbs (0.30–0.52)

**3D — 4 objects:**
1. AI blob (radius 2): 3-octave simplex noise vertex displacement, violet/indigo fragment
2. Automation gyroscope: 3-4 concentric wireframe tori, cyan/teal, different rotation speeds
3. SaaS cube: ~150 instanced small cubes in grid, oscillate slightly, explode/recompose on activate
4. Web DNA helix: two spirals of small spheres + connecting lines, pink/magenta, wave animation

Each fades in as camera approaches, raycast hover activates, cursor → "explore" state.

**HTML — per object (sub-ranges 0.30–0.36/0.36–0.42/0.42–0.48/0.48–0.52):**
- Title: Syne, typewriter/scramble
- Description: Inter, opacity 0.5, delayed fade
- Tags: glass capsule pills, stagger from bottom

### World 3: ProjectTunnel (0.52–0.75)

**3D:**
- TubeGeometry (wavy curve, radius ~8, camera at center)
- Tunnel shader: flowing light lines in reverse (warp speed), indigo/violet/white on transparent
- 4 PlaneGeometry windows (~4x6) with project-colored gradient + animated noise shader + refraction

**HTML — per project window:**
- Title: Syne huge, scramble/decode letter by letter
- Category + year: Space Mono, opacity 0.4
- Parallax (text slower than scroll)
- Sub-ranges: NeuralFlow 0.54–0.60 / AutoScale 0.60–0.66 / DataPulse 0.66–0.72 / SynthOS 0.72–0.75

### World 4: AboutDNA (0.75–0.88)

**3D:**
- Large vertical double helix: 2×40 spheres + connecting lines
- Slow Y rotation, wave pulse bottom-up
- White/soft violet alternating, bloom, lines opacity 0.15
- Scroll → DNA unwinds (spirals widen)
- Extra local particles (denser, slower nebula)

**HTML (asymmetric):**
- 0.76–0.80: "Built different." (Syne 10vw 800, char reveal, left)
- 0.80–0.85: Paragraph line-by-line fade (Inter 18px 300, opacity 0.5)
- 0.83–0.88: Stats floating at varied positions, count-up (Syne 8vw gradient + Space Mono 10px 0.3)

### World 5: ContactField (0.88–1.0)

**3D:**
- 200+ particles in horizontal disk, rotating slowly, spiral center→outward
- Color: white center → violet → indigo edges
- Strong mouse reactivity (attract/repulse)
- Intense bloom at center
- In distance: initial torus/portal reappears (visual loop)

**HTML:**
- 0.89–0.92: "Ready?" (Syne, opacity 0.3, pulse)
- 0.92–0.98: "Let's create" + "something extraordinary." (gradient, char wave)
- Email: Inter 18px, opacity 0.4, hover → illuminate + particles agitate
- Interactive orb "Start": expand on hover, particles converge, click → explosion → mailto
- 0.98–1.0: Footer fade — "© 2025 BUILDA" left, "Tw · Li · Dr · Gh" right, Space Mono 11px opacity 0.2

---

## Interface Layer

### CursorEntity

SVG/Canvas ~40x40px, simplex noise deforms 8-12 circle points. White, opacity 0.7, mix-blend-mode: difference.

| State | Size | Behavior |
|-------|------|----------|
| default | ~20px | gentle breathing |
| hover | ~60px | transparent, wilder deformation |
| text | thin line | vertical text cursor |
| drag | elongated | stretches in scroll direction |
| explore | ~30px | emits orbiting mini-particles |
| magnetic | ~20px | lerps toward element center |

Trail: 5-8 fading copies (opacity 0.3→0.08). Hidden on mobile.

### LoadingRitual (~4s)

1. Black screen (0.5s)
2. Thin horizontal line expands center→full width (1.5s)
3. Line splits up/down, "BUILDA" appears with scramble/decrypt effect (Syne 800 8vw)
4. Violet flash pulse
5. Fragments into particles flying away (or clip-path circle expand)
6. Experience begins

### NavigationWhisper

Fixed right, vertical center. 6 circles (6px), active = 10px + pulse ring. Connected by thin line (opacity 0.05). Hover = tooltip. Click = smooth scroll to world.

### ScrollProgress

Fixed bottom, 1-2px line, gradient indigo→violet→magenta, opacity 0.3.

### MorphingTitle

Fixed bottom-left. World name with scramble transition on change. Space Mono, 11px, opacity 0.25.

### SoundToggle

Fixed bottom-left (above MorphingTitle). 24px circle, 3 animated wave bars. Toggles ambient audio. Off by default.

### Audio Engine (`lib/audio.ts`)

Web Audio API: oscillator + filter + low gain. 6 presets (one per world), crossfade on transition. Deeper at start, brighter at end.

---

## Responsive & Performance

### Mobile (<768px)

- `dpr={[1, 1.5]}`, no post-processing
- IntroPortal: portal + ring, fewer orbiting spheres
- UniverseScene: 3 spheres, no constellation lines
- ServiceOrbs: simplified geometry
- ProjectTunnel: no tube geometry, simple planes
- AboutDNA: 20 spheres per spiral
- ContactField: 80 particles, no mouse interaction
- CursorEntity: hidden
- NavigationWhisper: horizontal, bottom
- Text: centered, clamp() sizing

### Performance Targets

- 60fps MacBook Air M1
- 30fps+ mid-range mobile
- Lighthouse 85+
- useMemo geometries, refs for uniforms (no React re-renders in animation loop)
- Frustum culling + visibility flags for distant worlds

### Accessibility

- prefers-reduced-motion: disable animations, static layout fallback
- ::selection → rgba(99, 102, 241, 0.3)
- Scrollbar: hidden (Lenis handles)
- All useEffect cleanup (GSAP kill, Three.js dispose)

---

## Implementation Order

Setup → Store/Hooks → Canvas System → Camera → Loading → Worlds 0-5 → Interface → Sound → Polish

(Detailed implementation plan to follow.)
