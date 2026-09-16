'use client'

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  createElement,
} from 'react'
import { useRouter } from 'next/navigation'

interface AdminUser {
  id: string
  email: string
  name: string
  role: string
  avatar: string | null
  createdAt?: string
  updatedAt?: string
}

interface AdminAuthContextType {
  user: AdminUser | null
  loading: boolean
  isLoading: boolean
  error: string | null
  logout: () => Promise<void>
}

// --- Context-based approach (for use with AdminAuthProvider in layouts) ---

const AdminAuthContext = createContext<AdminAuthContextType | null>(null)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const value = useAdminInternal()
  return createElement(AdminAuthContext.Provider, { value }, children)
}

// --- Internal hook that does the actual fetching ---

function useAdminInternal(): AdminAuthContextType {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        if (!res.ok) {
          router.push('/admin/login')
          return
        }
        const data = await res.json()
        setUser(data.user)
      } catch {
        setError('Failed to authenticate')
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [router])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } finally {
      setUser(null)
      router.push('/admin/login')
    }
  }, [router])

  return { user, loading, isLoading: loading, error, logout }
}

// --- Public hook: works both inside AdminAuthProvider and standalone ---

export function useAdmin(): AdminAuthContextType {
  const context = useContext(AdminAuthContext)
  if (context) {
    return context
  }
  // Fallback: should not happen if used inside AdminAuthProvider,
  // but we throw to prevent silent bugs
  throw new Error('useAdmin must be used within an AdminAuthProvider')
}
