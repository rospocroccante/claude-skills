'use client'

import { useRef, useCallback } from 'react'
import { gsap } from '@/lib/gsap-config'
import { PROJECTS } from '@/lib/constants'
import TextReveal from '@/components/animations/TextReveal'
import ScrollReveal from '@/components/animations/ScrollReveal'
import SectionDivider from '@/components/ui/SectionDivider'

function ProjectRow({ project }: { project: (typeof PROJECTS)[number] }) {
  const rowRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLSpanElement>(null)
  const arrowRef = useRef<HTMLSpanElement>(null)

  const handleMouseEnter = useCallback(() => {
    const row = rowRef.current
    if (!row) return
    gsap.to(row, { x: 16, duration: 0.4, ease: 'power2.out' })
    gsap.to(dotRef.current, {
      scale: 1.8,
      boxShadow: `0 0 20px ${project.color}60`,
      duration: 0.3,
    })
    gsap.to(arrowRef.current, { x: 10, rotation: -45, duration: 0.3 })
    gsap.to(previewRef.current, { opacity: 1, scale: 1, duration: 0.3 })
  }, [project.color])

  const handleMouseLeave = useCallback(() => {
    gsap.to(rowRef.current, { x: 0, duration: 0.4, ease: 'power2.out' })
    gsap.to(dotRef.current, {
      scale: 1,
      boxShadow: '0 0 0px transparent',
      duration: 0.3,
    })
    gsap.to(arrowRef.current, { x: 0, rotation: 0, duration: 0.3 })
    gsap.to(previewRef.current, { opacity: 0, scale: 0.9, duration: 0.2 })
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const preview = previewRef.current
    if (!preview) return
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    gsap.to(preview, {
      x: e.clientX - rect.left - 150,
      y: e.clientY - rect.top - 200,
      duration: 0.4,
      ease: 'power2.out',
    })
  }, [])

  return (
    <div
      className="relative"
      onMouseMove={handleMouseMove}
    >
      <div
        ref={rowRef}
        className="flex items-center justify-between py-8 md:py-10 px-4 cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        data-cursor="view"
      >
        {/* Left: dot + title */}
        <div className="flex items-center gap-4 md:gap-6">
          <span
            ref={dotRef}
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: project.color }}
          />
          <h3
            className="font-display font-semibold"
            style={{ fontSize: 'clamp(32px, 5vw, 64px)' }}
          >
            {project.title}
          </h3>
        </div>

        {/* Right: category + year + arrow */}
        <div className="hidden md:flex items-center gap-6">
          <span className="font-mono text-[13px]" style={{ color: 'rgba(255, 255, 255, 0.35)' }}>
            {project.category}
          </span>
          <span className="font-mono text-[13px]" style={{ color: 'rgba(255, 255, 255, 0.25)' }}>
            {project.year}
          </span>
          <span ref={arrowRef} className="text-white/50 text-xl inline-block">
            →
          </span>
        </div>
      </div>

      {/* Hover preview */}
      <div
        ref={previewRef}
        className="absolute top-0 left-0 w-[300px] h-[400px] rounded-xl pointer-events-none z-20 opacity-0"
        style={{
          background: `radial-gradient(ellipse at center, ${project.color}30, transparent 70%)`,
          transform: 'scale(0.9) rotate(-3deg)',
        }}
      />
    </div>
  )
}

export default function Work() {
  return (
    <section id="work" className="py-section-sm lg:py-section" style={{ padding: '80px clamp(24px, 5vw, 80px)' }}>
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-16">
          <TextReveal tag="p" className="font-mono text-xs tracking-[0.15em] uppercase mb-4">
            Selected Projects
          </TextReveal>
          <TextReveal tag="h2" className="font-display font-bold text-5xl md:text-6xl">
            Work
          </TextReveal>
        </div>

        {/* Project List */}
        <div>
          {PROJECTS.map((project, i) => (
            <ScrollReveal key={project.title} delay={i * 0.08}>
              <SectionDivider />
              <ProjectRow project={project} />
            </ScrollReveal>
          ))}
          <SectionDivider />
        </div>
      </div>
    </section>
  )
}
