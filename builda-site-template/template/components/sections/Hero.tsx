'use client'

import { useEffect, useRef, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { gsap } from '@/lib/gsap-config'
import TextReveal from '@/components/animations/TextReveal'
import ScrollReveal from '@/components/animations/ScrollReveal'
import GlassButton from '@/components/ui/GlassButton'

const HeroScene = dynamic(() => import('@/components/3d/HeroScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-br from-accent/10 to-transparent rounded-full" />
  ),
})

export default function Hero() {
  const scrollIndicatorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollIndicatorRef.current
    if (!el) return

    const tween = gsap.to(el, {
      y: 8,
      opacity: 0.15,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
    })

    return () => {
      tween.kill()
    }
  }, [])

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ padding: '120px 0 80px' }}
    >
      <div
        className="w-full mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-0"
        style={{ padding: '0 clamp(24px, 5vw, 80px)' }}
      >
        {/* Text Content */}
        <div className="relative z-10 w-full lg:max-w-[55%]">
          {/* Eyebrow */}
          <TextReveal
            tag="p"
            delay={0.3}
            className="font-mono text-xs tracking-[0.2em] uppercase mb-6"
            style-override="true"
          >
            AI · Automation · SaaS · Software
          </TextReveal>

          {/* Title */}
          <div className="mb-6">
            <TextReveal
              tag="h1"
              delay={0.5}
              splitBy="chars"
              className="font-display font-extrabold leading-[0.95]"
              style-override="true"
            >
              We build
            </TextReveal>
            <div
              className="font-display font-extrabold leading-[0.95]"
              style={{
                fontSize: 'clamp(48px, 9vw, 130px)',
                background: 'linear-gradient(135deg, #6366f1, #a78bfa, #6366f1)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'gradientShift 4s ease infinite',
              }}
            >
              <TextReveal tag="span" delay={0.5} splitBy="chars">
                the future.
              </TextReveal>
            </div>
          </div>

          {/* Subtitle */}
          <ScrollReveal delay={0.8}>
            <p
              className="font-body font-light max-w-[480px] mb-10 leading-relaxed"
              style={{
                fontSize: 'clamp(16px, 1.8vw, 20px)',
                color: 'rgba(255, 255, 255, 0.45)',
              }}
            >
              Digital products that merge intelligence with craft. From concept to
              scale.
            </p>
          </ScrollReveal>

          {/* CTAs */}
          <ScrollReveal delay={1} className="flex gap-4 flex-wrap">
            <GlassButton variant="outline" href="#work">
              View Work
            </GlassButton>
            <GlassButton variant="primary" href="#contact">
              Start a Project
            </GlassButton>
          </ScrollReveal>
        </div>

        {/* 3D Scene */}
        <div className="w-full lg:w-[45%] h-[50vh] lg:h-[70vh] relative lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2 opacity-60 lg:opacity-100">
          <Suspense
            fallback={
              <div className="w-full h-full bg-gradient-to-br from-accent/10 to-transparent rounded-full" />
            }
          >
            <HeroScene />
          </Suspense>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-10 left-8 flex flex-col items-center gap-3 hidden lg:flex"
      >
        <div className="w-px h-10 bg-white/25" />
        <span
          className="font-mono text-[10px] uppercase tracking-[0.15em]"
          style={{
            color: 'rgba(255, 255, 255, 0.25)',
            writingMode: 'vertical-rl',
          }}
        >
          Scroll
        </span>
      </div>

      <style jsx>{`
        @keyframes gradientShift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </section>
  )
}
