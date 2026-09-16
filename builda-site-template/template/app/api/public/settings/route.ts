import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany({
      select: {
        key: true,
        value: true,
      },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to fetch settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
