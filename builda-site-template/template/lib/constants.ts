// ── Types ──────────────────────────────────────────────

export interface Service {
  num: string
  title: string
  description: string
  tags: string[]
}

export interface Project {
  title: string
  category: string
  year: string
  color: string
}

export interface Stat {
  value: number
  suffix: string
  label: string
}

export interface Social {
  name: string
  url: string
}

// ── Site ───────────────────────────────────────────────

export const SITE = {
  name: 'BUILDA',
  tagline: 'We build the future.',
  description:
    'Digital products that merge intelligence with craft. From concept to scale.',
  email: 'hello@builda.studio',
  year: 2025,
} as const

// ── Navigation ────────────────────────────────────────

export const NAV_LINKS = ['Home', 'Services', 'Work', 'About', 'Contact'] as const

// ── Services ──────────────────────────────────────────

export const SERVICES: Service[] = [
  {
    num: '01',
    title: 'Artificial Intelligence',
    description:
      'Custom AI solutions that transform raw data into strategic advantage. From LLMs to computer vision, we build intelligence that drives decisions.',
    tags: ['LLM Integration', 'Computer Vision', 'NLP', 'Predictive Models'],
  },
  {
    num: '02',
    title: 'Automation',
    description:
      'We eliminate repetitive workflows and build systems that scale without friction. From internal tools to full process automation.',
    tags: ['Workflow Automation', 'RPA', 'API Orchestration', 'CI/CD'],
  },
  {
    num: '03',
    title: 'SaaS Products',
    description:
      'From zero to market. We architect, design and ship SaaS platforms built for growth and recurring revenue.',
    tags: ['Product Strategy', 'Cloud Architecture', 'Subscription Models', 'Analytics'],
  },
  {
    num: '04',
    title: 'Web & Software',
    description:
      'Pixel-perfect interfaces powered by robust engineering. Performance is not optional, it\'s the baseline.',
    tags: ['React / Next.js', 'Full-Stack', 'Mobile Apps', 'DevOps'],
  },
]

// ── Projects ──────────────────────────────────────────

export const PROJECTS: Project[] = [
  { title: 'NeuralFlow', category: 'AI Platform', year: '2025', color: '#6366f1' },
  { title: 'AutoScale', category: 'Automation SaaS', year: '2025', color: '#06b6d4' },
  { title: 'DataPulse', category: 'Analytics Dashboard', year: '2024', color: '#8b5cf6' },
  { title: 'SynthOS', category: 'Operating System', year: '2024', color: '#ec4899' },
]

// ── Stats ─────────────────────────────────────────────

export const STATS: Stat[] = [
  { value: 150, suffix: '+', label: 'Projects Delivered' },
  { value: 98, suffix: '%', label: 'Client Retention' },
  { value: 40, suffix: '+', label: 'Team Members' },
  { value: 12, suffix: '', label: 'Countries Served' },
]

// ── Socials ───────────────────────────────────────────

export const SOCIALS: Social[] = [
  { name: 'Twitter', url: '#' },
  { name: 'LinkedIn', url: '#' },
  { name: 'Dribbble', url: '#' },
  { name: 'GitHub', url: '#' },
]

// ── Marquee Items ─────────────────────────────────────

export const MARQUEE_ITEMS = [
  'Artificial Intelligence',
  'Automation',
  'SaaS',
  'Web Development',
  'Machine Learning',
  'Cloud Architecture',
  'Product Design',
  'Software Engineering',
] as const
