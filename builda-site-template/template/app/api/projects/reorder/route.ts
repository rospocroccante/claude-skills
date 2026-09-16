import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromCookies, hasMinRole } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest) {
  try {
    const token = getTokenFromCookies(request.headers.get('cookie'))
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!hasMinRole(payload.role, 'EDITOR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { items } = body as { items: Array<{ id: string; order: number }> }

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Missing required field: items' }, { status: 400 })
    }

    await prisma.$transaction(
      items.map((item) =>
        prisma.project.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PATCH /api/projects/reorder error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
