'use client'

import { useStore } from '@/lib/store'

export default function BackToTop() {
  const scrollProgress = useStore((s) => s.scrollProgress)
  const isMobile = useStore((s) => s.isMobile)
  const isVisible = scrollProgress > 0.05

  // Hide on mobile - BottomNav Home button handles this
  if (isMobile) return null

  function handleClick() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      onClick={handleClick}
      className="fixed z-30 flex items-center justify-center rounded-full transition-all duration-300"
      style={{
        bottom: 72,
        right: 24,
        width: 40,
        height: 40,
        border: '1px solid rgba(57, 62, 65, 0.4)',
        background: 'rgba(30, 34, 36, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        cursor: 'pointer',
      }}
      data-cursor="magnetic"
      aria-label="Back to top"
    >
      {/* Upward chevron */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="back-to-top-arrow transition-colors duration-300"
      >
        <path
          d="M3 9L7 5L11 9"
          stroke="#D3D0CB"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <style jsx>{`
        button:hover {
          border-color: rgba(211, 208, 203, 0.2) !important;
        }
        button:hover .back-to-top-arrow path {
          stroke: #E7E5DF;
        }
      `}</style>
    </button>
  )
}
