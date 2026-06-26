import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatScore, formatDate } from '@/lib/utils'
import { Trophy, CheckCircle, XCircle, MinusCircle, RotateCcw, Home } from 'lucide-react'

export default async function ResultsPage({ params, searchParams }) {
  const { testId } = await params
  const { attempt: attemptId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let attempt
  if (attemptId) {
    const { data } = await supabase.from('test_attempts').select('*').eq('id', attemptId).eq('user_id', user.id).single()
    attempt = data
  } else {
    const { data } = await supabase.from('test_attempts').select('*').eq('user_id', user.id).eq('test_id', testId)
      .in('status', ['submitted','force_submitted']).order('submitted_at', { ascending: false }).limit(1).single()
    attempt = data
  }

  if (!attempt) redirect(`/test/${testId}/start`)

  const { data: test } = await supabase.from('mock_tests').select('*').eq('id', testId).single()
  const { data: questions } = await supabase.from('questions').select('*').eq('test_id', testId).order('question_order')

  const totalQ = questions?.length || 100
  const percentage = ((attempt.total_score / totalQ) * 100).toFixed(1)

  const sections = [
    { subject: 'Advanced Math', score: attempt.score_advanced_math, correct: 0, incorrect: 0, unattempted: 0, total: 30, penalty: 0.25 },
    { subject: 'Basic Math', score: attempt.score_basic_math, correct: 0, incorrect: 0, unattempted: 0, total: 20, penalty: 0.25 },
    { subject: 'Analytical Reasoning', score: attempt.score_analytical, correct: 0, incorrect: 0, unattempted: 0, total: 30, penalty: 0.25 },
    { subject: 'English', score: attempt.score_english, correct: 0, incorrect: 0, unattempted: 0, total: 20, penalty: 0.0825 },
  ]

  if (questions && attempt.answers) {
    questions.forEach(q => {
      const sec = sections.find(s => s.subject === q.subject)
      if (!sec) return
      const ans = attempt.answers[q.id]
      if (!ans) sec.unattempted++
      else if (ans === q.correct_answer) sec.correct++
      else sec.incorrect++
    })
  }

  const scoreColor = (pct) => pct >= 70 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: 'var(--navy-dark)' }}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="card text-center" style={{ padding: '2.5rem' }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: `rgba(${parseFloat(percentage) >= 50 ? '16,185,129' : '239,68,68'},0.15)`, border: `3px solid ${scoreColor(parseFloat(percentage))}` }}>
            <Trophy className="w-9 h-9" style={{ color: scoreColor(parseFloat(percentage)) }} />
          </div>
          <h1 className="text-3xl font-extrabold text-white">{formatScore(attempt.total_score)}<span className="text-gray-400 text-lg"> / {totalQ}</span></h1>
          <p className="text-5xl font-extrabold mt-1" style={{ color: scoreColor(parseFloat(percentage)) }}>{percentage}%</p>
          <p className="text-gray-400 text-sm mt-2">{test?.title}</p>
          {attempt.submitted_at && <p className="text-xs text-gray-500 mt-1">{formatDate(attempt.submitted_at)} • {attempt.mode === 'timer' ? '⏱ Timer' : '📖 Practice'} Mode</p>}
          {attempt.status === 'force_submitted' && <span className="badge badge-warning mt-3 inline-flex">Auto-submitted (time ran out)</span>}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Correct', value: attempt.correct_count, icon: <CheckCircle className="w-4 h-4" />, color: '#10b981' },
            { label: 'Incorrect', value: attempt.incorrect_count, icon: <XCircle className="w-4 h-4" />, color: '#ef4444' },
            { label: 'Skipped', value: attempt.unattempted_count, icon: <MinusCircle className="w-4 h-4" />, color: '#6b7280' },
          ].map(s => (
            <div key={s.label} className="card text-center">
              <div className="flex justify-center mb-1" style={{ color: s.color }}>{s.icon}</div>
              <p className="text-2xl font-extrabold text-white">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 className="font-bold text-white mb-4 text-lg">Section Breakdown</h2>
          <div className="space-y-4">
            {sections.map(s => {
              const pct = Math.max(0, (s.score / s.total) * 100)
              return (
                <div key={s.subject}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-white">{s.subject}</span>
                    <span className="text-sm font-bold" style={{ color: scoreColor(pct) }}>{formatScore(s.score)} / {s.total}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: scoreColor(pct) }} />
                  </div>
                  <div className="flex gap-4 mt-1.5 text-xs text-gray-400">
                    <span className="text-green-400">✓ {s.correct}</span>
                    <span className="text-red-400">✗ {s.incorrect} (-{(s.incorrect * s.penalty).toFixed(2)})</span>
                    <span>— {s.unattempted} skipped</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href={`/test/${testId}/start`} className="btn-primary flex-1 text-center"><RotateCcw className="w-4 h-4" />Retake Test</Link>
          <Link href="/dashboard" className="btn-secondary flex-1 text-center"><Home className="w-4 h-4" />Dashboard</Link>
        </div>
      </div>
    </div>
  )
}
