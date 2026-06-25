import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import LeaderboardSection from '@/components/LeaderboardSection'
import {
  CheckCircle, Clock, BarChart2, RefreshCw,
  Zap, ShieldCheck, BookOpen, Target, ChevronRight,
  MessageCircle, Star, AlertTriangle
} from 'lucide-react'

async function getSiteConfig() {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('site_config').select('key,value')
    const cfg: Record<string, string> = {}
    data?.forEach((r: { key: string; value: string }) => { cfg[r.key] = r.value })
    return cfg
  } catch {
    return {}
  }
}

export default async function HomePage() {
  const cfg = await getSiteConfig()
  const headline = cfg.headline || 'Crack FAST Entry Test. Guaranteed.'
  const subtext = cfg.subtext || "Pakistan's most accurate FAST University mock tests — 300+ premium MCQs, exact negative marking, unlimited retakes."
  const price = cfg.price || 'PKR 300'
  const whatsapp = cfg.whatsapp_number || '923036326202'
  const waMsg = encodeURIComponent('Hi! I want to buy the 3 FAST Mock Tests. Please share your JazzCash/EasyPaisa details so I can send the receipt screenshot.')
  const waUrl = `https://wa.me/${whatsapp}?text=${waMsg}`

  const features = [
    { icon: <Target className="w-5 h-5" />, title: 'Exact FAST Pattern', desc: 'Questions mapped 1:1 to real FAST entry test format and difficulty.' },
    { icon: <AlertTriangle className="w-5 h-5" />, title: 'Negative Marking', desc: '-0.25 Math/IQ, -0.0825 English. Exactly like the real exam.' },
    { icon: <BookOpen className="w-5 h-5" />, title: '300+ Premium MCQs', desc: '3 full-length tests covering every section of the FAST syllabus.' },
    { icon: <RefreshCw className="w-5 h-5" />, title: 'Unlimited Retakes', desc: "Practice until you're confident. No limits, no extra charges." },
    { icon: <Clock className="w-5 h-5" />, title: 'Timer Mode', desc: 'Simulate real exam pressure with a 2-hour countdown timer.' },
    { icon: <BarChart2 className="w-5 h-5" />, title: 'Detailed Analytics', desc: 'Section-wise breakdown: see exactly where you lose marks.' },
    { icon: <ShieldCheck className="w-5 h-5" />, title: 'Auto-Save Progress', desc: 'Phone died? Internet dropped? Your answers are always safe.' },
    { icon: <Zap className="w-5 h-5" />, title: 'Mobile Optimised', desc: 'Designed for mobile. Take the test anywhere, anytime.' },
  ]

  const sections = [
    { name: 'Advanced Math', qs: 30, mark: '+1 / -0.25' },
    { name: 'Basic Math', qs: 20, mark: '+1 / -0.25' },
    { name: 'Analytical Reasoning', qs: 30, mark: '+1 / -0.25' },
    { name: 'English', qs: 20, mark: '+1 / -0.0825' },
  ]

  return (
    <div className="min-h-screen gradient-cyber">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative hero-pattern pt-16 pb-20 px-4 text-center overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(var(--cyan), transparent 70%)' }} />

        <div className="relative max-w-4xl mx-auto fade-in">
          <div className="inline-flex items-center gap-2 badge badge-cyan mb-6 text-sm">
            <Star className="w-3.5 h-3.5" fill="currentColor" />
            <span>Only {price} — One-Time Payment</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
            {headline.split('FAST').map((part, i) =>
              i === 0 ? <span key={i}>{part}</span> : (
                <span key={i}><span className="gradient-text">FAST</span>{part}</span>
              )
            )}
          </h1>

          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            {subtext}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-lg px-8 py-4 glow-cyan w-full sm:w-auto">
              <MessageCircle className="w-5 h-5" />
              Unlock All 3 Tests — {price}
            </a>
            <Link href="/login" className="btn-secondary px-8 py-4 w-full sm:w-auto">
              Already have access? Login
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-gray-400">
            {['✓ 300+ MCQs', '✓ 3 Full Tests', '✓ Exact Pattern', '✓ Unlimited Retakes', '✓ Mobile Friendly'].map(t => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEST PATTERN ── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="badge badge-cyan mb-3">📐 Exam Structure</span>
            <h2 className="text-3xl font-extrabold text-white mb-3">Exact FAST Entry Test Pattern</h2>
            <p className="text-gray-400">Every section matches the official FAST University pattern.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sections.map(s => (
              <div key={s.name} className="card card-hover flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(0,180,216,0.1)', border: '1px solid rgba(0,180,216,0.2)' }}>
                  <BookOpen className="w-5 h-5" style={{ color: 'var(--cyan)' }} />
                </div>
                <div>
                  <p className="font-bold text-white">{s.name}</p>
                  <p className="text-sm text-gray-400">{s.qs} Questions • {s.mark}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 card text-center">
            <p className="text-gray-300 text-sm">
              <span className="font-bold text-white">Total: 100 Questions</span> &nbsp;•&nbsp;
              <span className="font-bold" style={{ color: 'var(--cyan)' }}>Duration: 2 Hours</span> &nbsp;•&nbsp;
              <span>Max Score: 100 pts</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="badge badge-cyan mb-3">⚡ What You Get</span>
            <h2 className="text-3xl font-extrabold text-white">Everything You Need to Crack FAST</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <div key={f.title} className="card card-hover">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(0,180,216,0.1)', border: '1px solid rgba(0,180,216,0.15)', color: 'var(--cyan)' }}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-white text-sm mb-1">{f.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEADERBOARD ── */}
      <LeaderboardSection />

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="badge badge-cyan mb-3">📋 How It Works</span>
            <h2 className="text-3xl font-extrabold text-white">Get Started in 3 Steps</h2>
          </div>
          <div className="space-y-4">
            {[
              { n: '1', t: 'Sign Up Free', d: 'Create your account with your name, WhatsApp, email, and university.' },
              { n: '2', t: 'Pay PKR 300', d: 'Click "Unlock Tests", send payment screenshot via WhatsApp. Access unlocked within minutes.' },
              { n: '3', t: 'Start Practicing', d: 'Attempt all 3 mock tests, track your scores, and climb the leaderboard.' },
            ].map(s => (
              <div key={s.n} className="card card-hover flex items-start gap-4">
                <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-extrabold text-sm"
                  style={{ background: 'linear-gradient(135deg, var(--cyan-dark), var(--cyan))', color: '#fff' }}>
                  {s.n}
                </div>
                <div>
                  <h3 className="font-bold text-white">{s.t}</h3>
                  <p className="text-gray-400 text-sm mt-1">{s.d}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0 mt-1 ml-auto hidden sm:block" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BOTTOM ── */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="card glow-cyan text-center" style={{ background: 'linear-gradient(135deg, rgba(0,119,182,0.15), rgba(0,180,216,0.08))' }}>
            <h2 className="text-3xl font-extrabold text-white mb-3">Ready to Ace FAST?</h2>
            <p className="text-gray-300 mb-8">Join hundreds of students who are scoring higher with our premium mock tests.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={waUrl} target="_blank" rel="noopener noreferrer"
                className="btn-primary text-lg px-8 py-4 glow-cyan">
                <MessageCircle className="w-5 h-5" />
                Buy Now — {price} Only
              </a>
              <Link href="/register" className="btn-secondary px-8 py-4">
                Create Free Account
              </Link>
            </div>
            <p className="text-xs text-gray-500 mt-4">One-time payment. No subscriptions. Unlimited access.</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t py-8 px-4 text-center" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} FAST PrepPro — Not affiliated with FAST University.
          For aspirants, by aspirants.
        </p>
      </footer>
    </div>
  )
}
