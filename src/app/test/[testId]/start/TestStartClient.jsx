'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, BookOpen, AlertTriangle, PlayCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function TestStartClient({ test, userId }) {
  const router = useRouter()
  const [mode, setMode] = useState('timer')
  const [loading, setLoading] = useState(false)

  const startTest = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: existing } = await supabase.from('test_attempts').select('id').eq('user_id', userId).eq('test_id', test.id).eq('status', 'in_progress').order('created_at', { ascending: false }).limit(1).single()
    if (existing) { router.push(`/test/${test.id}/attempt/${existing.id}`); return }
    const { data: attempt, error } = await supabase.from('test_attempts').insert({
      user_id: userId, test_id: test.id, mode,
      time_remaining_seconds: mode === 'timer' ? test.duration_minutes * 60 : null,
      answers: {},
    }).select().single()
    if (error || !attempt) { setLoading(false); return }
    router.push(`/test/${test.id}/attempt/${attempt.id}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 gradient-cyber">
      <div className="w-full max-w-lg">
        <div className="card" style={{ padding: '2rem' }}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, var(--cyan-dark), var(--cyan))' }}>
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">{test.title}</h1>
            <p className="text-gray-400 text-sm mt-2">{test.description}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[{ label: 'Questions', value: '100' }, { label: 'Duration', value: `${test.duration_minutes} min` }, { label: 'Max Score', value: '100 pts' }].map(s => (
              <div key={s.label} className="text-center py-3 px-2 rounded-xl" style={{ background: 'rgba(0,180,216,0.06)', border: '1px solid rgba(0,180,216,0.12)' }}>
                <p className="font-extrabold text-white text-lg">{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="mb-8">
            <p className="text-sm font-semibold text-gray-300 mb-3">Choose Your Mode</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'timer', icon: <Clock className="w-5 h-5 mb-2" />, title: 'Timer Mode', desc: 'Real exam experience with 2-hour countdown' },
                { id: 'practice', icon: <BookOpen className="w-5 h-5 mb-2" />, title: 'Practice Mode', desc: 'No timer. Take your time and learn.' },
              ].map(m => (
                <button key={m.id} onClick={() => setMode(m.id)} className="p-4 rounded-xl text-left transition-all"
                  style={{ background: mode === m.id ? 'rgba(0,180,216,0.12)' : 'rgba(255,255,255,0.03)', border: `2px solid ${mode === m.id ? 'var(--cyan)' : 'rgba(255,255,255,0.07)'}` }}>
                  <div style={{ color: mode === m.id ? 'var(--cyan)' : '#9ca3af' }}>{m.icon}</div>
                  <p className="font-bold text-sm text-white">{m.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl mb-6" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
            <p className="text-xs text-gray-300"><strong style={{ color: '#f59e0b' }}>Negative Marking:</strong> Math/IQ: -0.25 per wrong. English: -0.0825 per wrong. Use Clear Answer to skip safely.</p>
          </div>
          <button onClick={startTest} disabled={loading} className="btn-primary w-full text-base">
            {loading ? <><div className="spinner w-4 h-4" />Starting...</> : <><PlayCircle className="w-5 h-5" />Start Test</>}
          </button>
          <button onClick={() => router.push('/dashboard')} className="w-full text-center text-sm text-gray-400 hover:text-white mt-4 py-2 transition-colors">← Back to Dashboard</button>
        </div>
      </div>
    </div>
  )
}
