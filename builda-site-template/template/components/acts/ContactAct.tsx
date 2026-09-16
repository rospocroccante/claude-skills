'use client'

import { useRef, useEffect } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap-config'

const ContactAct = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const readyRef = useRef<HTMLSpanElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLAnchorElement>(null)
  const emailRef = useRef<HTMLAnchorElement>(null)
  const footerRef = useRef<HTMLElement>(null)

  const line1Text = "Let's create"
  const line2Text = 'something extraordinary.'

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      // "Ready?" flash
      const readyTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'top 50%',
          scrub: true,
        },
      })

      readyTl
        .fromTo(
          readyRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3 }
        )
        .to(readyRef.current, { opacity: 0, duration: 0.3 }, 0.5)

      // Character reveal for title
      const line1Chars = section.querySelectorAll('.line1-char')
      const line2Chars = section.querySelectorAll('.line2-char')

      const titleTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 40%',
          end: 'top 5%',
          scrub: true,
        },
      })

      titleTl.fromTo(
        line1Chars,
        { opacity: 0 },
        { opacity: 1, stagger: 0.03, duration: 0.5, ease: 'none' }
      )

      titleTl.fromTo(
        line2Chars,
        { opacity: 0 },
        { opacity: 1, stagger: 0.02, duration: 0.8, ease: 'none' },
        0.2
      )

      // Button reveal
      gsap.fromTo(
        buttonRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 5%',
            end: 'top -8%',
            scrub: true,
          },
        }
      )

      // Email reveal
      gsap.fromTo(
        emailRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top -5%',
            end: 'top -12%',
            scrub: true,
          },
        }
      )

      // Footer reveal
      gsap.fromTo(
        footerRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top -8%',
            end: 'top -15%',
            scrub: true,
          },
        }
      )
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <>
      <style jsx global>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .gradient-text {
          background: linear-gradient(135deg, #d3d0cb, #e7e5df, #d3d0cb);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 4s ease infinite;
        }

        .email-link {
          position: relative;
        }

        .email-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 1px;
          background: #d3d0cb;
          transition: width 0.4s ease;
        }

        .email-link:hover::after {
          width: 100%;
        }
      `}</style>

      <section
        ref={sectionRef}
        className="relative flex flex-col items-center justify-center"
        style={{
          height: '120vh',
          zIndex: 6,
          background: 'radial-gradient(ellipse 130% 130% at 50% 50%, rgba(20,22,24,0.90) 30%, rgba(20,22,24,0.60) 100%)',
        }}
        data-act="contact"
      >
        {/* Ready? */}
        <span
          ref={readyRef}
          className="absolute opacity-0"
          style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: '14px',
            color: '#393E41',
            top: '15%',
          }}
        >
          Ready?
        </span>

        {/* Main content wrapper */}
        <div className="flex flex-col items-center gap-5 md:gap-8 px-5 md:px-6">
          {/* Title */}
          <div ref={titleRef} className="text-center">
            {/* Line 1: "Let's create" */}
            <div
              style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(28px, 7vw, 80px)',
                color: '#E7E5DF',
                lineHeight: 1.1,
              }}
            >
              {line1Text.split('').map((char, i) => (
                <span
                  key={`l1-${i}`}
                  className="line1-char inline-block opacity-0"
                  style={{ whiteSpace: char === ' ' ? 'pre' : undefined }}
                >
                  {char}
                </span>
              ))}
            </div>

            {/* Line 2: "something extraordinary." */}
            <div
              className="gradient-text"
              style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(28px, 7vw, 80px)',
                lineHeight: 1.1,
              }}
            >
              {line2Text.split('').map((char, i) => (
                <span
                  key={`l2-${i}`}
                  className="line2-char inline-block opacity-0"
                  style={{ whiteSpace: char === ' ' ? 'pre' : undefined }}
                >
                  {char}
                </span>
              ))}
            </div>
          </div>

          {/* Button */}
          <a
            ref={buttonRef}
            href="mailto:hello@builda.studio"
            data-cursor="magnetic"
            className="opacity-0 rounded-full px-7 py-3.5 md:px-8 md:py-4 uppercase tracking-widest transition-all duration-300"
            style={{
              border: '1px solid rgba(57, 62, 65, 0.4)',
              background: 'rgba(57, 62, 65, 0.15)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              color: '#E7E5DF',
              fontFamily: 'Space Mono, monospace',
              fontSize: '12px',
              letterSpacing: '0.1em',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget
              el.style.background = 'rgba(57, 62, 65, 0.3)'
              el.style.borderColor = 'rgba(211, 208, 203, 0.2)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget
              el.style.background = 'rgba(57, 62, 65, 0.15)'
              el.style.borderColor = 'rgba(57, 62, 65, 0.4)'
            }}
          >
            Start a Project
          </a>

          {/* Email */}
          <a
            ref={emailRef}
            href="mailto:hello@builda.studio"
            data-cursor="magnetic"
            className="email-link opacity-0 transition-opacity duration-300 hover:!opacity-100"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              color: '#D3D0CB',
              opacity: 0.4,
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.4'
            }}
          >
            hello@builda.studio
          </a>
        </div>

        {/* Footer - padded above BottomNav */}
        <footer
          ref={footerRef}
          className="absolute bottom-0 left-0 right-0 opacity-0"
          style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: '9px',
            color: '#393E41',
            paddingBottom: 64,
          }}
        >
          {/* Separator line */}
          <div
            style={{
              height: 1,
              margin: '0 5vw 16px',
              background: 'linear-gradient(to right, transparent, rgba(57,62,65,0.25) 20%, rgba(57,62,65,0.25) 80%, transparent)',
            }}
          />
          <div className="flex items-center justify-between px-5 md:px-8">
          <span>&copy; 2026 BUILDA</span>
          <div className="flex items-center gap-2">
            <a
              href="https://twitter.com/buildastudio"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-300 hover:text-[#D3D0CB]"
              style={{ color: '#393E41' }}
            >
              Tw
            </a>
            <span>&middot;</span>
            <a
              href="https://linkedin.com/company/buildastudio"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-300 hover:text-[#D3D0CB]"
              style={{ color: '#393E41' }}
            >
              Li
            </a>
            <span>&middot;</span>
            <a
              href="https://dribbble.com/buildastudio"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-300 hover:text-[#D3D0CB]"
              style={{ color: '#393E41' }}
            >
              Dr
            </a>
            <span>&middot;</span>
            <a
              href="https://github.com/buildastudio"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-300 hover:text-[#D3D0CB]"
              style={{ color: '#393E41' }}
            >
              Gh
            </a>
          </div>
          </div>
        </footer>
      </section>
    </>
  )
}

export default ContactAct
