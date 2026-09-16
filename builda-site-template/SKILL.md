---
name: builda-site-template
description: Use when scaffolding a new marketing, agency, studio, or portfolio website, or starting an immersive scroll-storytelling landing page. Bundles the full BUILDA boilerplate — Next.js 14 + TypeScript + GSAP/Lenis scrollytelling + Three.js background + Tailwind + Zustand + a Prisma/JWT admin CMS. Triggers: "site like BUILDA", immersive landing page, scrollytelling, GSAP ScrollTrigger site, glassmorphism agency site, Next.js portfolio boilerplate with admin panel.
---

# BUILDA Site Template

## Overview

A complete, production-shaped boilerplate for a **premium agency / studio / portfolio website**: an immersive, scroll-driven single page (the "acts") layered over a Three.js canvas, plus a full Prisma + JWT **admin CMS** to edit projects, services, stats, and settings.

The full source lives in [template/](template/) next to this file. Cloning a new site = copy that folder, rename branding, point at a database, install, run.

**Core architecture in one line:** a `1240vh`-tall stack of self-contained GSAP-animated "Act" components, rendered in `z-10` over a fixed Three.js/grid canvas (`z-0/1`), under a fixed interface overlay (`z-30`) and custom cursor (`z-50`), gated by a particle loading ritual (`z-100`).

## When to Use

- Building a high-end landing/marketing site with scroll-storytelling
- Want GSAP ScrollTrigger pinning, Lenis smooth scroll, magnetic glass UI, custom cursor out of the box
- Need a lightweight self-hosted CMS to edit site content without redeploying

**When NOT to use:**
- Plain content sites / blogs (this is animation-heavy; overkill)
- No-JS / max-accessibility-first sites (relies on JS scroll hijack; honors `prefers-reduced-motion` but is still motion-centric)
- You don't want a database — the public page renders from hardcoded arrays even without the CMS, but the admin half assumes Postgres + Prisma

## Scaffolding a New Site

**Prerequisites:** Node 18+, npm, and a running Postgres (only for the CMS). Quick local DB:
`docker run --name pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres`

Run from where the new project should live. Replace `my-site`.

```bash
# 1. Copy the boilerplate (path is relative to this SKILL.md)
cp -R ~/.claude/skills/builda-site-template/template my-site
cd my-site

# 2. Re-init git and install
rm -rf .git && git init
npm install

# 3. Environment
cp .env.example .env
# then edit .env — full contents below

# 4. Database (only needed for the /admin CMS + /api routes)
npx prisma generate
npx prisma db push
npx prisma db seed   # works because package.json has prisma.seed → "npx tsx prisma/seed.ts"

# 5. Run
npm run dev       # http://localhost:3000  → public site, /admin/login → CMS
```

**`.env` (every required var — full file):**
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/builda?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
```
Only these two. Point `DATABASE_URL` at your Postgres; set a strong `JWT_SECRET`.

Scripts (package.json): `dev`, `build`, `start`, `lint`. Seed runs via `npx prisma db seed` (or directly: `npx tsx prisma/seed.ts`).

**No-database mode:** the marketing page works standalone — every Act renders from inline data arrays. Skip steps 3-4 if you only want the public site, and delete `app/admin/` + `app/api/` + `prisma/` + `lib/auth.ts` + `lib/admin-auth.ts` + `lib/prisma.ts`.

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 14.2 (App Router), React 18.3, TypeScript 5.6 |
| Styling | Tailwind 3.4 + inline `style` for dynamic/animated values |
| Animation | GSAP 3.12 + ScrollTrigger (primary engine) |
| Smooth scroll | Lenis 1.1 (driven by GSAP ticker) |
| 3D / canvas | Three.js 0.169 + @react-three/fiber + drei + postprocessing |
| State | Zustand 5 (`lib/store.ts`) |
| Icons | lucide-react |
| Backend | Next API routes + Prisma 5 (Postgres) + JWT (`jsonwebtoken`) + bcryptjs |

`framer-motion` is installed but barely used — GSAP does the heavy lifting.

## Design Tokens (exact values)

Defined in [template/tailwind.config.ts](template/tailwind.config.ts) + `app/globals.css` (`:root`).

| Token | Hex | Role |
|---|---|---|
| `void` | `#1E2224` | Background / dark surfaces |
| `carbon` | `#393E41` | Secondary text, borders, UI accents |
| `stone` | `#D3D0CB` | Body text (usually at reduced opacity) |
| `chalk` | `#E7E5DF` | Headings, active states, highlights |

**Fonts** (next/font/google, in `app/layout.tsx`):
- `Syne` → `var(--font-syne)` / `font-display` — headings, big type
- `Inter` → `var(--font-inter)` / `font-body` — body copy
- `Space Mono` → `var(--font-space-mono)` / `font-mono` — labels, tags, tickers (letter-spacing 0.1–0.15em)

**Fluid type:** sizes use `clamp(min, vw, max)` everywhere (e.g. titles `clamp(28px, 7vw, 80px)`).

**Spacing extras:** `section` 160px, `section-sm` 80px, `section-lg` 200px. **Blur:** `backdrop-blur-xs` = 2px.

**Glassmorphism signature** (reused across buttons/cards/frames):
```css
background: rgba(57, 62, 65, 0.15);   /* carbon @ 15% (→0.3 on hover) */
border: 1px solid rgba(57, 62, 65, 0.4);
backdrop-filter: blur(12px);
```

## The Acts System

`app/page.tsx` composes six Acts inside `<main className="relative z-10">`. Each Act is self-contained: its own refs, a `gsap.context()` in `useEffect`, ScrollTrigger pins, and inline `<style jsx>` keyframes. Content comes from a local data array near the top of each file — **that array is the main customization point.**

| Act | Height | What it does | Edit content at |
|---|---|---|---|
| `HeroAct` | 100vh | Title compresses + ticker | inline ticker words |
| `ServicesAct` | 300vh pinned | 4 services cycle with `ScreenFrame` previews | `services` array |
| `ProjectsAct` | 400vh pinned | 4 projects fly in L/R | `projects` array |
| `StatsAct` | 150vh pinned | 4 count-up stats | `stats` array |
| `AboutAct` | ~170vh | Word-by-word reveal + 2-col | inline copy |
| `ContactAct` | 120vh | CTA + email + footer | inline copy / email / socials |

`ManifestoAct.tsx` exists but is **not imported** — drop it into `page.tsx` if you want a 5-phrase manifesto section.

### Adding a new Act

Create `components/acts/YourAct.tsx` following the house pattern:

```tsx
'use client'
import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from '@/lib/gsap-config'   // NEVER import ScrollTrigger from 'gsap'

export default function YourAct() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        pin: '.your-pin',          // optional
        scrub: true,
      })
      // gsap.fromTo(...) animations here
    }, sectionRef)
    return () => ctx.revert()       // REQUIRED cleanup
  }, [])

  return (
    <section ref={sectionRef} data-act="your-act" style={{ height: '200vh' }}>
      <div className="your-pin">{/* content */}</div>
    </section>
  )
}
```

Then: (1) import + place it in `app/page.tsx` inside `<main>`, in the right scroll order; (2) update `TOTAL_HEIGHT` (and the per-act offset array) in `BottomNav.tsx` + `NavigationWhisper.tsx` so nav targets stay correct; (3) `data-act` is needed for nav/scroll tracking.

**Z-index layer stack** (from `page.tsx`):
```
z-0   MainCanvas      (Three.js, dynamic import, ssr:false)
z-1   GridPattern     (canvas grid, mouse ripple + scroll wave)
z-10  <main> Acts     (the scroll content)
z-30  Interface       (NavigationWhisper, ScrollProgress, SoundToggle, BackToTop, BottomNav) — pointer-events-none parent
z-50  CursorEntity    (canvas blob cursor; body is cursor:none on desktop)
z-100 LoadingRitual   (2500-particle "BUILDA" intro; calls onComplete → ScrollTrigger.refresh())
```

## Reusable Components

- `components/ui/ScreenFrame.tsx` — browser/device-framed preview. Props: `title, category, imageSrc?, aspectRatio('16/9'|'4/3'|'9/16'), variant('browser'|'device'|'minimal'), isActive`.
- `components/ui/GlassButton.tsx` — glass button w/ shimmer + magnetic pull. Props: `variant('default'|'primary'|'outline'), size('sm'|'md'|'lg'), href?, onClick?`.
- `components/ui/GlassCard.tsx` — frosted container.
- `components/animations/` — `ScrollReveal`, `TextReveal`, `MagneticWrapper`, `ParallaxLayer` (reusable GSAP wrappers).
- `hooks/` — `useScrollProgress` (Lenis init), `useMouse`, `useMediaQuery` (sets `isMobile`), `useLerpedValue`.
- `lib/gsap-config.ts` — registers ScrollTrigger, sets defaults (`ease: power3.out`, `duration: 1`). **Import ScrollTrigger from here, not from gsap directly**, so plugins register once.

**Interaction wiring:** add `data-cursor="magnetic"` to any element to make the custom cursor attract to it. `data-act="..."` marks sections for nav tracking.

## Customization Checklist

1. **Branding:** `app/layout.tsx` metadata (title/description/OG), `HeroAct` title text, the `"BUILDA"` word in `components/interface/LoadingRitual.tsx`, `ContactAct` email + socials.
2. **Palette / accent:** swap the 4 colors in `tailwind.config.ts` AND the matching `--color-*` `:root` vars in `app/globals.css` (keep them in sync — both define the same hexes). There is no token literally named "accent": `chalk` (`#E7E5DF`) is the highlight/active color, `carbon` (`#393E41`) the secondary UI accent. Change whichever plays the accent role for you.
3. **Fonts:** change the three `next/font/google` imports in `app/layout.tsx`. They map to `fontFamily` keys in `tailwind.config.ts`: `display`→`--font-syne`, `body`→`--font-inter`, `mono`→`--font-space-mono`. Keep the CSS-variable names, or rename and update `tailwind.config.ts` to match.
4. **Content:** edit the inline data arrays at the top of each Act (`services`, `projects`, `stats`). NOTE: the live acts render from these inline arrays — they are NOT yet wired to the CMS. The `/api/public/*` routes and `/admin` exist and work, but connecting an Act to live data is a DIY step (replace the inline array with a `fetch('/api/public/...')`).
5. **Scroll length:** each Act sets its own `height`/pin duration inline (e.g. `style={{ height: '300vh' }}`). The total is `1240vh` = sum of the acts. IMPORTANT: this total is hardcoded as `TOTAL_HEIGHT = 1240` in `components/interface/BottomNav.tsx` and `components/interface/NavigationWhisper.tsx` (used to compute nav scroll-to positions). If you add/remove a section or change any act height, update those two constants and the per-act offsets in `NavigationWhisper`, or the nav dots will jump to the wrong place.

## Common Gotchas

| Symptom | Cause / Fix |
|---|---|
| Pins jump / misaligned on load | Pin positions calc before fonts/canvas settle. `page.tsx` calls `ScrollTrigger.refresh()` after load + 500ms — keep that. Call `refresh()` after any layout-changing async work. |
| Animations don't fire / double-fire | Always wrap Act animations in `gsap.context(() => {...}, sectionRef)` and `return () => ctx.revert()`. Import `ScrollTrigger` from `lib/gsap-config`, never re-register. |
| Scroll feels native, not smooth | `useScrollProgress()` must run once (it's in `page.tsx`); it boots Lenis and bridges it to the GSAP ticker + `ScrollTrigger.update()`. |
| Default cursor visible | Intended: `body { cursor: none }` on desktop + `CursorEntity`. On touch, the custom cursor is suppressed. |
| `/admin` or `/api` 500s | Prisma not generated / DB unreachable. Run `npx prisma generate && npx prisma db push`, check `DATABASE_URL`. |
| Three.js SSR error | `MainCanvas`/`GridPattern` must stay `dynamic(..., { ssr: false })`. |
| Can't reach admin / login | Login page is `/admin/login`. Seeded owner creds (`prisma/seed.ts`): `admin@builda.studio` / `admin123` — change before deploying. JWT is stored in a cookie; `JWT_SECRET` must be set. |

## Deploying

Standard Next.js 14 deploy (Vercel is the easy path):

- Set `DATABASE_URL` and `JWT_SECRET` as host env vars.
- Prisma client must be generated at build time. There is no `postinstall` hook yet — add one, or generate in build:
  ```json
  "scripts": { "build": "prisma generate && next build" }
  ```
  (or add `"postinstall": "prisma generate"`).
- For a real database, prefer migrations over `db push`: `npx prisma migrate dev` locally, `npx prisma migrate deploy` on the host. `db push` is fine for prototyping only.
- Build/run: `npm run build` then `npm run start`.
- After deploy, if pins are misaligned, see the `ScrollTrigger.refresh()` gotcha above (already wired in `page.tsx`).

## File Map

```
template/
  app/            layout.tsx, page.tsx, globals.css, admin/ (CMS UI), api/ (REST + /api/public/*)
  components/     acts/ (6 sections) ui/ animations/ interface/ canvas/ 3d/ experience/ sections/
  hooks/          useScrollProgress, useMouse, useMediaQuery, useLerpedValue
  lib/            store.ts (Zustand), gsap-config.ts, auth.ts, admin-auth.ts, prisma.ts, constants.ts, audio.ts
  prisma/         schema.prisma (User/Project/Service/Stat/SiteSetting/ActivityLog), seed.ts
  tailwind.config.ts, next.config.js (transpiles three), postcss.config.js, tsconfig.json, .env.example
```

`components/sections/` and `components/experience/` are an earlier/alternate component set kept for reference; the live site uses `components/acts/`.
