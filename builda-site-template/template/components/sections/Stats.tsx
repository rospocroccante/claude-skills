'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap-config'
import { STATS } from '@/lib/constants'
import GlassCard from '@/components/ui/GlassCard'

function StatItem({ stat }: { stat: (typeof STATS)[number] }) {
  const valueRef = useRef<HTMLSpanElement>(null)
  const triggered = useRef(false)

  useEffect(() => {
    const el = valueRef.current
    if (!el) return

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        if (triggered.current) return
        triggered.current = true

        const obj = { val: 0 }
        gsap.to(obj, {
          val: stat.value,
          duration: 2,
          ease: 'power2.out',
          onUpdate: () => {
            if (el) {
              el.textContent = Math.round(obj.val) + stat.suffix
            }
          },
        })
      },
    })

    return () => trigger.kill()
  }, [stat.value, stat.suffix])

  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-10">
      <span
        ref={valueRef}
        className="font-display font-extrabold mb-2 block"
        style={{
          fontSize: 'clamp(40px, 5vw, 64px)',
          background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
          backgroundSize: '200% 200%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'gradientShift 4s ease infinite',
        }}
      >
        0{stat.suffix}
      </span>
      <span
        className="font-mono text-[11px] uppercase tracking-[0.15em]"
        style={{ color: 'rgba(255, 255, 255, 0.3)' }}
      >
        {stat.label}
      </span>

      <style jsx>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  )
}

export default function Stats() {
  return (
    <section className="py-section-sm lg:py-section" style={{ padding: '40px clamp(24px, 5vw, 80px)' }}>
      <div className="max-w-[1400px] mx-auto">
        <GlassCard className="overflow-hidden rounded-[20px]">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className={i < STATS.length - 1 ? 'border-b lg:border-b-0 lg:border-r' : ''}
                style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
              >
                <StatItem stat={stat} />
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </section>
  )
}
