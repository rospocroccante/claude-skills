'use client'

import { useStore } from '@/lib/store'

export default function ScrollProgress() {
  const progress = useStore((s) => s.scrollProgress)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none" style={{ height: 2 }}>
      {/* Background track */}
      <div className="absolute inset-0" style={{ background: 'rgba(57, 62, 65, 0.1)' }} />
      {/* Progress bar */}
      <div
        className="absolute left-0 top-0 h-full"
        style={{
          width: `${progress * 100}%`,
          background: 'linear-gradient(90deg, #393E41, #D3D0CB, #E7E5DF)',
          opacity: 0.3,
          transition: 'width 0.1s linear',
        }}
      />
    </div>
  )
}
