import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, signToken, COOKIE_NAME } from '@/lib/auth'
import { Role } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json()

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, name, and password are required' },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({ where: { email } })

    if (existing) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      )
    }

    const hashed = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashed,
        role: Role.EDITOR,
      },
    })

    const token = signToken({ userId: user.id, role: user.role })

    const { password: _, ...userWithoutPassword } = user

    const response = NextResponse.json({ user: userWithoutPassword }, { status: 201 })

    response.cookies.set(COOKIE_NAME, token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
