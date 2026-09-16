import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

export const COOKIE_NAME = 'builda-auth'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function signToken(payload: { userId: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
  } catch {
    return null
  }
}

export function getTokenFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null
  const cookies = cookieHeader.split(';').reduce<Record<string, string>>((acc, cookie) => {
    const [key, ...rest] = cookie.trim().split('=')
    acc[key] = rest.join('=')
    return acc
  }, {})
  return cookies[COOKIE_NAME] || null
}

const roleHierarchy: Record<string, number> = {
  OWNER: 4,
  ADMIN: 3,
  EDITOR: 2,
  VIEWER: 1,
}

export function hasMinRole(userRole: string, requiredRole: string): boolean {
  return (roleHierarchy[userRole] ?? 0) >= (roleHierarchy[requiredRole] ?? 0)
}
