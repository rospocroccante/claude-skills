'use client'

import { useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import { useMouse } from '@/hooks/useMouse'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import LoadingRitual from '@/components/interface/LoadingRitual'
import CursorEntity from '@/components/interface/CursorEntity'
import NavigationWhisper from '@/components/interface/NavigationWhisper'
import ScrollProgress from '@/components/interface/ScrollProgress'
import SoundToggle from '@/components/interface/SoundToggle'
import BackToTop from '@/components/interface/BackToTop'
import BottomNav from '@/components/interface/BottomNav'
import { useStore } from '@/lib/store'
import { ScrollTrigger } from '@/lib/gsap-config'

import HeroAct from '@/components/acts/HeroAct'
import ServicesAct from '@/components/acts/ServicesAct'
import ProjectsAct from '@/components/acts/ProjectsAct'
import StatsAct from '@/components/acts/StatsAct'
import AboutAct from '@/components/acts/AboutAct'
import ContactAct from '@/components/acts/ContactAct'

const MainCanvas = dynamic(() => import('@/components/canvas/MainCanvas'), {
  ssr: false,
  loading: () => null,
})

const GridPattern = dynamic(() => import('@/components/canvas/GridPattern'), {
  ssr: false,
  loading: () => null,
})

export default function Home() {
  useScrollProgress()
  useMouse()
  useMediaQuery()

  const isLoaded = useStore((s) => s.isLoaded)

  const handleLoadComplete = useCallback(() => {
    useStore.getState().setLoaded(true)
    // Refresh ScrollTrigger after loading overlay unmounts so GSAP recalculates pin positions
    setTimeout(() => ScrollTrigger.refresh(), 100)
  }, [])

  // Re-refresh ScrollTrigger when dynamic components finish loading
  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => ScrollTrigger.refresh(), 500)
      return () => clearTimeout(timer)
    }
  }, [isLoaded])

  return (
    <>
      {/* Layer 0: Three.js Canvas (fixed background) */}
      <MainCanvas />

      {/* Layer 1: Grid Pattern (fixed, z-index 1) */}
      <GridPattern />

      {/* Layer 2: Scrollytelling Acts (1240vh total) */}
      <main className="relative z-10">
        <HeroAct />
        <ServicesAct />
        <ProjectsAct />
        <StatsAct />
        <AboutAct />
        <ContactAct />
      </main>

      {/* Layer 3: Interface Overlay (fixed, z-30) */}
      <div className="fixed inset-0 z-30 pointer-events-none">
        <NavigationWhisper />
        <ScrollProgress />
        <SoundToggle />
        <BackToTop />
        <BottomNav />
      </div>

      {/* Layer 4: Cursor */}
      <CursorEntity />

      {/* Layer 5: Loading Ritual */}
      <LoadingRitual onComplete={handleLoadComplete} />
    </>
  )
}
