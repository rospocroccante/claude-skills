'use client'

import { useState, useEffect, useCallback } from 'react'

interface Service {
  id: string
  slug: string
  title: string
  subtitle: string | null
  description: string
  tags: string[]
  icon: string | null
  order: number
  active: boolean
  createdAt: string
  updatedAt: string
}

interface ServiceForm {
  title: string
  slug: string
  subtitle: string
  description: string
  tags: string
  icon: string
  active: boolean
  order: number
}

const emptyForm: ServiceForm = {
  title: '',
  slug: '',
  subtitle: '',
  description: '',
  tags: '',
  icon: '',
  active: true,
  order: 0,
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ServiceForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/services')
      if (!res.ok) throw new Error('Failed to fetch services')
      const data = await res.json()
      setServices(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  function openAddModal() {
    setEditingId(null)
    setForm(emptyForm)
    setSlugManuallyEdited(false)
    setModalOpen(true)
  }

  function openEditModal(service: Service) {
    setEditingId(service.id)
    setForm({
      title: service.title,
      slug: service.slug,
      subtitle: service.subtitle || '',
      description: service.description,
      tags: service.tags.join(', '),
      icon: service.icon || '',
      active: service.active,
      order: service.order,
    })
    setSlugManuallyEdited(true)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingId(null)
    setForm(emptyForm)
    setSlugManuallyEdited(false)
  }

  function handleTitleChange(value: string) {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: slugManuallyEdited ? prev.slug : slugify(value),
    }))
  }

  function handleSlugChange(value: string) {
    setSlugManuallyEdited(true)
    setForm((prev) => ({ ...prev, slug: value }))
  }

  async function handleSave() {
    if (!form.title.trim() || !form.slug.trim() || !form.description.trim() || !form.tags.trim()) {
      setError('Title, slug, description, and tags are required.')
      return
    }

    setSaving(true)
    setError(null)

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      subtitle: form.subtitle.trim() || null,
      description: form.description.trim(),
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      icon: form.icon.trim() || null,
      active: form.active,
      order: form.order,
    }

    try {
      let res: Response
      if (editingId) {
        res = await fetch(`/api/services/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save service')
      }

      closeModal()
      fetchServices()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save service')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete service "${title}"? This action cannot be undone.`)) return

    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete service')
      }
      fetchServices()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete service')
    }
  }

  async function handleToggleActive(service: Service) {
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !service.active }),
      })
      if (!res.ok) throw new Error('Failed to update service')
      fetchServices()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update service')
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
          Services
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
          + Add Service
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
          Loading services...
        </div>
      )}

      {/* Empty state */}
      {!loading && services.length === 0 && (
        <div style={{ color: '#D3D0CB', textAlign: 'center', padding: '3rem 0' }}>
          No services found. Click &quot;Add Service&quot; to create one.
        </div>
      )}

      {/* Services Grid */}
      {!loading && services.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {services.map((service) => (
            <div
              key={service.id}
              style={{
                backgroundColor: 'rgba(30,34,36,0.6)',
                border: '1px solid rgba(57,62,65,0.3)',
                borderRadius: '0.75rem',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <h3
                      style={{
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        color: '#E7E5DF',
                        margin: 0,
                      }}
                    >
                      {service.title}
                    </h3>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        color: '#D3D0CB',
                        opacity: 0.5,
                        fontFamily: 'monospace',
                      }}
                    >
                      #{service.order}
                    </span>
                  </div>
                  {service.subtitle && (
                    <p
                      style={{
                        fontSize: '0.8rem',
                        color: '#D3D0CB',
                        opacity: 0.7,
                        margin: 0,
                      }}
                    >
                      {service.subtitle}
                    </p>
                  )}
                </div>

                {/* Active toggle */}
                <button
                  onClick={() => handleToggleActive(service)}
                  title={service.active ? 'Active -- click to deactivate' : 'Inactive -- click to activate'}
                  style={{
                    width: '2.5rem',
                    height: '1.375rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    flexShrink: 0,
                    backgroundColor: service.active
                      ? 'rgba(100,180,100,0.2)'
                      : 'rgba(57,62,65,0.4)',
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      width: '1rem',
                      height: '1rem',
                      borderRadius: '50%',
                      backgroundColor: service.active ? 'rgba(100,180,100,0.7)' : '#D3D0CB',
                      position: 'absolute',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      left: service.active ? 'calc(100% - 1.2rem)' : '0.2rem',
                      transition: 'all 0.2s ease',
                    }}
                  />
                </button>
              </div>

              {/* Description */}
              <p
                style={{
                  fontSize: '0.825rem',
                  color: '#D3D0CB',
                  margin: 0,
                  lineHeight: 1.5,
                  opacity: 0.8,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {service.description}
              </p>

              {/* Tags */}
              {service.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {service.tags.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.7rem',
                        padding: '0.2rem 0.5rem',
                        backgroundColor: 'rgba(57,62,65,0.3)',
                        border: '1px solid rgba(57,62,65,0.2)',
                        borderRadius: '9999px',
                        color: '#D3D0CB',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginTop: 'auto',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid rgba(57,62,65,0.2)',
                }}
              >
                <button
                  onClick={() => openEditModal(service)}
                  style={{
                    flex: 1,
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
                  onClick={() => handleDelete(service.id, service.title)}
                  style={{
                    flex: 1,
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
              maxWidth: '550px',
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
              {editingId ? 'Edit Service' : 'Add Service'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Title */}
              <div>
                <label style={labelStyle}>Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Service title"
                  style={inputStyle}
                />
              </div>

              {/* Slug */}
              <div>
                <label style={labelStyle}>Slug *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="service-slug"
                  style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.825rem' }}
                />
              </div>

              {/* Subtitle */}
              <div>
                <label style={labelStyle}>Subtitle</label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Short subtitle"
                  style={inputStyle}
                />
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Service description..."
                  rows={4}
                  style={{
                    ...inputStyle,
                    resize: 'vertical',
                    minHeight: '5rem',
                  }}
                />
              </div>

              {/* Tags */}
              <div>
                <label style={labelStyle}>Tags * (comma-separated)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                  placeholder="tag1, tag2, tag3"
                  style={inputStyle}
                />
              </div>

              {/* Icon */}
              <div>
                <label style={labelStyle}>Icon Name</label>
                <input
                  type="text"
                  value={form.icon}
                  onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))}
                  placeholder="e.g. code, globe, zap"
                  style={inputStyle}
                />
              </div>

              {/* Active + Order row */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Order</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, order: parseInt(e.target.value) || 0 }))
                    }
                    style={{ ...inputStyle, width: '100%' }}
                  />
                </div>
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    paddingBottom: '0.25rem',
                  }}
                >
                  <input
                    type="checkbox"
                    id="service-active"
                    checked={form.active}
                    onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
                    style={{
                      width: '1rem',
                      height: '1rem',
                      accentColor: 'rgba(100,180,100,0.7)',
                      cursor: 'pointer',
                    }}
                  />
                  <label
                    htmlFor="service-active"
                    style={{
                      color: '#D3D0CB',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                    }}
                  >
                    Active
                  </label>
                </div>
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
