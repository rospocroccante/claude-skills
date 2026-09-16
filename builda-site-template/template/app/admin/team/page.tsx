'use client'

import { useState, useEffect } from 'react'
import { useAdmin } from '@/lib/admin-auth'

interface TeamUser {
  id: string
  email: string
  name: string
  role: string
  avatar: string | null
  createdAt: string
  updatedAt: string
}

const ROLE_STYLES: Record<string, { bg: string; color: string }> = {
  OWNER: { bg: '#E7E5DF', color: '#1E2224' },
  ADMIN: { bg: '#D3D0CB', color: '#1E2224' },
  EDITOR: { bg: '#393E41', color: '#E7E5DF' },
  VIEWER: { bg: 'rgba(57, 62, 65, 0.4)', color: 'rgba(211, 208, 203, 0.6)' },
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function TeamPage() {
  const { user: currentUser, loading } = useAdmin()
  const [users, setUsers] = useState<TeamUser[]>([])
  const [fetching, setFetching] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [editingRole, setEditingRole] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [invitePassword, setInvitePassword] = useState('')
  const [inviteRole, setInviteRole] = useState('EDITOR')
  const [inviting, setInviting] = useState(false)

  useEffect(() => {
    if (!loading && currentUser) {
      fetchUsers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, currentUser])

  async function fetchUsers() {
    try {
      const res = await fetch('/api/users', { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to fetch users')
      const data: TeamUser[] = await res.json()
      setUsers(data)
    } catch {
      showToast('Failed to load team members', 'error')
    } finally {
      setFetching(false)
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleInvite() {
    if (!inviteEmail.trim() || !inviteName.trim() || !invitePassword.trim()) {
      showToast('All fields are required', 'error')
      return
    }

    setInviting(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: inviteEmail,
          name: inviteName,
          password: invitePassword,
          role: inviteRole,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to invite member')
      }

      const newUser: TeamUser = await res.json()
      setUsers((prev) => [...prev, newUser])
      setShowInviteModal(false)
      setInviteEmail('')
      setInviteName('')
      setInvitePassword('')
      setInviteRole('EDITOR')
      showToast('Member invited successfully', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to invite member', 'error')
    } finally {
      setInviting(false)
    }
  }

  async function handleRoleChange(userId: string, newRole: string) {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: newRole }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update role')
      }

      const updated: TeamUser = await res.json()
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)))
      setEditingRole(null)
      showToast('Role updated successfully', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update role', 'error')
    }
  }

  async function handleDelete(userId: string) {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to remove member')
      }

      setUsers((prev) => prev.filter((u) => u.id !== userId))
      setConfirmDelete(null)
      showToast('Member removed successfully', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to remove member', 'error')
    }
  }

  const canManageUsers = currentUser?.role === 'OWNER' || currentUser?.role === 'ADMIN'
  const canDeleteUsers = currentUser?.role === 'OWNER'
  const canInviteUsers = currentUser?.role === 'OWNER'

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
    <div style={{ padding: '48px 32px', maxWidth: '900px' }}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '13px',
            fontFamily: 'var(--font-space-mono), monospace',
            color: '#E7E5DF',
            backgroundColor: 'rgba(30, 34, 36, 0.95)',
            border: `1px solid ${toast.type === 'success' ? 'rgba(211, 208, 203, 0.3)' : 'rgba(211, 208, 203, 0.15)'}`,
            zIndex: 1000,
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
          }}
        >
          {toast.type === 'success' ? '\u2713' : '\u2717'} {toast.message}
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
        }}
      >
        <div>
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
            Team
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: 'rgba(211, 208, 203, 0.5)',
              fontFamily: 'var(--font-space-mono), monospace',
            }}
          >
            {users.length} member{users.length !== 1 ? 's' : ''}
          </p>
        </div>

        {canInviteUsers && (
          <button
            onClick={() => setShowInviteModal(true)}
            style={{
              padding: '10px 20px',
              fontSize: '13px',
              fontFamily: 'var(--font-space-mono), monospace',
              fontWeight: 600,
              color: '#1E2224',
              backgroundColor: '#E7E5DF',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            + Invite Member
          </button>
        )}
      </div>

      {/* User List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {users.map((member) => (
          <div
            key={member.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px 20px',
              backgroundColor: 'rgba(30, 34, 36, 0.5)',
              border: '1px solid rgba(57, 62, 65, 0.3)',
              borderRadius: '8px',
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(57, 62, 65, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 600,
                color: '#D3D0CB',
                fontFamily: 'var(--font-space-mono), monospace',
                flexShrink: 0,
              }}
            >
              {getInitials(member.name)}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '4px',
                }}
              >
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#E7E5DF',
                    fontFamily: 'var(--font-syne), sans-serif',
                  }}
                >
                  {member.name}
                </span>

                {/* Role Badge */}
                {editingRole === member.id && canManageUsers ? (
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                    onBlur={() => setEditingRole(null)}
                    autoFocus
                    style={{
                      padding: '2px 8px',
                      fontSize: '11px',
                      fontFamily: 'var(--font-space-mono), monospace',
                      color: '#E7E5DF',
                      backgroundColor: 'rgba(30, 34, 36, 0.8)',
                      border: '1px solid rgba(57, 62, 65, 0.4)',
                      borderRadius: '4px',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="OWNER">OWNER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="EDITOR">EDITOR</option>
                    <option value="VIEWER">VIEWER</option>
                  </select>
                ) : (
                  <span
                    onClick={() => {
                      if (canManageUsers && member.id !== currentUser?.id) {
                        setEditingRole(member.id)
                      }
                    }}
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      fontSize: '10px',
                      fontFamily: 'var(--font-space-mono), monospace',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      borderRadius: '4px',
                      backgroundColor: ROLE_STYLES[member.role]?.bg || ROLE_STYLES.VIEWER.bg,
                      color: ROLE_STYLES[member.role]?.color || ROLE_STYLES.VIEWER.color,
                      cursor:
                        canManageUsers && member.id !== currentUser?.id ? 'pointer' : 'default',
                    }}
                    title={
                      canManageUsers && member.id !== currentUser?.id
                        ? 'Click to change role'
                        : undefined
                    }
                  >
                    {member.role}
                  </span>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-space-mono), monospace',
                  color: 'rgba(211, 208, 203, 0.5)',
                }}
              >
                <span>{member.email}</span>
                <span>Joined {formatDate(member.createdAt)}</span>
              </div>
            </div>

            {/* Actions */}
            {canDeleteUsers && member.id !== currentUser?.id && (
              <div style={{ flexShrink: 0 }}>
                {confirmDelete === member.id ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        color: 'rgba(211, 208, 203, 0.6)',
                        fontFamily: 'var(--font-space-mono), monospace',
                      }}
                    >
                      Confirm?
                    </span>
                    <button
                      onClick={() => handleDelete(member.id)}
                      style={{
                        padding: '4px 12px',
                        fontSize: '11px',
                        fontFamily: 'var(--font-space-mono), monospace',
                        color: '#E7E5DF',
                        backgroundColor: 'rgba(57, 62, 65, 0.6)',
                        border: '1px solid rgba(57, 62, 65, 0.4)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      style={{
                        padding: '4px 12px',
                        fontSize: '11px',
                        fontFamily: 'var(--font-space-mono), monospace',
                        color: 'rgba(211, 208, 203, 0.5)',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(57, 62, 65, 0.3)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(member.id)}
                    style={{
                      padding: '6px 14px',
                      fontSize: '11px',
                      fontFamily: 'var(--font-space-mono), monospace',
                      color: 'rgba(211, 208, 203, 0.4)',
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(57, 62, 65, 0.3)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'rgba(211, 208, 203, 0.4)',
            fontSize: '14px',
            fontFamily: 'var(--font-space-mono), monospace',
          }}
        >
          No team members found
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setShowInviteModal(false)}
        >
          <div
            style={{
              backgroundColor: '#1E2224',
              border: '1px solid rgba(57, 62, 65, 0.5)',
              borderRadius: '12px',
              padding: '32px',
              width: '420px',
              maxWidth: '90vw',
              boxShadow: '0 8px 48px rgba(0, 0, 0, 0.4)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#E7E5DF',
                marginBottom: '24px',
                fontFamily: 'var(--font-syne), sans-serif',
                letterSpacing: '-0.02em',
              }}
            >
              Invite Member
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontFamily: 'var(--font-space-mono), monospace',
                    color: 'rgba(211, 208, 203, 0.6)',
                    marginBottom: '6px',
                  }}
                >
                  Name
                </label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Full name"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '13px',
                    fontFamily: 'var(--font-space-mono), monospace',
                    color: '#E7E5DF',
                    backgroundColor: 'rgba(30, 34, 36, 0.8)',
                    border: '1px solid rgba(57, 62, 65, 0.4)',
                    borderRadius: '6px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontFamily: 'var(--font-space-mono), monospace',
                    color: 'rgba(211, 208, 203, 0.6)',
                    marginBottom: '6px',
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="email@example.com"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '13px',
                    fontFamily: 'var(--font-space-mono), monospace',
                    color: '#E7E5DF',
                    backgroundColor: 'rgba(30, 34, 36, 0.8)',
                    border: '1px solid rgba(57, 62, 65, 0.4)',
                    borderRadius: '6px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontFamily: 'var(--font-space-mono), monospace',
                    color: 'rgba(211, 208, 203, 0.6)',
                    marginBottom: '6px',
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                  placeholder="Initial password"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '13px',
                    fontFamily: 'var(--font-space-mono), monospace',
                    color: '#E7E5DF',
                    backgroundColor: 'rgba(30, 34, 36, 0.8)',
                    border: '1px solid rgba(57, 62, 65, 0.4)',
                    borderRadius: '6px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontFamily: 'var(--font-space-mono), monospace',
                    color: 'rgba(211, 208, 203, 0.6)',
                    marginBottom: '6px',
                  }}
                >
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '13px',
                    fontFamily: 'var(--font-space-mono), monospace',
                    color: '#E7E5DF',
                    backgroundColor: 'rgba(30, 34, 36, 0.8)',
                    border: '1px solid rgba(57, 62, 65, 0.4)',
                    borderRadius: '6px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="ADMIN">Admin</option>
                  <option value="EDITOR">Editor</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                marginTop: '28px',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={() => setShowInviteModal(false)}
                style={{
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontFamily: 'var(--font-space-mono), monospace',
                  color: 'rgba(211, 208, 203, 0.6)',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(57, 62, 65, 0.4)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={inviting}
                style={{
                  padding: '10px 24px',
                  fontSize: '13px',
                  fontFamily: 'var(--font-space-mono), monospace',
                  fontWeight: 600,
                  color: '#1E2224',
                  backgroundColor: '#E7E5DF',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: inviting ? 'not-allowed' : 'pointer',
                  opacity: inviting ? 0.6 : 1,
                }}
              >
                {inviting ? 'Inviting...' : 'Invite'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
