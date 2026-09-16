'use client'

import { create } from 'zustand'

export const ACT_NAMES = ['Hero', 'Services', 'Projects', 'Stats', 'About', 'Contact'] as const

export type CursorState = 'default' | 'hover' | 'text' | 'drag' | 'explore' | 'magnetic'

interface BuildaStore {
  scrollProgress: number
  scrollVelocity: number
  setScrollProgress: (v: number) => void
  setScrollVelocity: (v: number) => void

  mouse: { x: number; y: number }
  mouseNormalized: { x: number; y: number }
  setMouse: (x: number, y: number) => void

  cursorState: CursorState
  setCursorState: (state: CursorState) => void

  isLoaded: boolean
  isSoundOn: boolean
  isMobile: boolean
  setLoaded: (v: boolean) => void
  toggleSound: () => void
  setMobile: (v: boolean) => void

  activeService: number | null
  activeProject: number | null
  setActiveService: (i: number | null) => void
  setActiveProject: (i: number | null) => void
}

export const useStore = create<BuildaStore>((set) => ({
  scrollProgress: 0,
  scrollVelocity: 0,
  setScrollProgress: (v) => set({ scrollProgress: v }),
  setScrollVelocity: (v) => set({ scrollVelocity: v }),

  mouse: { x: 0, y: 0 },
  mouseNormalized: { x: 0, y: 0 },
  setMouse: (x, y) => {
    const nx = (x / (typeof window !== 'undefined' ? window.innerWidth : 1)) * 2 - 1
    const ny = -((y / (typeof window !== 'undefined' ? window.innerHeight : 1)) * 2 - 1)
    set({ mouse: { x, y }, mouseNormalized: { x: nx, y: ny } })
  },

  cursorState: 'default',
  setCursorState: (state) => set({ cursorState: state }),

  isLoaded: false,
  isSoundOn: false,
  isMobile: false,
  setLoaded: (v) => set({ isLoaded: v }),
  toggleSound: () => set((s) => ({ isSoundOn: !s.isSoundOn })),
  setMobile: (v) => set({ isMobile: v }),

  activeService: null,
  activeProject: null,
  setActiveService: (i) => set({ activeService: i }),
  setActiveProject: (i) => set({ activeProject: i }),
}))
