'use client'

import { useState } from 'react'
import { useStore, ACT_NAMES } from '@/lib/store'

export default function NavigationWhisper() {
  const isMobile = useStore((s) => s.isMobile)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Approximate scroll positions for each act (based on 1240vh total)
  // Hero(0) + Services(100) + Projects(400) + Stats(800) + About(950) + Contact(1120)
  const ACT_SCROLL_POSITIONS = [0, 100, 400, 800, 950, 1120]

  function handleClick(actIndex: number) {
    const vh = window.innerHeight / 100
    const targetScroll = ACT_SCROLL_POSITIONS[actIndex] * vh
    window.scrollTo({ top: targetScroll, behavior: 'smooth' })
  }

  // Determine active act based on scroll position
  const scrollProgress = useStore((s) => s.scrollProgress)
  const totalHeight = 1240 // vh
  const currentVh = scrollProgress * totalHeight
  let activeAct = 0
  for (let i = ACT_SCROLL_POSITIONS.length - 1; i >= 0; i--) {
    if (currentVh >= ACT_SCROLL_POSITIONS[i]) {
      activeAct = i
      break
    }
  }

  // Hide on mobile - BottomNav handles mobile navigation
  if (isMobile) return null

  return (
    <div
      className="fixed z-30 flex items-center"
      style={{
        right: 24, top: '50%', transform: 'translateY(-50%)',
        flexDirection: 'column', gap: 16, pointerEvents: 'auto',
      }}
    >
      {/* Connecting line */}
      <div className="absolute"
        style={{ width: 1, height: 'calc(100% - 20px)', top: 10, background: 'rgba(57, 62, 65, 0.05)' }}
      />

      {ACT_NAMES.map((name, i) => (
        <div key={name} className="relative flex items-center">
          {hoveredIndex === i && (
            <span className="absolute right-8 font-mono uppercase whitespace-nowrap"
              style={{ fontSize: 10, letterSpacing: '0.1em', color: '#D3D0CB', animation: 'fadeIn 0.2s ease' }}>
              {name}
            </span>
          )}
          <button
            onClick={() => handleClick(i)}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="relative flex items-center justify-center"
            style={{ width: 20, height: 20 }}
            data-cursor="hover"
          >
            {activeAct === i && (
              <span className="absolute rounded-full"
                style={{
                  width: 20, height: 20,
                  border: '1px solid rgba(211, 208, 203, 0.2)',
                  animation: 'pulse-ring 2s ease-out infinite',
                }}
              />
            )}
            <span className="rounded-full transition-all duration-300"
              style={{
                width: activeAct === i ? 10 : 6,
                height: activeAct === i ? 10 : 6,
                background: activeAct === i ? '#E7E5DF' : 'rgba(57, 62, 65, 0.3)',
              }}
            />
          </button>
        </div>
      ))}

      <style jsx>{`
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(5px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
