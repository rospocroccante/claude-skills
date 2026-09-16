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

    const services = await prisma.service.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error('GET /api/services error:', error)
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
    const { slug, title, subtitle, description, tags, icon, active } = body

    if (!slug || !title || !description || !tags) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const service = await prisma.service.create({
      data: {
        slug,
        title,
        subtitle,
        description,
        tags,
        icon,
        active,
      },
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('POST /api/services error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
