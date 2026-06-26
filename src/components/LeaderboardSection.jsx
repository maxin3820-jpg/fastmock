'use client'
import { useEffect, useState } from 'react'
import { Trophy, Medal, Award } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatScore, ordinalSuffix } from '@/lib/utils'

const rankIcons = [
  <Trophy key={1} className="w-5 h-5" style={{ color: '#FFD700' }} />,
  <Medal  key={2} className="w-5 h-5" style={{ color: '#C0C0C0' }} />,
  <Award  key={3} className="w-5 h-5" style={{ color: '#CD7F32' }} />,
]

export default function LeaderboardSection() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('leaderboard')
      .select('*')
      .order('rank', { ascending: true })
      .limit(10)
      .then(({ data }) => {
        setEntries(data || [])
        setLoading(false)
      })
  }, [])

  return (
    <section id="leaderboard" className="py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <span className="badge badge-cyan mb-3">🏆 Live Rankings</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Student Leaderboard</h2>
          <p className="text-gray-400">Top performers ranked by highest mock test aggregate score.</p>
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="flex items-center gap-3 px-5 py-4 border-b"
            style={{ borderColor: 'rgba(0,180,216,0.15)', background: 'rgba(0,180,216,0.05)' }}>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-10">Rank</span>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex-1">Student</span>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Score</span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <div className="spinner w-6 h-6" />
              <span className="text-gray-400 text-sm">Loading rankings...</span>
            </div>
          ) : entries.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No scores yet. Be the first!</p>
            </div>
          ) : (
            entries.map((entry, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4 border-b hover:bg-white/[0.02]"
                style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                <div className="w-10 flex items-center justify-center">
                  {i < 3 ? rankIcons[i] : (
                    <span className="text-sm font-bold text-gray-500">{ordinalSuffix(entry.rank)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{entry.full_name}</p>
                  <p className="text-xs text-gray-500">{entry.attempts_count} attempt{entry.attempts_count !== 1 ? 's' : ''}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-extrabold" style={{ color: 'var(--cyan)' }}>
                    {formatScore(entry.highest_score)}
                  </span>
                  <p className="text-xs text-gray-500">pts</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
