import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromCookies, hasMinRole } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getTokenFromCookies(request.headers.get('cookie'))
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!hasMinRole(payload.role, 'VIEWER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    const project = await prisma.project.findUnique({ where: { id } })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('GET /api/projects/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getTokenFromCookies(request.headers.get('cookie'))
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!hasMinRole(payload.role, 'EDITOR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    const project = await prisma.project.update({
      where: { id },
      data: body,
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('PATCH /api/projects/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getTokenFromCookies(request.headers.get('cookie'))
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!hasMinRole(payload.role, 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    await prisma.project.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/projects/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
