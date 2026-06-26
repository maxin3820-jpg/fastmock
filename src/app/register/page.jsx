'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GraduationCap, Eye, EyeOff, MessageCircle } from 'lucide-react'
import AdminFooterButton from '@/components/AdminFooterButton'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ full_name: '', whatsapp_number: '', email: '', university: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()

    // Step 1: Sign up — email confirmation must be DISABLED in Supabase dashboard
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: form.email.trim().toLowerCase(),
      password: form.password,
      options: {
        emailRedirectTo: undefined,
        data: {
          full_name: form.full_name.trim(),
          whatsapp_number: form.whatsapp_number.trim(),
          university: form.university.trim(),
        },
      },
    })

    if (signUpError) {
      // Handle "user already exists" gracefully
      if (signUpError.message.toLowerCase().includes('already registered') ||
          signUpError.message.toLowerCase().includes('already exists') ||
          signUpError.message.toLowerCase().includes('user already')) {
        setError('An account with this email already exists. Please login instead.')
      } else {
        setError(signUpError.message)
      }
      setLoading(false)
      return
    }

    // Step 2: Session is returned directly if email confirmation is OFF in Supabase.
    // If session exists, go straight to dashboard.
    if (signUpData.session) {
      router.push('/dashboard')
      router.refresh()
      return
    }

    // Step 3: No session means Supabase still requires email confirmation.
    // Try signing in immediately — works if the user was already confirmed.
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email.trim().toLowerCase(),
      password: form.password,
    })

    if (!signInError && signInData.session) {
      router.push('/dashboard')
      router.refresh()
      return
    }

    // Couldn't log in — Supabase email confirmation is still ON
    setError('Account created! Check your email to confirm, then login. (Or ask admin to disable email confirmation in Supabase.)')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 gradient-cyber">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-extrabold text-xl">
            <GraduationCap className="w-7 h-7" style={{ color: 'var(--cyan)' }} />
            <span className="gradient-text">FAST PrepPro</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-4">Create Your Account</h1>
          <p className="text-gray-400 text-sm mt-1">Sign up free. Unlock tests after payment.</p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={submit} className="space-y-4">
            {[
              { name: 'full_name', label: 'Full Name', type: 'text', placeholder: 'e.g. Ahmed Ali' },
              { name: 'whatsapp_number', label: 'WhatsApp Number', type: 'tel', placeholder: 'e.g. 03001234567' },
              { name: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
              { name: 'university', label: 'Target / Current University', type: 'text', placeholder: 'e.g. FAST-NUCES (Target)' },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">{f.label} *</label>
                <input
                  name={f.name}
                  value={form[f.name]}
                  onChange={handle}
                  required
                  className="input-field"
                  type={f.type}
                  placeholder={f.placeholder}
                  autoComplete="off"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password *</label>
              <div className="relative">
                <input
                  name="password"
                  value={form.password}
                  onChange={handle}
                  required
                  className="input-field pr-12"
                  placeholder="Min. 8 characters"
                  type={showPw ? 'text' : 'password'}
                  minLength={8}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg p-3 text-sm" style={{
                background: error.includes('created') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                color: error.includes('created') ? '#10b981' : '#ef4444',
                border: `1px solid ${error.includes('created') ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full text-base mt-2">
              {loading ? <><div className="spinner w-4 h-4" />Creating account...</> : 'Create Account — Free'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-xs text-gray-500 mb-3">After registering, send payment via WhatsApp to unlock tests:</p>
            <a
              href={`https://wa.me/923036326202?text=${encodeURIComponent('Hi! I want to buy the 3 FAST Mock Tests. Please share your JazzCash/EasyPaisa details so I can send the receipt screenshot.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold"
              style={{ color: '#25D366' }}
            >
              <MessageCircle className="w-4 h-4" />Pay PKR 300 on WhatsApp
            </a>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold hover:underline" style={{ color: 'var(--cyan)' }}>
            Login here
          </Link>
        </p>
        <div className="text-center mt-4">
          <AdminFooterButton />
        </div>
      </div>
    </div>
  )
}
