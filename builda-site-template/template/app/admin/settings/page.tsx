'use client'

import { useState, useEffect } from 'react'
import { useAdmin } from '@/lib/admin-auth'

interface Setting {
  key: string
  value: string
}

const DEFAULT_KEYS = [
  'siteName',
  'siteDescription',
  'contactEmail',
  'socialTwitter',
  'socialLinkedin',
  'socialGithub',
  'socialDribbble',
]

const LABEL_MAP: Record<string, string> = {
  siteName: 'Site Name',
  siteDescription: 'Site Description',
  contactEmail: 'Contact Email',
  socialTwitter: 'Twitter',
  socialLinkedin: 'LinkedIn',
  socialGithub: 'GitHub',
  socialDribbble: 'Dribbble',
}

export default function SettingsPage() {
  const { user, loading } = useAdmin()
  const [settings, setSettings] = useState<Setting[]>([])
  const [fetching, setFetching] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings', { credentials: 'include' })
        if (!res.ok) throw new Error('Failed to fetch settings')
        const data: Array<{ key: string; value: string }> = await res.json()

        const settingsMap = new Map<string, string>()
        data.forEach((s) => settingsMap.set(s.key, s.value))

        const merged: Setting[] = DEFAULT_KEYS.map((key) => ({
          key,
          value: settingsMap.get(key) || '',
        }))

        // Add any extra settings from DB that aren't in defaults
        data.forEach((s) => {
          if (!DEFAULT_KEYS.includes(s.key)) {
            merged.push({ key: s.key, value: s.value })
          }
        })

        setSettings(merged)
      } catch {
        showToast('Failed to load settings', 'error')
      } finally {
        setFetching(false)
      }
    }

    if (!loading && user) {
      fetchSettings()
    }
  }, [loading, user])

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  function handleChange(index: number, field: 'key' | 'value', newValue: string) {
    setSettings((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: newValue }
      return updated
    })
  }

  function addSetting() {
    setSettings((prev) => [...prev, { key: '', value: '' }])
  }

  function removeSetting(index: number) {
    setSettings((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    const valid = settings.filter((s) => s.key.trim() !== '')
    if (valid.length === 0) {
      showToast('No settings to save', 'error')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ settings: valid }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save settings')
      }

      showToast('Settings saved successfully', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save settings', 'error')
    } finally {
      setSaving(false)
    }
  }

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

  const isDefault = (key: string) => DEFAULT_KEYS.includes(key)

  return (
    <div style={{ padding: '48px 32px', maxWidth: '800px' }}>
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
            backgroundColor: toast.type === 'success' ? 'rgba(30, 34, 36, 0.95)' : 'rgba(30, 34, 36, 0.95)',
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
        Settings
      </h1>
      <p
        style={{
          fontSize: '13px',
          color: 'rgba(211, 208, 203, 0.5)',
          marginBottom: '40px',
          fontFamily: 'var(--font-space-mono), monospace',
        }}
      >
        Manage site configuration and social links
      </p>

      {/* Settings Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {settings.map((setting, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
            }}
          >
            {/* Label / Key */}
            {isDefault(setting.key) ? (
              <div
                style={{
                  width: '180px',
                  flexShrink: 0,
                  fontSize: '13px',
                  fontFamily: 'var(--font-space-mono), monospace',
                  color: '#D3D0CB',
                  paddingTop: '2px',
                }}
              >
                {LABEL_MAP[setting.key] || setting.key}
              </div>
            ) : (
              <input
                type="text"
                placeholder="Key"
                value={setting.key}
                onChange={(e) => handleChange(index, 'key', e.target.value)}
                style={{
                  width: '180px',
                  flexShrink: 0,
                  padding: '10px 14px',
                  fontSize: '13px',
                  fontFamily: 'var(--font-space-mono), monospace',
                  color: '#E7E5DF',
                  backgroundColor: 'rgba(30, 34, 36, 0.8)',
                  border: '1px solid rgba(57, 62, 65, 0.4)',
                  borderRadius: '6px',
                  outline: 'none',
                }}
              />
            )}

            {/* Value */}
            <input
              type="text"
              placeholder="Value"
              value={setting.value}
              onChange={(e) => handleChange(index, 'value', e.target.value)}
              style={{
                flex: 1,
                padding: '10px 14px',
                fontSize: '13px',
                fontFamily: 'var(--font-space-mono), monospace',
                color: '#E7E5DF',
                backgroundColor: 'rgba(30, 34, 36, 0.8)',
                border: '1px solid rgba(57, 62, 65, 0.4)',
                borderRadius: '6px',
                outline: 'none',
              }}
            />

            {/* Remove (only for custom settings) */}
            {!isDefault(setting.key) && (
              <button
                onClick={() => removeSetting(index)}
                style={{
                  width: '36px',
                  height: '36px',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  color: 'rgba(211, 208, 203, 0.4)',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(57, 62, 65, 0.3)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
                title="Remove setting"
              >
                &times;
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginTop: '32px',
          alignItems: 'center',
        }}
      >
        <button
          onClick={addSetting}
          style={{
            padding: '10px 20px',
            fontSize: '13px',
            fontFamily: 'var(--font-space-mono), monospace',
            color: '#D3D0CB',
            backgroundColor: 'transparent',
            border: '1px solid rgba(57, 62, 65, 0.4)',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          + Add Setting
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '10px 28px',
            fontSize: '13px',
            fontFamily: 'var(--font-space-mono), monospace',
            fontWeight: 600,
            color: '#1E2224',
            backgroundColor: '#E7E5DF',
            border: 'none',
            borderRadius: '6px',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
