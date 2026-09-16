'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  FolderOpen,
  Layers,
  BarChart3,
  Settings,
  Users,
  Activity,
  LogOut,
} from 'lucide-react'
import { AdminAuthProvider, useAdmin } from '@/lib/admin-auth'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Projects', href: '/admin/projects', icon: FolderOpen },
  { label: 'Services', href: '/admin/services', icon: Layers },
  { label: 'Stats', href: '/admin/stats', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
  { label: 'Team', href: '/admin/team', icon: Users },
  { label: 'Activity', href: '/admin/activity', icon: Activity },
]

function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAdmin()

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 240,
        height: '100vh',
        background: '#1E2224',
        borderRight: '1px solid rgba(57,62,65,0.4)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
      }}
    >
      {/* Logo / Brand */}
      <div
        style={{
          padding: '24px 20px',
          borderBottom: '1px solid rgba(57,62,65,0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span
          style={{
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: '#E7E5DF',
          }}
        >
          BUILDA
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: '#D3D0CB',
            background: 'rgba(57,62,65,0.5)',
            padding: '2px 8px',
            borderRadius: 4,
            letterSpacing: '0.04em',
          }}
        >
          Admin
        </span>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                marginBottom: 2,
                borderRadius: 6,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: active ? 500 : 400,
                color: active ? '#E7E5DF' : '#D3D0CB',
                background: active ? 'rgba(57,62,65,0.4)' : 'transparent',
                transition: 'background 0.15s ease, color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(57,62,65,0.25)'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Info & Logout */}
      <div
        style={{
          padding: '16px 12px',
          borderTop: '1px solid rgba(57,62,65,0.4)',
        }}
      >
        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#393E41',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 600,
                color: '#E7E5DF',
                flexShrink: 0,
              }}
            >
              {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#E7E5DF',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user.name || user.email}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: 'rgba(211,208,203,0.5)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user.role}
              </div>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            padding: '8px 12px',
            border: 'none',
            borderRadius: 6,
            background: 'transparent',
            color: '#D3D0CB',
            fontSize: 13,
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(57,62,65,0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <LogOut size={16} strokeWidth={1.8} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  )
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAdmin()

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#1E2224',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#D3D0CB',
          fontSize: 14,
        }}
      >
        Loading...
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1E2224' }}>
      <Sidebar />
      <main
        style={{
          marginLeft: 240,
          padding: '32px 32px',
          minHeight: '100vh',
        }}
      >
        {children}
      </main>
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  )
}
