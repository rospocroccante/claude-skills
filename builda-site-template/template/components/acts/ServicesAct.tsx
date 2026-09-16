'use client'

import { useRef, useEffect, useState } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap-config'
import ScreenFrame from '@/components/ui/ScreenFrame'
import { useStore } from '@/lib/store'

const SERVICES = [
  {
    num: '01',
    title: 'Intelligence',
    desc: 'Custom AI solutions that transform raw data into strategic advantage.',
    tags: ['LLM Integration', 'Computer Vision', 'NLP', 'Predictive Models'],
    frame: { title: 'NeuralFlow Dashboard', category: 'AI Platform' },
  },
  {
    num: '02',
    title: 'Automation',
    desc: 'Systems that scale without friction. From internal tools to full process automation.',
    tags: ['Workflow Automation', 'RPA', 'API Orchestration', 'CI/CD'],
    frame: { title: 'AutoScale Pipeline', category: 'Automation' },
  },
  {
    num: '03',
    title: 'SaaS',
    desc: 'From zero to market. We architect, design and ship platforms built for growth.',
    tags: ['Product Strategy', 'Cloud Architecture', 'Subscription Models', 'Analytics'],
    frame: { title: 'DataPulse Analytics', category: 'Dashboard' },
  },
  {
    num: '04',
    title: 'Software',
    desc: 'Pixel-perfect interfaces powered by robust engineering.',
    tags: ['React / Next.js', 'Full-Stack', 'Mobile Apps', 'DevOps'],
    frame: { title: 'SynthOS Interface', category: 'Operating System' },
  },
]

export default function ServicesAct() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      const section = sectionRef.current!

      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        pin: '.services-pin-container',
        pinSpacing: false,
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress
          let index: number
          if (progress < 0.25) {
            index = 0
          } else if (progress < 0.5) {
            index = 1
          } else if (progress < 0.75) {
            index = 2
          } else {
            index = 3
          }

          setActiveIndex((prev) => {
            if (prev !== index) {
              useStore.getState().setActiveService(index)
              return index
            }
            return prev
          })
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ height: '300vh', zIndex: 2 }}
    >
      <div
        className="services-pin-container relative w-full h-screen overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse 130% 130% at 50% 50%, rgba(20,22,24,0.88) 30%, rgba(20,22,24,0.55) 100%)',
        }}
      >
        <div
          className="h-full w-full flex items-center"
          style={{
            flexDirection: isMobile ? 'column' : 'row',
            padding: isMobile ? '0 24px' : '0 clamp(40px, 5vw, 80px)',
            justifyContent: 'center',
            gap: isMobile ? 16 : 0,
          }}
        >
          {/* Mobile preview frame */}
          {isMobile && (
            <div
              style={{
                width: '100%',
                flexShrink: 0,
                borderRadius: 10,
                border: '1px solid rgba(57,62,65,0.2)',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              }}
            >
              {/* Browser bar */}
              <div
                style={{
                  height: 24,
                  background: '#1E2224',
                  borderBottom: '1px solid rgba(57,62,65,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 8px',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', gap: 5 }}>
                  {[0, 1, 2].map((d) => (
                    <div
                      key={d}
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: '#393E41',
                      }}
                    />
                  ))}
                </div>
                <span
                  style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: 8,
                    color: 'rgba(211,208,203,0.4)',
                    fontFamily: '"Space Mono", monospace',
                  }}
                >
                  {SERVICES[activeIndex].frame.title}
                </span>
              </div>
              {/* Placeholder content */}
              <div
                style={{
                  aspectRatio: '21/9',
                  background: 'linear-gradient(135deg, #1E2224, #252829)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage:
                      'repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(57,62,65,0.05) 10px, rgba(57,62,65,0.05) 11px)',
                  }}
                />
                <div
                  className="mobile-scan-line"
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: 1,
                    background:
                      'linear-gradient(to right, transparent, rgba(211,208,203,0.06), transparent)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: 'rgba(57,62,65,0.3)',
                      fontFamily: '"Space Mono", monospace',
                    }}
                  >
                    Screenshot
                  </span>
                  <span
                    style={{
                      fontSize: 8,
                      color: 'rgba(57,62,65,0.2)',
                      fontFamily: '"Space Mono", monospace',
                      marginTop: 2,
                    }}
                  >
                    {SERVICES[activeIndex].frame.category}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Left side: service titles */}
          <div
            className="flex flex-col justify-center"
            style={{
              width: isMobile ? '100%' : '55%',
              gap: isMobile ? 4 : 8,
              overflow: 'hidden',
            }}
          >
            {SERVICES.map((service, i) => {
              const isActive = i === activeIndex

              return (
                <div
                  key={service.num}
                  className="transition-all duration-500"
                  style={{
                    opacity: isActive ? 1 : (isMobile ? 0.25 : 0.4),
                  }}
                >
                  {/* Service number - hidden on mobile for inactive */}
                  <span
                    style={{
                      fontFamily: '"Space Mono", monospace',
                      fontSize: isMobile ? 9 : 12,
                      textTransform: 'uppercase',
                      color: '#393E41',
                      letterSpacing: '0.1em',
                      display: (isMobile && !isActive) ? 'none' : 'block',
                      marginBottom: 2,
                    }}
                  >
                    {service.num}
                  </span>

                  {/* Service title */}
                  <h3
                    className="transition-all duration-500"
                    style={{
                      fontFamily: 'Syne, sans-serif',
                      fontSize: isMobile
                        ? (isActive ? 'clamp(28px, 9vw, 44px)' : 'clamp(18px, 5vw, 24px)')
                        : 'clamp(36px, 5vw, 72px)',
                      fontWeight: 700,
                      lineHeight: 1,
                      letterSpacing: '-0.02em',
                      color: isActive ? '#E7E5DF' : '#393E41',
                      textShadow: isActive
                        ? '0 0 40px rgba(227,229,223,0.15)'
                        : 'none',
                      margin: 0,
                    }}
                  >
                    {service.title}
                  </h3>

                  {/* Description and tags (only for active) */}
                  <div
                    className="overflow-hidden transition-all duration-500"
                    style={{
                      maxHeight: isActive ? (isMobile ? 140 : 140) : 0,
                      opacity: isActive ? 1 : 0,
                      marginTop: isActive ? (isMobile ? 10 : 6) : 0,
                    }}
                  >
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: isMobile ? 14 : 14,
                        fontWeight: 300,
                        color: '#D3D0CB',
                        opacity: 0.6,
                        lineHeight: 1.6,
                        margin: 0,
                        marginBottom: 10,
                        maxWidth: 420,
                      }}
                    >
                      {service.desc}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {service.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full"
                          style={{
                            fontFamily: '"Space Mono", monospace',
                            fontSize: isMobile ? 9 : 10,
                            color: '#D3D0CB',
                            border: '1px solid #393E41',
                            padding: isMobile ? '4px 10px' : '3px 10px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right side: ScreenFrame (hidden on mobile) */}
          {!isMobile && (
            <div
              className="flex items-center justify-center"
              style={{
                width: '45%',
                height: '70vh',
                position: 'relative',
              }}
            >
              {SERVICES.map((service, i) => {
                const isActive = i === activeIndex
                return (
                  <div
                    key={service.num}
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      padding: '0 clamp(16px, 2vw, 40px)',
                      zIndex: isActive ? 2 : 1,
                      pointerEvents: isActive ? 'auto' : 'none',
                    }}
                  >
                    <ScreenFrame
                      title={service.frame.title}
                      category={service.frame.category}
                      isActive={isActive}
                      variant="browser"
                      aspectRatio="16/9"
                      className="w-full"
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      {/* Scan line animation for mobile preview */}
      <style jsx>{`
        @keyframes scan-line-move {
          0% {
            top: -10%;
          }
          100% {
            top: 110%;
          }
        }
        :global(.mobile-scan-line) {
          animation: scan-line-move 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}
