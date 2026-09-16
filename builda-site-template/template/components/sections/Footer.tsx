'use client'

import { SITE, SOCIALS } from '@/lib/constants'

export default function Footer() {
  return (
    <footer
      className="py-8"
      style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        padding: '32px clamp(24px, 5vw, 80px)',
      }}
    >
      <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span
          className="font-mono text-xs"
          style={{ color: 'rgba(255, 255, 255, 0.2)' }}
        >
          &copy; {SITE.year} {SITE.name}
        </span>

        <div className="flex items-center gap-6">
          {SOCIALS.map((social) => (
            <a
              key={social.name}
              href={social.url}
              className="font-body text-xs uppercase tracking-wider relative group"
              style={{ color: 'rgba(255, 255, 255, 0.35)' }}
              data-cursor="pointer"
            >
              {social.name}
              <span className="absolute bottom-0 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
