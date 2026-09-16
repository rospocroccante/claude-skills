'use client'

import { useRef, useEffect, useState } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap-config'
import ScreenFrame from '@/components/ui/ScreenFrame'

const PROJECTS = [
  {
    num: '01',
    title: 'NeuralFlow',
    category: 'AI Platform',
    year: '2025',
    desc: 'An intelligent dashboard that turns raw data into strategic decisions in real-time.',
    tags: ['GPT-4', 'Python', 'React', 'PostgreSQL'],
  },
  {
    num: '02',
    title: 'AutoScale',
    category: 'Automation SaaS',
    year: '2025',
    desc: 'End-to-end workflow automation that eliminated 80% of manual processes for enterprise clients.',
    tags: ['Node.js', 'AWS Lambda', 'Zapier API', 'Redis'],
  },
  {
    num: '03',
    title: 'DataPulse',
    category: 'Analytics Dashboard',
    year: '2024',
    desc: 'Real-time analytics with predictive modeling. 200ms response time on 10M+ data points.',
    tags: ['Next.js', 'D3.js', 'ClickHouse', 'WebSocket'],
  },
  {
    num: '04',
    title: 'SynthOS',
    category: 'Operating System UI',
    year: '2024',
    desc: 'A next-gen operating system interface designed for AI-first computing.',
    tags: ['Rust', 'WebGPU', 'Figma', 'TypeScript'],
  },
]

export default function ProjectsAct() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const projectRefs = useRef<(HTMLDivElement | null)[]>([])
  const frameRefs = useRef<(HTMLDivElement | null)[]>([])
  const textRefs = useRef<(HTMLDivElement | null)[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const [visibleIndex, setVisibleIndex] = useState(0)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      const section = sectionRef.current!
      const totalProjects = PROJECTS.length

      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        pin: '.projects-pin-container',
        pinSpacing: false,
        onUpdate: (self) => {
          const progress = self.progress
          const idx = Math.min(
            totalProjects - 1,
            Math.floor(progress * totalProjects)
          )
          setVisibleIndex(idx)
        },
      })

      projectRefs.current.forEach((projectEl, i) => {
        if (!projectEl) return

        const frameEl = frameRefs.current[i]
        const textEl = textRefs.current[i]
        if (!frameEl || !textEl) return

        const isLeftFrame = i % 2 === 0
        const enterFromX = isLeftFrame ? -100 : 100
        const exitToX = isLeftFrame ? -60 : 60

        const projectStart = i / totalProjects
        const projectEnd = (i + 1) / totalProjects

        const appearStart = projectStart
        const appearEnd = projectStart + (projectEnd - projectStart) * 0.2

        const disappearStart = projectEnd - (projectEnd - projectStart) * 0.2
        const disappearEnd = projectEnd

        // --- Frame enter ---
        gsap.fromTo(
          frameEl,
          { x: enterFromX, opacity: 0, scale: 0.95 },
          {
            x: 0, opacity: 1, scale: 1, ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: `${appearStart * 100}% top`,
              end: `${appearEnd * 100}% top`,
              scrub: true,
            },
          }
        )

        // --- Text enter with stagger ---
        const textChildren = textEl.children
        gsap.fromTo(
          textChildren,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, stagger: 0.05, ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: `${appearStart * 100}% top`,
              end: `${appearEnd * 100}% top`,
              scrub: true,
            },
          }
        )

        // --- Exit animations (skip for last project) ---
        if (i < totalProjects - 1) {
          gsap.fromTo(
            frameEl,
            { x: 0, opacity: 1 },
            {
              x: -exitToX, opacity: 0, ease: 'none',
              immediateRender: false,
              scrollTrigger: {
                trigger: section,
                start: `${disappearStart * 100}% top`,
                end: `${disappearEnd * 100}% top`,
                scrub: true,
              },
            }
          )

          gsap.fromTo(
            textChildren,
            { opacity: 1, y: 0 },
            {
              opacity: 0, y: -20, ease: 'none',
              immediateRender: false,
              scrollTrigger: {
                trigger: section,
                start: `${disappearStart * 100}% top`,
                end: `${disappearEnd * 100}% top`,
                scrub: true,
              },
            }
          )
        }
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ height: '400vh', zIndex: 3 }}
    >
      <div className="projects-pin-container relative h-screen w-full overflow-hidden" style={{
        background: 'radial-gradient(ellipse 130% 130% at 50% 50%, rgba(20,22,24,0.88) 30%, rgba(20,22,24,0.55) 100%)',
      }}>
        {PROJECTS.map((project, i) => {
          const isLeftFrame = i % 2 === 0

          return (
            <div
              key={project.num}
              ref={(el) => {
                projectRefs.current[i] = el
              }}
              className="absolute inset-0 flex items-center"
              style={{
                padding: isMobile ? '20px' : '0 5vw',
                overflow: 'hidden',
                zIndex: i === visibleIndex ? 2 : 1,
                pointerEvents: i === visibleIndex ? 'auto' : 'none',
              }}
            >
              <div
                className="flex w-full items-center"
                style={{
                  flexDirection: isMobile ? 'column' : (isLeftFrame ? 'row' : 'row-reverse'),
                  gap: isMobile ? 12 : 32,
                  justifyContent: isMobile ? 'center' : 'flex-start',
                }}
              >
                {/* Frame side — compact on mobile, full on desktop */}
                <div
                  ref={(el) => {
                    frameRefs.current[i] = el
                  }}
                  className="flex-shrink-0"
                  style={{
                    width: isMobile ? '100%' : '55%',
                    opacity: 0,
                  }}
                >
                  <ScreenFrame
                    variant="browser"
                    title={project.title}
                    category={project.category}
                    isActive={true}
                    className="w-full"
                    style={{ opacity: 1 }}
                  />
                </div>

                {/* Text side - card layout on mobile */}
                <div
                  ref={(el) => {
                    textRefs.current[i] = el
                  }}
                  className="flex flex-col justify-center"
                  style={{
                    width: isMobile ? '100%' : '45%',
                    paddingLeft: isMobile ? 0 : (isLeftFrame ? '3vw' : 0),
                    paddingRight: isMobile ? 0 : (isLeftFrame ? 0 : '3vw'),
                    ...(isMobile ? {
                      background: 'rgba(20, 22, 23, 0.6)',
                      border: '1px solid rgba(57, 62, 65, 0.15)',
                      borderRadius: 16,
                      padding: '20px 20px',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                    } : {}),
                  }}
                >
                  {/* Decorative number — hidden on mobile for compactness */}
                  {!isMobile && (
                    <div
                      style={{
                        fontFamily: 'var(--font-syne), Syne, sans-serif',
                        fontSize: '8vw',
                        fontWeight: 800,
                        color: '#393E41',
                        opacity: 0.15,
                        lineHeight: 1,
                        marginBottom: '-1vw',
                        userSelect: 'none',
                      }}
                    >
                      {project.num}
                    </div>
                  )}

                  {/* Title */}
                  <h3
                    style={{
                      fontFamily: 'var(--font-syne), Syne, sans-serif',
                      fontSize: isMobile ? 'clamp(28px, 8vw, 44px)' : 'clamp(36px, 4vw, 56px)',
                      fontWeight: 700,
                      color: '#E7E5DF',
                      lineHeight: 1.1,
                      margin: 0,
                    }}
                  >
                    {project.title}
                  </h3>

                  {/* Category + Year */}
                  <div
                    style={{
                      fontFamily: 'var(--font-space-mono), "Space Mono", monospace',
                      fontSize: isMobile ? 10 : 12,
                      textTransform: 'uppercase',
                      letterSpacing: '0.15em',
                      color: '#D3D0CB',
                      opacity: 0.4,
                      marginTop: 8,
                    }}
                  >
                    {project.category} / {project.year}
                  </div>

                  {/* Description */}
                  <p
                    style={{
                      fontFamily: 'var(--font-inter), Inter, sans-serif',
                      fontSize: isMobile ? 14 : 15,
                      fontWeight: 300,
                      color: '#D3D0CB',
                      opacity: 0.6,
                      lineHeight: 1.6,
                      maxWidth: 400,
                      margin: 0,
                      marginTop: 12,
                    }}
                  >
                    {project.desc}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5" style={{ marginTop: 14 }}>
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontFamily: 'var(--font-space-mono), "Space Mono", monospace',
                          fontSize: isMobile ? 9 : 11,
                          color: '#D3D0CB',
                          border: '1px solid rgba(57, 62, 65, 0.4)',
                          borderRadius: 999,
                          padding: isMobile ? '4px 10px' : '5px 14px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* CTA link */}
                  <div style={{ marginTop: 18 }}>
                    <a
                      href="#"
                      className="group relative inline-block"
                      style={{
                        fontFamily: 'var(--font-space-mono), "Space Mono", monospace',
                        fontSize: 12,
                        color: '#E7E5DF',
                        textDecoration: 'none',
                      }}
                    >
                      View project &rarr;
                      <span
                        className="absolute bottom-0 left-0 h-px w-0 transition-all duration-300 group-hover:w-full"
                        style={{ backgroundColor: '#E7E5DF' }}
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
