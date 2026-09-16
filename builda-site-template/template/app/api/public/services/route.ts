import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        slug: true,
        title: true,
        subtitle: true,
        description: true,
        tags: true,
        icon: true,
      },
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error('Failed to fetch services:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
