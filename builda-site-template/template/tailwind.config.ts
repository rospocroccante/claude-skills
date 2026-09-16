import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#1E2224',
        carbon: '#393E41',
        stone: '#D3D0CB',
        chalk: '#E7E5DF',
      },
      fontFamily: {
        display: ['var(--font-syne)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-space-mono)', 'monospace'],
      },
      spacing: {
        'section': '160px',
        'section-sm': '80px',
        'section-lg': '200px',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
export default config
