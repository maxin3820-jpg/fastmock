'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Send, Clock, XCircle, Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { calculateScore } from '@/lib/utils'

const SUBJECTS = ['Advanced Math', 'Basic Math', 'Analytical Reasoning', 'English']
const SAVE_KEY = (id) => `quiz_state_${id}`

export default function QuizEngine({ attempt, questions, testId }) {
  const router = useRouter()
  const supabase = createClient()
  const timerRef = useRef(null)
  const saveRef = useRef(null)
  const [navOpen, setNavOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const loadState = () => {
    try {
      const saved = localStorage.getItem(SAVE_KEY(attempt.id))
      if (saved) {
        const p = JSON.parse(saved)
        return { answers: p.answers || attempt.answers || {}, currentIdx: p.currentIdx || 0, timeLeft: p.timeLeft ?? (attempt.time_remaining_seconds ?? 0) }
      }
    } catch {}
    return { answers: attempt.answers || {}, currentIdx: 0, timeLeft: attempt.time_remaining_seconds ?? 0 }
  }

  const init = loadState()
  const [answers, setAnswers] = useState(init.answers)
  const [currentIdx, setCurrentIdx] = useState(init.currentIdx)
  const [timeLeft, setTimeLeft] = useState(init.timeLeft)
  const isTimer = attempt.mode === 'timer'
  const current = questions[currentIdx]

  const persistLocal = useCallback(() => {
    localStorage.setItem(SAVE_KEY(attempt.id), JSON.stringify({ answers, currentIdx, timeLeft }))
  }, [answers, currentIdx, timeLeft, attempt.id])

  const saveToDb = useCallback(async (ans, tl) => {
    await supabase.from('test_attempts').update({ answers: ans, time_remaining_seconds: tl }).eq('id', attempt.id)
  }, [supabase, attempt.id])

  const submitTest = useCallback(async (force = false, ans = answers, tl = timeLeft) => {
    setSubmitting(true)
    if (timerRef.current) clearInterval(timerRef.current)
    if (saveRef.current) clearInterval(saveRef.current)

    const scores = { 'Advanced Math': { c: 0, w: 0 }, 'Basic Math': { c: 0, w: 0 }, 'Analytical Reasoning': { c: 0, w: 0 }, 'English': { c: 0, w: 0 } }
    questions.forEach(q => {
      const b = scores[q.subject]
      if (!b) return
      const a = ans[q.id]
      if (!a) return
      if (a === q.correct_answer) b.c++; else b.w++
    })

    const advMath = calculateScore('Advanced Math', scores['Advanced Math'].c, scores['Advanced Math'].w)
    const basicMath = calculateScore('Basic Math', scores['Basic Math'].c, scores['Basic Math'].w)
    const analytical = calculateScore('Analytical Reasoning', scores['Analytical Reasoning'].c, scores['Analytical Reasoning'].w)
    const english = calculateScore('English', scores['English'].c, scores['English'].w)
    const total = advMath + basicMath + analytical + english

    const totalCorrect = Object.values(scores).reduce((s, v) => s + v.c, 0)
    const totalIncorrect = Object.values(scores).reduce((s, v) => s + v.w, 0)
    const totalUnattempted = questions.length - totalCorrect - totalIncorrect

    await supabase.from('test_attempts').update({
      answers: ans, status: force ? 'force_submitted' : 'submitted', time_remaining_seconds: tl,
      score_advanced_math: advMath, score_basic_math: basicMath, score_analytical: analytical, score_english: english,
      total_score: total, correct_count: totalCorrect, incorrect_count: totalIncorrect,
      unattempted_count: totalUnattempted, submitted_at: new Date().toISOString(),
    }).eq('id', attempt.id)

    localStorage.removeItem(SAVE_KEY(attempt.id))
    router.push(`/test/${testId}/results?attempt=${attempt.id}`)
  }, [answers, timeLeft, questions, supabase, attempt.id, testId, router])

  useEffect(() => {
    if (!isTimer || timeLeft <= 0) return
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1
        if (next <= 0) { clearInterval(timerRef.current); submitTest(true, answers, 0); return 0 }
        return next
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimer])

  useEffect(() => {
    saveRef.current = setInterval(() => { persistLocal(); saveToDb(answers, timeLeft) }, 30000)
    return () => { if (saveRef.current) clearInterval(saveRef.current) }
  }, [answers, timeLeft, persistLocal, saveToDb])

  useEffect(() => { persistLocal() }, [answers, currentIdx, timeLeft, persistLocal])

  const answer = (opt) => setAnswers(prev => ({ ...prev, [current.id]: opt }))
  const clearAnswer = () => setAnswers(prev => ({ ...prev, [current.id]: null }))

  const formatTime = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  }

  const getColor = (q) => answers[q.id] ? 'rgba(0,180,216,0.25)' : 'rgba(255,255,255,0.06)'
  const answered = Object.values(answers).filter(Boolean).length
  const timerWarning = isTimer && timeLeft <= 300
  const questionsBySubject = SUBJECTS.map(s => ({ subject: s, qs: questions.filter(q => q.subject === s) }))

  const NavPanel = () => (
    <div className="p-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Navigate Questions</p>
      {questionsBySubject.map(({ subject, qs }) => (
        <div key={subject} className="mb-4">
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--cyan)' }}>{subject}</p>
          <div className="flex flex-wrap gap-1.5">
            {qs.map(q => {
              const gi = questions.indexOf(q)
              return (
                <button key={q.id} onClick={() => { setCurrentIdx(gi); setNavOpen(false) }}
                  className="w-8 h-8 rounded-lg text-xs font-bold transition-all"
                  style={{ background: currentIdx === gi ? 'var(--cyan)' : getColor(q), color: currentIdx === gi ? '#000' : answers[q.id] ? 'var(--cyan)' : '#9ca3af', border: currentIdx === gi ? 'none' : '1px solid rgba(255,255,255,0.08)' }}>
                  {gi + 1}
                </button>
              )
            })}
          </div>
        </div>
      ))}
      <button onClick={() => submitTest()} disabled={submitting} className="btn-primary w-full mt-4 text-sm" style={{ minHeight: '40px' }}>
        {submitting ? <><div className="spinner w-3.5 h-3.5" />Submitting...</> : <><Send className="w-4 h-4" />Submit Test</>}
      </button>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--navy-dark)' }}>
      <header className="sticky top-0 z-40 border-b px-4 py-3 flex items-center gap-3"
        style={{ background: 'var(--navy)', borderColor: 'rgba(255,255,255,0.07)' }}>
        <button onClick={() => setNavOpen(true)} className="p-2 rounded-lg hover:bg-white/5 md:hidden"><Menu className="w-5 h-5 text-gray-400" /></button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400">Question {currentIdx + 1} of {questions.length}</p>
          <p className="font-bold text-white text-sm truncate">{current?.subject}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{answered}/{questions.length} answered</span>
          {isTimer && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-bold text-sm"
              style={{ background: timerWarning ? 'rgba(239,68,68,0.15)' : 'rgba(0,180,216,0.1)', color: timerWarning ? '#ef4444' : 'var(--cyan)', border: `1px solid ${timerWarning ? 'rgba(239,68,68,0.3)' : 'rgba(0,180,216,0.2)'}` }}>
              <Clock className="w-3.5 h-3.5" />{formatTime(timeLeft)}
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden md:flex flex-col w-64 border-r overflow-y-auto" style={{ background: 'var(--navy)', borderColor: 'rgba(255,255,255,0.07)' }}>
          <NavPanel />
        </aside>

        {navOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setNavOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-72 overflow-y-auto" style={{ background: 'var(--navy)' }}>
              <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <p className="font-bold text-white text-sm">Question Navigator</p>
                <button onClick={() => setNavOpen(false)} className="p-1"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <NavPanel />
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto px-4 py-6 flex flex-col">
          <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
            <div className="card flex-1 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="badge badge-cyan text-xs">{current?.subject}</span>
                <span className="text-xs text-gray-500">Q{currentIdx + 1}/{questions.length}</span>
              </div>
              <p className="text-white leading-relaxed text-base font-medium mb-6 whitespace-pre-wrap">{current?.question_text}</p>
              <div className="space-y-3">
                {['A','B','C','D'].map(opt => {
                  const text = current?.[`option_${opt.toLowerCase()}`]
                  const selected = answers[current?.id] === opt
                  return (
                    <button key={opt} onClick={() => answer(opt)} className="w-full text-left p-4 rounded-xl transition-all flex items-start gap-3"
                      style={{ background: selected ? 'rgba(0,180,216,0.15)' : 'rgba(255,255,255,0.03)', border: `2px solid ${selected ? 'var(--cyan)' : 'rgba(255,255,255,0.07)'}` }}>
                      <span className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-extrabold"
                        style={{ background: selected ? 'var(--cyan)' : 'rgba(255,255,255,0.07)', color: selected ? '#000' : '#9ca3af' }}>
                        {opt}
                      </span>
                      <span className="text-sm leading-relaxed" style={{ color: selected ? '#fff' : '#d1d5db' }}>{text}</span>
                    </button>
                  )
                })}
              </div>
              {answers[current?.id] && (
                <button onClick={clearAnswer} className="mt-4 flex items-center gap-1.5 text-sm font-medium" style={{ color: '#f59e0b' }}>
                  <XCircle className="w-4 h-4" />Clear Answer (skip safely)
                </button>
              )}
            </div>
            <div className="flex gap-3 pb-6">
              <button onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} disabled={currentIdx === 0} className="btn-secondary flex-1 disabled:opacity-40">
                <ChevronLeft className="w-5 h-5" />Previous
              </button>
              {currentIdx < questions.length - 1 ? (
                <button onClick={() => setCurrentIdx(Math.min(questions.length - 1, currentIdx + 1))}
                  className="flex-1 font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                  style={{ background: 'var(--navy)', color: '#fff', border: '2px solid var(--cyan)', minHeight: '48px' }}>
                  Next<ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button onClick={() => submitTest()} disabled={submitting} className="btn-primary flex-1">
                  {submitting ? <><div className="spinner w-4 h-4" />Submitting</> : <><Send className="w-4 h-4" />Submit</>}
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
