'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        return
      }

      router.push('/admin')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    fontSize: 14,
    background: 'rgba(30,34,36,0.8)',
    border: '1px solid rgba(57,62,65,0.4)',
    borderRadius: 6,
    color: '#E7E5DF',
    outline: 'none',
    transition: 'border-color 0.15s ease',
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: 'rgba(30,34,36,0.6)',
          border: '1px solid rgba(57,62,65,0.4)',
          borderRadius: 12,
          padding: '40px 32px',
        }}
      >
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: '#E7E5DF',
              margin: 0,
            }}
          >
            BUILDA{' '}
            <span
              style={{
                fontWeight: 400,
                color: '#D3D0CB',
                fontSize: 18,
              }}
            >
              Admin
            </span>
          </h1>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              marginBottom: 20,
              padding: '10px 14px',
              borderRadius: 6,
              background: 'rgba(57,62,65,0.3)',
              border: '1px solid rgba(57,62,65,0.5)',
              color: '#D3D0CB',
              fontSize: 13,
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 500,
                color: '#D3D0CB',
                marginBottom: 6,
                letterSpacing: '0.02em',
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@builda.studio"
              required
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(211,208,203,0.3)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(57,62,65,0.4)'
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 500,
                color: '#D3D0CB',
                marginBottom: 6,
                letterSpacing: '0.02em',
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(211,208,203,0.3)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(57,62,65,0.4)'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '11px 20px',
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: '0.02em',
              border: '1px solid rgba(57,62,65,0.5)',
              borderRadius: 6,
              background: 'rgba(57,62,65,0.35)',
              color: '#E7E5DF',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.6 : 1,
              transition: 'background 0.15s ease, opacity 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.background = 'rgba(57,62,65,0.55)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(57,62,65,0.35)'
            }}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>

      {/* Global placeholder color override */}
      <style>{`
        input::placeholder {
          color: rgba(211,208,203,0.3) !important;
        }
      `}</style>
    </div>
  )
}
