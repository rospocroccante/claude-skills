import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        description: true,
        tags: true,
        imageSrc: true,
        featured: true,
      },
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
