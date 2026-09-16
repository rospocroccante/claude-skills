import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const stats = await prisma.stat.findMany({
      orderBy: { order: 'asc' },
      select: {
        id: true,
        label: true,
        value: true,
        suffix: true,
      },
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
