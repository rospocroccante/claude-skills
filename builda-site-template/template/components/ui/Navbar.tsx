'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap-config'
import { NAV_LINKS } from '@/lib/constants'
import GlassButton from './GlassButton'

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('Home')
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  // Scroll-based background change
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const trigger = ScrollTrigger.create({
      start: 100,
      onUpdate: (self) => {
        const isScrolled = self.scroll() > 100
        setScrolled(isScrolled)
      },
    })

    return () => trigger.kill()
  }, [])

  // Animate navbar background
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    gsap.to(nav, {
      backgroundColor: scrolled ? 'rgba(13, 13, 15, 0.8)' : 'rgba(13, 13, 15, 0)',
      backdropFilter: scrolled ? 'blur(20px)' : 'blur(0px)',
      borderBottomColor: scrolled
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(255, 255, 255, 0)',
      duration: 0.4,
      ease: 'power2.out',
    })
  }, [scrolled])

  // Intersection Observer for active section
  useEffect(() => {
    const sections = document.querySelectorAll('section[id]')
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id
            const name = id.charAt(0).toUpperCase() + id.slice(1)
            setActiveSection(name)
          }
        })
      },
      { rootMargin: '-40% 0px -60% 0px' }
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  // Mobile menu animation
  useEffect(() => {
    if (!menuRef.current) return

    if (isOpen) {
      document.body.style.overflow = 'hidden'
      gsap.set(menuRef.current, { display: 'flex' })

      const tl = gsap.timeline()
      tl.fromTo(
        menuRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      )
      tl.fromTo(
        menuRef.current.querySelectorAll('.menu-link'),
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: 'power3.out' },
        '-=0.1'
      )
      timelineRef.current = tl
    } else {
      document.body.style.overflow = ''
      if (timelineRef.current) {
        timelineRef.current.kill()
      }
      gsap.to(menuRef.current, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          if (menuRef.current) {
            gsap.set(menuRef.current, { display: 'none' })
          }
        },
      })
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  function scrollToSection(name: string) {
    setIsOpen(false)
    const id = name.toLowerCase()
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 left-0 w-full z-50 px-6 md:px-8 py-5"
        style={{ borderBottom: '1px solid transparent' }}
      >
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => scrollToSection('Home')}
            className="relative font-display font-extrabold text-xl tracking-tight"
            data-cursor="pointer"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #a78bfa, #6366f1)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradientShift 3s ease infinite',
            }}
          >
            BUILDA
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <button
                key={link}
                onClick={() => scrollToSection(link)}
                className="nav-link relative font-body text-[13px] font-normal uppercase tracking-[0.08em] transition-colors"
                data-cursor="pointer"
                style={{
                  color:
                    activeSection === link
                      ? 'rgba(255, 255, 255, 1)'
                      : 'rgba(255, 255, 255, 0.5)',
                }}
              >
                {link}
                <span
                  className="absolute bottom-[-4px] left-0 h-px bg-white transition-all duration-300"
                  style={{
                    width: activeSection === link ? '100%' : '0%',
                  }}
                />
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <GlassButton
              variant="primary"
              size="sm"
              onClick={() => scrollToSection('Contact')}
            >
              Let&apos;s Talk
            </GlassButton>
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden relative w-8 h-6 flex flex-col justify-between z-[60]"
            onClick={() => setIsOpen(!isOpen)}
            data-cursor="pointer"
            aria-label="Toggle menu"
          >
            <span
              className="block w-full h-px bg-white transition-transform duration-300 origin-left"
              style={{
                transform: isOpen ? 'rotate(45deg) translateY(-1px)' : 'none',
              }}
            />
            <span
              className="block w-full h-px bg-white transition-opacity duration-300"
              style={{ opacity: isOpen ? 0 : 1 }}
            />
            <span
              className="block w-full h-px bg-white transition-transform duration-300 origin-left"
              style={{
                transform: isOpen ? 'rotate(-45deg) translateY(1px)' : 'none',
              }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Fullscreen Menu */}
      <div
        ref={menuRef}
        className="fixed inset-0 z-[55] flex-col items-center justify-center gap-8 hidden"
        style={{
          background: 'rgba(13, 13, 15, 0.97)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {NAV_LINKS.map((link, i) => (
          <button
            key={link}
            className="menu-link flex items-center gap-4"
            onClick={() => scrollToSection(link)}
          >
            <span className="font-mono text-xs text-white/30">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="font-display text-[40px] font-semibold text-white">
              {link}
            </span>
          </button>
        ))}
      </div>

      {/* CSS animation for gradient logo */}
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
    </>
  )
}
