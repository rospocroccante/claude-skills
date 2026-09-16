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

    const settings = await prisma.siteSetting.findMany()

    return NextResponse.json(settings)
  } catch (error) {
    console.error('GET /api/settings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = getTokenFromCookies(request.headers.get('cookie'))
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!hasMinRole(payload.role, 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { settings } = body as { settings: Array<{ key: string; value: string }> }

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json({ error: 'Missing required field: settings' }, { status: 400 })
    }

    const result = await prisma.$transaction(
      settings.map((setting) =>
        prisma.siteSetting.upsert({
          where: { key: setting.key },
          update: { value: setting.value },
          create: { key: setting.key, value: setting.value },
        })
      )
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('PATCH /api/settings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
