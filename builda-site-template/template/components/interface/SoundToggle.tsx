'use client'

import { useEffect } from 'react'
import { useStore } from '@/lib/store'
import { audioEngine } from '@/lib/audio'

export default function SoundToggle() {
  const isSoundOn = useStore((s) => s.isSoundOn)
  const toggleSound = useStore((s) => s.toggleSound)
  const isMobile = useStore((s) => s.isMobile)

  useEffect(() => {
    if (isSoundOn) {
      audioEngine.play()
    } else {
      audioEngine.stop()
    }
  }, [isSoundOn])

  useEffect(() => {
    return () => audioEngine.dispose()
  }, [])

  // Hide on mobile - too small for touch and clutters the UI
  if (isMobile) return null

  return (
    <button
      onClick={toggleSound}
      className="fixed z-30 flex items-center justify-center rounded-full transition-all duration-300"
      style={{
        bottom: 24, left: 24,
        width: 24, height: 24,
        border: '1px solid rgba(57, 62, 65, 0.4)',
        background: 'rgba(57, 62, 65, 0.15)',
        pointerEvents: 'auto',
      }}
      data-cursor="hover"
      aria-label={isSoundOn ? 'Mute sound' : 'Enable sound'}
    >
      <div className="flex items-end gap-[2px]" style={{ height: 10 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-full transition-all duration-300"
            style={{
              width: 2,
              height: isSoundOn ? [4, 8, 5][i] : 3,
              background: isSoundOn ? 'rgba(211, 208, 203, 0.6)' : 'rgba(57, 62, 65, 0.3)',
              animation: isSoundOn ? `soundBar ${0.6 + i * 0.15}s ease-in-out infinite alternate` : 'none',
            }}
          />
        ))}
      </div>
      <style jsx>{`
        @keyframes soundBar {
          from { height: 3px; }
          to { height: 10px; }
        }
      `}</style>
    </button>
  )
}
