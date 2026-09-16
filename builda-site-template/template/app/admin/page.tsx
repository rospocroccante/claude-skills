'use client'

import { useState, useEffect } from 'react'
import { useAdmin } from '@/lib/admin-auth'

interface StatCard {
  label: string
  value: number | null
  loading: boolean
}

interface ActivityItem {
  id: string
  action: string
  target: string
  details: string | null
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    role: string
    avatar: string | null
  }
}

function timeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAdmin()

  const [stats, setStats] = useState<StatCard[]>([
    { label: 'Total Projects', value: null, loading: true },
    { label: 'Active Services', value: null, loading: true },
    { label: 'Team Members', value: null, loading: true },
    { label: 'Site Settings', value: null, loading: true },
  ])
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [activityLoading, setActivityLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    // Fetch projects count
    fetch('/api/projects', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setStats((prev) =>
          prev.map((s) =>
            s.label === 'Total Projects'
              ? { ...s, value: Array.isArray(data) ? data.length : 0, loading: false }
              : s
          )
        )
      })
      .catch(() => {
        setStats((prev) =>
          prev.map((s) =>
            s.label === 'Total Projects' ? { ...s, value: 0, loading: false } : s
          )
        )
      })

    // Fetch active services count
    fetch('/api/services', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const activeCount = Array.isArray(data)
          ? data.filter((s: { active: boolean }) => s.active).length
          : 0
        setStats((prev) =>
          prev.map((s) =>
            s.label === 'Active Services'
              ? { ...s, value: activeCount, loading: false }
              : s
          )
        )
      })
      .catch(() => {
        setStats((prev) =>
          prev.map((s) =>
            s.label === 'Active Services' ? { ...s, value: 0, loading: false } : s
          )
        )
      })

    // Fetch team members count
    fetch('/api/users', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setStats((prev) =>
          prev.map((s) =>
            s.label === 'Team Members'
              ? { ...s, value: Array.isArray(data) ? data.length : 0, loading: false }
              : s
          )
        )
      })
      .catch(() => {
        setStats((prev) =>
          prev.map((s) =>
            s.label === 'Team Members' ? { ...s, value: 0, loading: false } : s
          )
        )
      })

    // Fetch site settings count
    fetch('/api/settings', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setStats((prev) =>
          prev.map((s) =>
            s.label === 'Site Settings'
              ? { ...s, value: Array.isArray(data) ? data.length : 0, loading: false }
              : s
          )
        )
      })
      .catch(() => {
        setStats((prev) =>
          prev.map((s) =>
            s.label === 'Site Settings' ? { ...s, value: 0, loading: false } : s
          )
        )
      })

    // Fetch recent activity
    fetch('/api/activity', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setActivity(data.slice(0, 10))
        }
        setActivityLoading(false)
      })
      .catch(() => {
        setActivityLoading(false)
      })
  }, [authLoading])

  return (
    <div style={{ maxWidth: '1200px' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '32px',
          }}
        >
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#E7E5DF',
              margin: 0,
            }}
          >
            Dashboard
          </h1>
          {user && (
            <span style={{ color: 'rgba(211,208,203,0.5)', fontSize: '14px' }}>
              {user.name} ({user.role})
            </span>
          )}
        </div>

        {/* Stat Cards Grid */}
        <style>{`
          .admin-stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin-bottom: 40px;
          }
          @media (min-width: 768px) {
            .admin-stats-grid {
              grid-template-columns: repeat(4, 1fr);
            }
          }
        `}</style>
        <div className="admin-stats-grid">
          {stats.map((stat) => (
            <div
              key={stat.label}
              style={{
                backgroundColor: 'rgba(30,34,36,0.6)',
                border: '1px solid rgba(57,62,65,0.3)',
                borderRadius: '12px',
                padding: '24px',
                backdropFilter: 'blur(12px)',
              }}
            >
              {stat.loading ? (
                <div
                  style={{
                    width: '40px',
                    height: '36px',
                    backgroundColor: 'rgba(57,62,65,0.3)',
                    borderRadius: '6px',
                    marginBottom: '8px',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                />
              ) : (
                <div
                  style={{
                    fontSize: '36px',
                    fontWeight: 700,
                    color: '#E7E5DF',
                    lineHeight: 1,
                    marginBottom: '8px',
                  }}
                >
                  {stat.value}
                </div>
              )}
              <div
                style={{
                  fontSize: '13px',
                  color: 'rgba(211,208,203,0.5)',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#E7E5DF',
              marginBottom: '16px',
            }}
          >
            Recent Activity
          </h2>
          <div
            style={{
              backgroundColor: 'rgba(30,34,36,0.6)',
              border: '1px solid rgba(57,62,65,0.3)',
              borderRadius: '12px',
              overflow: 'hidden',
              backdropFilter: 'blur(12px)',
            }}
          >
            {activityLoading ? (
              <div
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  color: 'rgba(211,208,203,0.5)',
                  fontSize: '14px',
                }}
              >
                Loading activity...
              </div>
            ) : activity.length === 0 ? (
              <div
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  color: 'rgba(211,208,203,0.4)',
                  fontSize: '14px',
                }}
              >
                No recent activity
              </div>
            ) : (
              activity.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 20px',
                    borderBottom:
                      index < activity.length - 1
                        ? '1px solid rgba(57,62,65,0.2)'
                        : 'none',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {/* User avatar circle */}
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(57,62,65,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'rgba(211,208,203,0.7)',
                      }}
                    >
                      {item.user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '14px',
                          color: '#D3D0CB',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{item.user.name}</span>
                        {' '}
                        <span style={{ color: 'rgba(211,208,203,0.5)' }}>
                          {item.action}
                        </span>
                        {' '}
                        <span style={{ color: 'rgba(211,208,203,0.7)' }}>
                          {item.target}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'rgba(211,208,203,0.35)',
                      whiteSpace: 'nowrap',
                      marginLeft: '16px',
                      flexShrink: 0,
                    }}
                  >
                    {timeAgo(item.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      {/* Pulse animation for loading skeletons */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
