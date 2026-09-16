'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

// Note: SplitText is a GSAP Club plugin.
// We implement text splitting manually in TextReveal component instead.

// Default GSAP settings
gsap.defaults({
  ease: 'power3.out',
  duration: 1,
})

// ScrollTrigger defaults
ScrollTrigger.defaults({
  toggleActions: 'play none none none',
})

export { gsap, ScrollTrigger }
