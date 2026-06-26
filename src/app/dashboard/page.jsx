import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { LogOut, Trophy, Lock, PlayCircle, BarChart2, MessageCircle } from 'lucide-react'
import { formatDate, formatScore } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: tests } = await supabase.from('mock_tests').select('*').eq('is_active', true).order('test_number')
  const { data: attempts } = await supabase.from('test_attempts').select('*').eq('user_id', user.id)
    .in('status', ['submitted', 'force_submitted']).order('submitted_at', { ascending: false })

  const isPremium = profile?.is_premium ?? false
  const bestScore = attempts?.length > 0 ? Math.max(...attempts.map(a => a.total_score)) : null
  const waMsg = encodeURIComponent('Hi! I want to buy the 3 FAST Mock Tests. Please share your JazzCash/EasyPaisa details so I can send the receipt screenshot.')
  const waUrl = `https://wa.me/923036326202?text=${waMsg}`

  return (
    <div className="min-h-screen" style={{ background: 'var(--navy-dark)' }}>
      <header className="border-b px-4 py-4" style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'var(--navy)' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Welcome back,</p>
            <h1 className="font-bold text-white">{profile?.full_name || user.email}</h1>
          </div>
          <div className="flex items-center gap-3">
            {isPremium ? <span className="badge badge-success">✓ Premium</span> : <span className="badge badge-warning">Pending Access</span>}
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="btn-navy p-2.5" style={{ minHeight: 'auto', padding: '0.5rem' }}>
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {!isPremium && (
          <div className="card text-center" style={{ background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.25)' }}>
            <Lock className="w-8 h-8 mx-auto mb-3" style={{ color: '#f59e0b' }} />
            <h2 className="font-bold text-white text-lg mb-1">Tests Locked — Awaiting Payment Approval</h2>
            <p className="text-gray-400 text-sm mb-4">Send payment via WhatsApp and we'll unlock your access within minutes.</p>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex">
              <MessageCircle className="w-4 h-4" />Pay PKR 300 on WhatsApp
            </a>
          </div>
        )}

        {isPremium && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Tests Taken', value: attempts?.length ?? 0, icon: <PlayCircle className="w-5 h-5" /> },
              { label: 'Best Score', value: bestScore !== null ? formatScore(bestScore) : '—', icon: <Trophy className="w-5 h-5" /> },
              { label: 'Tests Available', value: tests?.length ?? 0, icon: <BarChart2 className="w-5 h-5" /> },
            ].map(s => (
              <div key={s.label} className="card text-center">
                <div className="flex justify-center mb-2" style={{ color: 'var(--cyan)' }}>{s.icon}</div>
                <p className="text-2xl font-extrabold text-white">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div>
          <h2 className="text-xl font-bold text-white mb-4">Your Mock Tests</h2>
          <div className="space-y-4">
            {tests?.map(test => {
              const testAttempts = attempts?.filter(a => a.test_id === test.id) || []
              const bestTestScore = testAttempts.length > 0 ? Math.max(...testAttempts.map(a => a.total_score)) : null
              return (
                <div key={test.id} className="card card-hover">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-lg flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, var(--cyan-dark), var(--cyan))', color: '#fff' }}>
                      {test.test_number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white">{test.title}</h3>
                      <p className="text-sm text-gray-400 mt-0.5">{test.description}</p>
                      <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-400">
                        <span>{test.total_questions || 100} Questions</span>
                        <span>{test.duration_minutes} min</span>
                        {bestTestScore !== null && <span style={{ color: 'var(--cyan)' }}>Best: {formatScore(bestTestScore)} pts</span>}
                        {testAttempts.length > 0 && <span>{testAttempts.length} attempt{testAttempts.length !== 1 ? 's' : ''}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {isPremium ? (
                        <Link href={`/test/${test.id}/start`} className="btn-primary text-sm px-4" style={{ minHeight: 'auto', padding: '0.5rem 1rem' }}>
                          {testAttempts.length > 0 ? 'Retake' : 'Start'}
                        </Link>
                      ) : (
                        <button disabled className="btn-navy text-sm px-4 opacity-50 cursor-not-allowed" style={{ minHeight: 'auto', padding: '0.5rem 1rem' }}>
                          <Lock className="w-3 h-3" /> Locked
                        </button>
                      )}
                      {testAttempts.length > 0 && (
                        <Link href={`/test/${test.id}/results`}
                          className="text-center text-xs font-medium py-1.5 px-3 rounded-lg hover:bg-white/5"
                          style={{ color: 'var(--cyan)', border: '1px solid rgba(0,180,216,0.2)' }}>
                          View Results
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {attempts?.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Recent Attempts</h2>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {attempts.slice(0, 5).map(a => {
                const t = tests?.find(x => x.id === a.test_id)
                return (
                  <div key={a.id} className="flex items-center gap-4 px-5 py-4 border-b hover:bg-white/[0.02]"
                    style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm">{t?.title || 'Mock Test'}</p>
                      <p className="text-xs text-gray-500">{a.submitted_at ? formatDate(a.submitted_at) : '—'} • {a.mode === 'timer' ? '⏱ Timer' : '📖 Practice'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-lg" style={{ color: 'var(--cyan)' }}>{formatScore(a.total_score)}</p>
                      <p className="text-xs text-gray-500">✓{a.correct_count} ✗{a.incorrect_count}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
