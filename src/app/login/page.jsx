'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GraduationCap, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 gradient-cyber">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-extrabold text-xl">
            <GraduationCap className="w-7 h-7" style={{ color: 'var(--cyan)' }} />
            <span className="gradient-text">FAST PrepPro</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-4">Welcome Back</h1>
          <p className="text-gray-400 text-sm mt-1">Login to access your mock tests.</p>
        </div>
        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
              <input value={email} onChange={e => setEmail(e.target.value)} required className="input-field" placeholder="you@example.com" type="email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input value={password} onChange={e => setPassword(e.target.value)} required className="input-field pr-12" placeholder="Your password" type={showPw ? 'text' : 'password'} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <div className="rounded-lg p-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full text-base">
              {loading ? <><div className="spinner w-4 h-4" />Logging in...</> : 'Login'}
            </button>
          </form>
        </div>
        <p className="text-center text-gray-400 text-sm mt-6">
          No account yet?{' '}
          <Link href="/register" className="font-semibold hover:underline" style={{ color: 'var(--cyan)' }}>Sign up free</Link>
        </p>
      </div>
    </div>
  )
}
