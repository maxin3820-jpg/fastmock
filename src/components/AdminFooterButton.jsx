'use client'
import { useState } from 'react'
import { ShieldCheck, Eye, EyeOff, X, Loader } from 'lucide-react'

export default function AdminFooterButton() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      if (res.ok) {
        window.location.href = '/admin'
      } else {
        const d = await res.json()
        setError(d.error || 'Invalid credentials')
        setLoading(false)
      }
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      {/* Discreet admin button in footer */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 transition-colors mt-2"
        aria-label="Admin access"
      >
        <ShieldCheck className="w-3 h-3" />
        Admin
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-sm rounded-2xl shadow-2xl"
            style={{ background: 'var(--navy)', border: '1px solid rgba(0,180,216,0.2)' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b"
              style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" style={{ color: 'var(--cyan)' }} />
                <span className="font-bold text-white">Admin Access</span>
              </div>
              <button onClick={() => { setOpen(false); setError(''); setEmail(''); setPassword('') }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  type="email"
                  placeholder="admin@example.com"
                  className="input-field text-sm"
                  style={{ minHeight: '44px' }}
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    type={showPw ? 'text' : 'password'}
                    placeholder="Password"
                    className="input-field text-sm pr-10"
                    style={{ minHeight: '44px' }}
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-0.5">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg px-3 py-2 text-xs font-medium"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full text-sm" style={{ minHeight: '44px' }}>
                {loading
                  ? <><Loader className="w-4 h-4 animate-spin" />Logging in...</>
                  : <><ShieldCheck className="w-4 h-4" />Enter Admin Panel</>
                }
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
