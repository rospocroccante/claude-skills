import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Delete all existing data (in order to respect foreign keys)
  await prisma.activityLog.deleteMany();
  await prisma.siteSetting.deleteMany();
  await prisma.stat.deleteMany();
  await prisma.service.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing data.');

  // Create OWNER user
  const hashedPassword = await bcryptjs.hash('admin123', 12);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@builda.studio',
      name: 'Admin',
      password: hashedPassword,
      role: 'OWNER',
    },
  });
  console.log(`Created user: ${adminUser.email} (${adminUser.role})`);

  // Create services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        title: 'AI Solutions',
        slug: 'ai-solutions',
        description: 'Cutting-edge artificial intelligence solutions tailored to your business needs.',
        tags: ['LLM Integration', 'Computer Vision', 'NLP', 'Predictive Models'],
        order: 0,
      },
    }),
    prisma.service.create({
      data: {
        title: 'Automation',
        slug: 'automation',
        description: 'Streamline your operations with intelligent automation workflows.',
        tags: ['Workflow Automation', 'RPA', 'API Orchestration', 'CI/CD'],
        order: 1,
      },
    }),
    prisma.service.create({
      data: {
        title: 'SaaS Products',
        slug: 'saas-products',
        description: 'End-to-end SaaS product development from concept to launch.',
        tags: ['Product Strategy', 'Cloud Architecture', 'Subscription Models', 'Analytics'],
        order: 2,
      },
    }),
    prisma.service.create({
      data: {
        title: 'Web & Software',
        slug: 'web-software',
        description: 'Modern web applications and software solutions built with the latest technologies.',
        tags: ['React / Next.js', 'Full-Stack', 'Mobile Apps', 'DevOps'],
        order: 3,
      },
    }),
  ]);
  console.log(`Created ${services.length} services.`);

  // Create projects
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        title: 'NeuralFlow',
        slug: 'neuralflow',
        category: 'AI Platform',
        description: 'An AI-powered platform for managing and deploying machine learning models at scale.',
        tags: ['AI', 'Machine Learning', 'Dashboard'],
        order: 0,
        featured: true,
        status: 'PUBLISHED',
      },
    }),
    prisma.project.create({
      data: {
        title: 'AutoScale',
        slug: 'autoscale',
        category: 'Automation SaaS',
        description: 'Intelligent infrastructure scaling solution that automates resource management.',
        tags: ['Automation', 'SaaS', 'Scaling'],
        order: 1,
        featured: true,
        status: 'PUBLISHED',
      },
    }),
    prisma.project.create({
      data: {
        title: 'DataPulse',
        slug: 'datapulse',
        category: 'Analytics Dashboard',
        description: 'Real-time analytics dashboard for monitoring business metrics and KPIs.',
        tags: ['Analytics', 'Data', 'Visualization'],
        order: 2,
        featured: false,
        status: 'PUBLISHED',
      },
    }),
    prisma.project.create({
      data: {
        title: 'SynthOS',
        slug: 'synthos',
        category: 'Operating System',
        description: 'A next-generation operating system designed for cloud-native infrastructure.',
        tags: ['OS', 'System', 'Infrastructure'],
        order: 3,
        featured: false,
        status: 'PUBLISHED',
      },
    }),
  ]);
  console.log(`Created ${projects.length} projects.`);

  // Create stats
  const stats = await Promise.all([
    prisma.stat.create({
      data: { label: 'Projects Delivered', value: 150, suffix: '+', order: 0 },
    }),
    prisma.stat.create({
      data: { label: 'Client Retention', value: 98, suffix: '%', order: 1 },
    }),
    prisma.stat.create({
      data: { label: 'Team Members', value: 40, suffix: '+', order: 2 },
    }),
    prisma.stat.create({
      data: { label: 'Countries Served', value: 12, suffix: '', order: 3 },
    }),
  ]);
  console.log(`Created ${stats.length} stats.`);

  // Create site settings
  const siteSettings = await prisma.siteSetting.createMany({
    data: [
      { key: 'siteName', value: 'BUILDA' },
      { key: 'siteDescription', value: "We don't build websites. We build experiences." },
      { key: 'contactEmail', value: 'hello@builda.studio' },
      { key: 'socialTwitter', value: '#' },
      { key: 'socialLinkedin', value: '#' },
      { key: 'socialGithub', value: '#' },
      { key: 'socialDribbble', value: '#' },
    ],
  });
  console.log(`Created ${siteSettings.count} site settings.`);

  console.log('Seeding completed successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
