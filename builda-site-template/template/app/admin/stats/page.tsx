'use client'

import { useState, useEffect, useCallback } from 'react'

interface Stat {
  id: string
  label: string
  value: number
  suffix: string
  order: number
  createdAt: string
  updatedAt: string
}

interface StatForm {
  label: string
  value: number
  suffix: string
  order: number
}

const emptyForm: StatForm = {
  label: '',
  value: 0,
  suffix: '',
  order: 0,
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<Stat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<StatForm>(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/stats')
      if (!res.ok) throw new Error('Failed to fetch stats')
      const data = await res.json()
      setStats(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  function openAddModal() {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEditModal(stat: Stat) {
    setEditingId(stat.id)
    setForm({
      label: stat.label,
      value: stat.value,
      suffix: stat.suffix,
      order: stat.order,
    })
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleSave() {
    if (!form.label.trim()) {
      setError('Label is required.')
      return
    }

    setSaving(true)
    setError(null)

    const payload = {
      label: form.label.trim(),
      value: form.value,
      suffix: form.suffix.trim(),
      order: form.order,
    }

    try {
      let res: Response
      if (editingId) {
        res = await fetch(`/api/stats/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save stat')
      }

      closeModal()
      fetchStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save stat')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string, label: string) {
    if (!window.confirm(`Delete stat "${label}"? This action cannot be undone.`)) return

    try {
      const res = await fetch(`/api/stats/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete stat')
      }
      fetchStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete stat')
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1E2224', padding: '2rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#E7E5DF',
            margin: 0,
          }}
        >
          Stats
        </h1>
        <button
          onClick={openAddModal}
          style={{
            padding: '0.5rem 1.25rem',
            backgroundColor: 'rgba(57,62,65,0.5)',
            border: '1px solid rgba(57,62,65,0.6)',
            borderRadius: '0.5rem',
            color: '#E7E5DF',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(57,62,65,0.8)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(57,62,65,0.5)'
          }}
        >
          + Add Stat
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            backgroundColor: 'rgba(180,100,100,0.15)',
            border: '1px solid rgba(180,100,100,0.3)',
            borderRadius: '0.5rem',
            color: '#D3D0CB',
            fontSize: '0.875rem',
          }}
        >
          {error}
          <button
            onClick={() => setError(null)}
            style={{
              marginLeft: '1rem',
              background: 'none',
              border: 'none',
              color: '#D3D0CB',
              cursor: 'pointer',
              fontSize: '0.875rem',
              textDecoration: 'underline',
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ color: '#D3D0CB', textAlign: 'center', padding: '3rem 0' }}>
          Loading stats...
        </div>
      )}

      {/* Empty state */}
      {!loading && stats.length === 0 && (
        <div style={{ color: '#D3D0CB', textAlign: 'center', padding: '3rem 0' }}>
          No stats found. Click &quot;Add Stat&quot; to create one.
        </div>
      )}

      {/* Stats List */}
      {!loading && stats.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {stats.map((stat) => (
            <div
              key={stat.id}
              style={{
                backgroundColor: 'rgba(30,34,36,0.6)',
                border: '1px solid rgba(57,62,65,0.3)',
                borderRadius: '0.75rem',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
              }}
            >
              {/* Value Display */}
              <div
                style={{
                  minWidth: '120px',
                  textAlign: 'center',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: '#E7E5DF',
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </span>
                {stat.suffix && (
                  <span
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 500,
                      color: '#D3D0CB',
                      opacity: 0.7,
                      marginLeft: '0.25rem',
                    }}
                  >
                    {stat.suffix}
                  </span>
                )}
              </div>

              {/* Label + Order */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: '0.925rem',
                    color: '#D3D0CB',
                    margin: 0,
                  }}
                >
                  {stat.label}
                </p>
                <span
                  style={{
                    fontSize: '0.7rem',
                    color: '#D3D0CB',
                    opacity: 0.4,
                    fontFamily: 'monospace',
                  }}
                >
                  order: {stat.order}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <button
                  onClick={() => openEditModal(stat)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    backgroundColor: 'rgba(57,62,65,0.3)',
                    border: '1px solid rgba(57,62,65,0.3)',
                    borderRadius: '0.375rem',
                    color: '#D3D0CB',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(57,62,65,0.5)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(57,62,65,0.3)'
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(stat.id, stat.label)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    backgroundColor: 'rgba(180,100,100,0.1)',
                    border: '1px solid rgba(180,100,100,0.2)',
                    borderRadius: '0.375rem',
                    color: '#D3D0CB',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(180,100,100,0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(180,100,100,0.1)'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Overlay */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '1rem',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal()
          }}
        >
          <div
            style={{
              backgroundColor: '#1E2224',
              border: '1px solid rgba(57,62,65,0.5)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '440px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: '#E7E5DF',
                margin: '0 0 1.25rem 0',
              }}
            >
              {editingId ? 'Edit Stat' : 'Add Stat'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Label */}
              <div>
                <label style={labelStyle}>Label *</label>
                <input
                  type="text"
                  value={form.label}
                  onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
                  placeholder="e.g. Projects Completed"
                  style={inputStyle}
                />
              </div>

              {/* Value + Suffix row */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Value *</label>
                  <input
                    type="number"
                    value={form.value}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, value: parseInt(e.target.value) || 0 }))
                    }
                    placeholder="0"
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Suffix</label>
                  <input
                    type="text"
                    value={form.suffix}
                    onChange={(e) => setForm((prev) => ({ ...prev, suffix: e.target.value }))}
                    placeholder="e.g. +, %, K"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Order */}
              <div>
                <label style={labelStyle}>Order</label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, order: parseInt(e.target.value) || 0 }))
                  }
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(57,62,65,0.3)',
              }}
            >
              <button
                onClick={closeModal}
                disabled={saving}
                style={{
                  padding: '0.5rem 1.25rem',
                  backgroundColor: 'rgba(57,62,65,0.3)',
                  border: '1px solid rgba(57,62,65,0.4)',
                  borderRadius: '0.5rem',
                  color: '#D3D0CB',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(57,62,65,0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(57,62,65,0.3)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '0.5rem 1.25rem',
                  backgroundColor: 'rgba(57,62,65,0.5)',
                  border: '1px solid rgba(57,62,65,0.6)',
                  borderRadius: '0.5rem',
                  color: '#E7E5DF',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!saving) e.currentTarget.style.backgroundColor = 'rgba(57,62,65,0.7)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(57,62,65,0.5)'
                }}
              >
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 500,
  color: '#D3D0CB',
  marginBottom: '0.375rem',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  backgroundColor: 'rgba(30,34,36,0.8)',
  border: '1px solid rgba(57,62,65,0.4)',
  borderRadius: '0.375rem',
  color: '#E7E5DF',
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box',
}
