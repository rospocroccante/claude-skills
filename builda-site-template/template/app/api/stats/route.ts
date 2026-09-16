import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromCookies, hasMinRole } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromCookies(request.headers.get('cookie'))
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!hasMinRole(payload.role, 'VIEWER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const stats = await prisma.stat.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error('GET /api/stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromCookies(request.headers.get('cookie'))
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!hasMinRole(payload.role, 'EDITOR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { label, value, suffix, order } = body

    if (!label || value === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const stat = await prisma.stat.create({
      data: {
        label,
        value,
        suffix,
        order,
      },
    })

    return NextResponse.json(stat, { status: 201 })
  } catch (error) {
    console.error('POST /api/stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
