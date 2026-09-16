import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(_request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true })

    response.cookies.set(COOKIE_NAME, '', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
