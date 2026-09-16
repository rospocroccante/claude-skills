'use client'

import { useState, useEffect } from 'react'
import { useAdmin } from '@/lib/admin-auth'

interface ActivityUser {
  id: string
  email: string
  name: string
  role: string
  avatar: string | null
}

interface ActivityEntry {
  id: string
  userId: string
  action: string
  target: string
  details: string | null
  createdAt: string
  user: ActivityUser
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)

  if (diffSeconds < 60) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ActivityPage() {
  const { user, loading } = useAdmin()
  const [activities, setActivities] = useState<ActivityEntry[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    async function fetchActivity() {
      try {
        const res = await fetch('/api/activity', { credentials: 'include' })
        if (!res.ok) throw new Error('Failed to fetch activity')
        const data: ActivityEntry[] = await res.json()
        setActivities(data)
      } catch {
        // Silently fail — empty state will show
      } finally {
        setFetching(false)
      }
    }

    if (!loading && user) {
      fetchActivity()
    }
  }, [loading, user])

  if (loading || fetching) {
    return (
      <div style={{ padding: '48px 32px' }}>
        <div
          style={{
            color: '#D3D0CB',
            fontSize: '14px',
            fontFamily: 'var(--font-space-mono), monospace',
          }}
        >
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '48px 32px', maxWidth: '800px' }}>
      {/* Header */}
      <h1
        style={{
          fontSize: '28px',
          fontWeight: 700,
          color: '#E7E5DF',
          marginBottom: '8px',
          fontFamily: 'var(--font-syne), sans-serif',
          letterSpacing: '-0.02em',
        }}
      >
        Activity Log
      </h1>
      <p
        style={{
          fontSize: '13px',
          color: 'rgba(211, 208, 203, 0.5)',
          marginBottom: '40px',
          fontFamily: 'var(--font-space-mono), monospace',
        }}
      >
        Recent actions across the admin panel
      </p>

      {/* Activity Timeline */}
      {activities.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'rgba(211, 208, 203, 0.4)',
            fontSize: '14px',
            fontFamily: 'var(--font-space-mono), monospace',
          }}
        >
          No activity yet
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {activities.map((entry, index) => (
            <div
              key={entry.id}
              style={{
                display: 'flex',
                gap: '16px',
                padding: '16px 0',
                borderBottom:
                  index < activities.length - 1
                    ? '1px solid rgba(57, 62, 65, 0.2)'
                    : 'none',
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(57, 62, 65, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#D3D0CB',
                  fontFamily: 'var(--font-space-mono), monospace',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                {getInitials(entry.user.name)}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '13px',
                    lineHeight: '1.5',
                    color: '#D3D0CB',
                    fontFamily: 'var(--font-space-mono), monospace',
                  }}
                >
                  <span
                    style={{
                      color: '#E7E5DF',
                      fontWeight: 600,
                    }}
                  >
                    {entry.user.name}
                  </span>{' '}
                  <span style={{ color: 'rgba(211, 208, 203, 0.7)' }}>{entry.action}</span>{' '}
                  <span
                    style={{
                      color: '#D3D0CB',
                      fontWeight: 500,
                    }}
                  >
                    {entry.target}
                  </span>
                </div>

                {entry.details && (
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'rgba(211, 208, 203, 0.4)',
                      fontFamily: 'var(--font-space-mono), monospace',
                      marginTop: '4px',
                    }}
                  >
                    {entry.details}
                  </div>
                )}

                <div
                  style={{
                    fontSize: '11px',
                    color: 'rgba(211, 208, 203, 0.35)',
                    fontFamily: 'var(--font-space-mono), monospace',
                    marginTop: '6px',
                  }}
                >
                  {getRelativeTime(entry.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
