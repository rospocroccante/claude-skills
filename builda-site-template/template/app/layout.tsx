import type { Metadata } from 'next'
import { Inter, Syne, Space_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
  weight: ['400', '700'],
})

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
}

export const metadata: Metadata = {
  title: 'BUILDA — We build the future.',
  description:
    'Digital products that merge intelligence with craft. From concept to scale. AI, Automation, SaaS, Software.',
  openGraph: {
    title: 'BUILDA — We build the future.',
    description:
      'Digital products that merge intelligence with craft. From concept to scale.',
    siteName: 'BUILDA',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable} ${spaceMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
