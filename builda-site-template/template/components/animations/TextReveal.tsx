'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap-config'

interface TextRevealProps {
  children: string
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  delay?: number
  splitBy?: 'words' | 'chars'
  className?: string
}

export default function TextReveal({
  children,
  tag: Tag = 'p',
  delay = 0,
  splitBy = 'words',
  className = '',
}: TextRevealProps) {
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Split text into spans
    const words = children.split(' ')
    container.innerHTML = ''

    const elements: HTMLSpanElement[] = []

    words.forEach((word, wordIndex) => {
      const wordWrapper = document.createElement('span')
      wordWrapper.style.display = 'inline-block'
      wordWrapper.style.overflow = 'hidden'
      wordWrapper.style.verticalAlign = 'top'

      if (splitBy === 'chars') {
        const chars = word.split('')
        chars.forEach((char) => {
          const charSpan = document.createElement('span')
          charSpan.textContent = char
          charSpan.style.display = 'inline-block'
          charSpan.style.willChange = 'transform, opacity'
          wordWrapper.appendChild(charSpan)
          elements.push(charSpan)
        })
      } else {
        const wordSpan = document.createElement('span')
        wordSpan.textContent = word
        wordSpan.style.display = 'inline-block'
        wordSpan.style.willChange = 'transform, opacity'
        wordWrapper.appendChild(wordSpan)
        elements.push(wordSpan)
      }

      container.appendChild(wordWrapper)

      // Add space between words
      if (wordIndex < words.length - 1) {
        const space = document.createTextNode('\u00A0')
        container.appendChild(space)
      }
    })

    // Set initial state
    gsap.set(elements, { y: '110%', opacity: 0 })

    // Animate
    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(elements, {
          y: '0%',
          opacity: 1,
          duration: 0.8,
          stagger: splitBy === 'chars' ? 0.02 : 0.03,
          ease: 'power3.out',
          delay,
        })
      },
    })

    return () => {
      trigger.kill()
      gsap.killTweensOf(elements)
    }
  }, [children, delay, splitBy])

  return (
    <Tag
      ref={containerRef as React.RefObject<never>}
      className={className}
      style={{ overflow: 'hidden' }}
    >
      {children}
    </Tag>
  )
}
