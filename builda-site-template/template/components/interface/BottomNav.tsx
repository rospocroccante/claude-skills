'use client'

import { useStore } from '@/lib/store'

const SECTIONS = [
  { label: 'Home', vh: 0 },
  { label: 'Services', vh: 100 },
  { label: 'Work', vh: 400 },
  { label: 'About', vh: 950 },
  { label: 'Contact', vh: 1120 },
] as const

const TOTAL_HEIGHT = 1240 // vh

export default function BottomNav() {
  const scrollProgress = useStore((s) => s.scrollProgress)
  const isMobile = useStore((s) => s.isMobile)
  const currentVh = scrollProgress * TOTAL_HEIGHT

  // Determine active section
  let activeIndex = 0
  for (let i = SECTIONS.length - 1; i >= 0; i--) {
    if (currentVh >= SECTIONS[i].vh) {
      activeIndex = i
      break
    }
  }

  function handleClick(sectionVh: number) {
    const vh = window.innerHeight / 100
    const targetScroll = sectionVh * vh
    window.scrollTo({ top: targetScroll, behavior: 'smooth' })
  }

  return (
    <nav
      className="fixed z-30 left-1/2 bottom-nav-bar"
      style={{
        bottom: isMobile ? 'max(12px, env(safe-area-inset-bottom, 12px))' : 24,
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        padding: isMobile ? '8px 16px' : '8px 20px',
        borderRadius: 999,
        border: '1px solid rgba(57, 62, 65, 0.3)',
        background: 'rgba(30, 34, 36, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        pointerEvents: 'auto',
      }}
    >
      {SECTIONS.map((section, i) => (
        <span key={section.label} className="flex items-center">
          <button
            onClick={() => handleClick(section.vh)}
            className="bottom-nav-item transition-colors duration-300"
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: isMobile ? 10 : 10,
              textTransform: 'uppercase',
              letterSpacing: isMobile ? '0.06em' : '0.1em',
              color: activeIndex === i ? '#E7E5DF' : '#393E41',
              background: 'none',
              border: 'none',
              padding: isMobile ? '4px 0' : '2px 0',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              minHeight: isMobile ? 32 : undefined,
              display: 'flex',
              alignItems: 'center',
            }}
            data-cursor="hover"
          >
            {section.label}
          </button>
          {i < SECTIONS.length - 1 && (
            <span
              className="select-none"
              style={{
                color: 'rgba(57, 62, 65, 0.3)',
                fontFamily: "'Space Mono', monospace",
                fontSize: isMobile ? 10 : 10,
                margin: isMobile ? '0 7px' : '0 10px',
              }}
              aria-hidden="true"
            >
              &middot;
            </span>
          )}
        </span>
      ))}

      <style jsx>{`
        .bottom-nav-item:hover {
          color: #D3D0CB !important;
        }
      `}</style>
    </nav>
  )
}
