'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAdmin } from '@/lib/admin-auth'

interface Project {
  id: string
  slug: string
  title: string
  category: string
  description: string
  tags: string[]
  imageSrc: string | null
  featured: boolean
  order: number
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  createdAt: string
  updatedAt: string
}

interface ProjectFormData {
  title: string
  slug: string
  category: string
  description: string
  tags: string
  imageSrc: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  featured: boolean
}

const emptyForm: ProjectFormData = {
  title: '',
  slug: '',
  category: '',
  description: '',
  tags: '',
  imageSrc: '',
  status: 'DRAFT',
  featured: false,
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// --- Style constants ---
const cardBg = 'rgba(30,34,36,0.6)'
const borderColor = 'rgba(57,62,65,0.3)'
const inputBg = 'rgba(30,34,36,0.8)'
const inputBorder = 'rgba(57,62,65,0.4)'
const textChalk = '#E7E5DF'
const textStone = '#D3D0CB'
const textMuted = 'rgba(211,208,203,0.5)'
const btnPrimaryBg = 'rgba(211,208,203,0.1)'
const btnPrimaryBorder = 'rgba(211,208,203,0.15)'
const btnDangerBg = 'rgba(200,50,50,0.15)'
const btnDangerBorder = 'rgba(200,50,50,0.3)'

export default function AdminProjects() {
  const { user, loading: authLoading } = useAdmin()

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProjectFormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setProjects(Array.isArray(data) ? data : [])
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading) {
      fetchProjects()
    }
  }, [authLoading, fetchProjects])

  const openNewModal = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError(null)
    setModalOpen(true)
  }

  const openEditModal = (project: Project) => {
    setEditingId(project.id)
    setForm({
      title: project.title,
      slug: project.slug,
      category: project.category,
      description: project.description,
      tags: project.tags.join(', '),
      imageSrc: project.imageSrc || '',
      status: project.status,
      featured: project.featured,
    })
    setError(null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingId(null)
    setForm(emptyForm)
    setError(null)
  }

  const handleTitleChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: editingId ? prev.slug : slugify(value),
    }))
  }

  const handleSave = async () => {
    if (!form.title || !form.slug || !form.category || !form.description || !form.tags) {
      setError('Please fill in all required fields (title, slug, category, description, tags).')
      return
    }

    setSaving(true)
    setError(null)

    const payload = {
      title: form.title,
      slug: form.slug,
      category: form.category,
      description: form.description,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      imageSrc: form.imageSrc || null,
      status: form.status,
      featured: form.featured,
    }

    try {
      let res: Response
      if (editingId) {
        res = await fetch(`/api/projects/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Failed to save project.')
        setSaving(false)
        return
      }

      closeModal()
      await fetchProjects()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok) {
        setDeleteConfirm(null)
        await fetchProjects()
      }
    } catch {
      // silently fail
    }
  }

  const handleToggleFeatured = async (project: Project) => {
    try {
      await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ featured: !project.featured }),
      })
      await fetchProjects()
    } catch {
      // silently fail
    }
  }

  const statusBadgeStyle = (status: string): React.CSSProperties => {
    switch (status) {
      case 'DRAFT':
        return {
          backgroundColor: 'rgba(57,62,65,0.4)',
          color: 'rgba(211,208,203,0.6)',
          border: '1px solid rgba(57,62,65,0.5)',
        }
      case 'PUBLISHED':
        return {
          backgroundColor: 'rgba(211,208,203,0.1)',
          color: textStone,
          border: `1px solid rgba(211,208,203,0.2)`,
        }
      case 'ARCHIVED':
        return {
          backgroundColor: 'rgba(30,34,36,0.6)',
          color: 'rgba(211,208,203,0.4)',
          border: '1px solid rgba(57,62,65,0.3)',
        }
      default:
        return {}
    }
  }

  return (
    <>
      <div style={{ maxWidth: '1200px' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: textChalk, margin: 0 }}>
            Projects
          </h1>
          <button
            onClick={openNewModal}
            style={{
              padding: '10px 20px',
              backgroundColor: btnPrimaryBg,
              border: `1px solid ${btnPrimaryBorder}`,
              borderRadius: '8px',
              color: textChalk,
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(211,208,203,0.18)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = btnPrimaryBg
            }}
          >
            + Add Project
          </button>
        </div>

        {/* Projects Table */}
        <div
          style={{
            backgroundColor: cardBg,
            border: `1px solid ${borderColor}`,
            borderRadius: '12px',
            overflow: 'hidden',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '60px 1fr 120px 100px 80px 120px',
              gap: '0',
              padding: '12px 20px',
              borderBottom: `1px solid ${borderColor}`,
              fontSize: '11px',
              fontWeight: 600,
              color: textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            <div>Order</div>
            <div>Title</div>
            <div>Category</div>
            <div>Status</div>
            <div>Feat.</div>
            <div style={{ textAlign: 'right' }}>Actions</div>
          </div>

          {/* Table Body */}
          {loading ? (
            <div
              style={{
                padding: '32px',
                textAlign: 'center',
                color: textMuted,
                fontSize: '14px',
              }}
            >
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div
              style={{
                padding: '32px',
                textAlign: 'center',
                color: 'rgba(211,208,203,0.4)',
                fontSize: '14px',
              }}
            >
              No projects yet. Click &quot;Add Project&quot; to create one.
            </div>
          ) : (
            projects.map((project, index) => (
              <div
                key={project.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 120px 100px 80px 120px',
                  gap: '0',
                  padding: '14px 20px',
                  borderBottom:
                    index < projects.length - 1
                      ? '1px solid rgba(57,62,65,0.15)'
                      : 'none',
                  alignItems: 'center',
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(57,62,65,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                {/* Order */}
                <div
                  style={{
                    color: 'rgba(211,208,203,0.35)',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                  }}
                >
                  {project.order}
                </div>

                {/* Title */}
                <div>
                  <div
                    style={{
                      color: textChalk,
                      fontSize: '14px',
                      fontWeight: 500,
                      marginBottom: '2px',
                    }}
                  >
                    {project.title}
                  </div>
                  <div
                    style={{
                      color: 'rgba(211,208,203,0.35)',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                    }}
                  >
                    /{project.slug}
                  </div>
                </div>

                {/* Category */}
                <div style={{ color: textMuted, fontSize: '13px' }}>
                  {project.category}
                </div>

                {/* Status */}
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.03em',
                      ...statusBadgeStyle(project.status),
                    }}
                  >
                    {project.status}
                  </span>
                </div>

                {/* Featured */}
                <div>
                  <button
                    onClick={() => handleToggleFeatured(project)}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      border: `1px solid ${
                        project.featured
                          ? 'rgba(211,208,203,0.4)'
                          : inputBorder
                      }`,
                      backgroundColor: project.featured
                        ? 'rgba(211,208,203,0.15)'
                        : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      color: project.featured ? textStone : 'transparent',
                      fontSize: '12px',
                      lineHeight: 1,
                    }}
                    title={project.featured ? 'Unfeature' : 'Feature'}
                  >
                    {project.featured ? '\u2713' : ''}
                  </button>
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'flex-end',
                  }}
                >
                  <button
                    onClick={() => openEditModal(project)}
                    style={{
                      padding: '5px 12px',
                      backgroundColor: btnPrimaryBg,
                      border: `1px solid ${btnPrimaryBorder}`,
                      borderRadius: '6px',
                      color: textStone,
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(211,208,203,0.18)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = btnPrimaryBg
                    }}
                  >
                    Edit
                  </button>
                  {deleteConfirm === project.id ? (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => handleDelete(project.id)}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: 'rgba(200,50,50,0.25)',
                          border: `1px solid ${btnDangerBorder}`,
                          borderRadius: '6px',
                          color: '#e8a0a0',
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        style={{
                          padding: '5px 8px',
                          backgroundColor: 'transparent',
                          border: `1px solid ${borderColor}`,
                          borderRadius: '6px',
                          color: textMuted,
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(project.id)}
                      style={{
                        padding: '5px 12px',
                        backgroundColor: btnDangerBg,
                        border: `1px solid ${btnDangerBorder}`,
                        borderRadius: '6px',
                        color: '#e8a0a0',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(200,50,50,0.25)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = btnDangerBg
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

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
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal()
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflow: 'auto',
              backgroundColor: '#1E2224',
              border: `1px solid ${borderColor}`,
              borderRadius: '16px',
              padding: '28px',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px',
              }}
            >
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: textChalk, margin: 0 }}>
                {editingId ? 'Edit Project' : 'New Project'}
              </h2>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: textMuted,
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '4px',
                  lineHeight: 1,
                }}
              >
                \u00d7
              </button>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: 'rgba(200,50,50,0.1)',
                  border: `1px solid ${btnDangerBorder}`,
                  borderRadius: '8px',
                  color: '#e8a0a0',
                  fontSize: '13px',
                  marginBottom: '16px',
                }}
              >
                {error}
              </div>
            )}

            {/* Form Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Title */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: textMuted,
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: inputBg,
                    border: `1px solid ${inputBorder}`,
                    borderRadius: '8px',
                    color: textChalk,
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  placeholder="Project title"
                />
              </div>

              {/* Slug */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: textMuted,
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Slug *
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: inputBg,
                    border: `1px solid ${inputBorder}`,
                    borderRadius: '8px',
                    color: textChalk,
                    fontSize: '14px',
                    outline: 'none',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box',
                  }}
                  placeholder="project-slug"
                />
              </div>

              {/* Category */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: textMuted,
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Category *
                </label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: inputBg,
                    border: `1px solid ${inputBorder}`,
                    borderRadius: '8px',
                    color: textChalk,
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  placeholder="e.g. Web App, SaaS, Mobile"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: textMuted,
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Description *
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: inputBg,
                    border: `1px solid ${inputBorder}`,
                    borderRadius: '8px',
                    color: textChalk,
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                  placeholder="Project description..."
                />
              </div>

              {/* Tags */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: textMuted,
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Tags * (comma-separated)
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: inputBg,
                    border: `1px solid ${inputBorder}`,
                    borderRadius: '8px',
                    color: textChalk,
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  placeholder="React, Next.js, TypeScript"
                />
              </div>

              {/* Image Src */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: textMuted,
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Image URL
                </label>
                <input
                  type="text"
                  value={form.imageSrc}
                  onChange={(e) => setForm((prev) => ({ ...prev, imageSrc: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: inputBg,
                    border: `1px solid ${inputBorder}`,
                    borderRadius: '8px',
                    color: textChalk,
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  placeholder="/images/project.jpg or https://..."
                />
              </div>

              {/* Status + Featured row */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                {/* Status */}
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: textMuted,
                      marginBottom: '6px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        status: e.target.value as ProjectFormData['status'],
                      }))
                    }
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      backgroundColor: inputBg,
                      border: `1px solid ${inputBorder}`,
                      borderRadius: '8px',
                      color: textChalk,
                      fontSize: '14px',
                      outline: 'none',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                    }}
                  >
                    <option value="DRAFT" style={{ backgroundColor: '#1E2224' }}>
                      Draft
                    </option>
                    <option value="PUBLISHED" style={{ backgroundColor: '#1E2224' }}>
                      Published
                    </option>
                    <option value="ARCHIVED" style={{ backgroundColor: '#1E2224' }}>
                      Archived
                    </option>
                  </select>
                </div>

                {/* Featured */}
                <div style={{ paddingBottom: '4px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      color: textStone,
                      fontSize: '14px',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, featured: e.target.checked }))
                      }
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: textStone,
                        cursor: 'pointer',
                      }}
                    />
                    Featured
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '28px',
                paddingTop: '20px',
                borderTop: `1px solid ${borderColor}`,
              }}
            >
              <button
                onClick={closeModal}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  border: `1px solid ${borderColor}`,
                  borderRadius: '8px',
                  color: textMuted,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '10px 24px',
                  backgroundColor: saving ? 'rgba(211,208,203,0.05)' : btnPrimaryBg,
                  border: `1px solid ${btnPrimaryBorder}`,
                  borderRadius: '8px',
                  color: saving ? textMuted : textChalk,
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!saving) e.currentTarget.style.backgroundColor = 'rgba(211,208,203,0.18)'
                }}
                onMouseLeave={(e) => {
                  if (!saving) e.currentTarget.style.backgroundColor = btnPrimaryBg
                }}
              >
                {saving ? 'Saving...' : editingId ? 'Update Project' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive table styles */}
      <style>{`
        @media (max-width: 768px) {
          .admin-projects-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  )
}
