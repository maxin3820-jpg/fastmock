'use client'
import { useState } from 'react'
import { Users, Settings, Upload, BarChart2, LogOut, ShieldCheck, Search, CheckSquare, Square, Check, X, RefreshCw } from 'lucide-react'
import { formatDate } from '@/lib/utils'

type Tab = 'analytics' | 'users' | 'config' | 'quiz'

interface Profile {
  id: string; full_name: string; whatsapp_number: string; email: string;
  university: string; is_premium: boolean; created_at: string
}

export default function AdminDashboardClient({ stats, initialConfig }: {
  stats: { total: number; premium: number }
  initialConfig: Record<string, string>
}) {
  const [tab, setTab] = useState<Tab>('analytics')
  const [users, setUsers] = useState<Profile[]>([])
  const [usersLoaded, setUsersLoaded] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'premium' | 'pending'>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMsg, setActionMsg] = useState('')
  const [grantEmail, setGrantEmail] = useState('')
  const [grantLoading, setGrantLoading] = useState(false)
  const [config, setConfig] = useState(initialConfig)
  const [configSaving, setConfigSaving] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadTestId, setUploadTestId] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')
  const [tests, setTests] = useState<{ id: string; title: string }[]>([])

  const loadUsers = async () => {
    const res = await fetch('/api/admin/users')
    const data = await res.json()
    setUsers(data.users || [])
    setTests(data.tests || [])
    setUsersLoaded(true)
  }

  if (!usersLoaded && (tab === 'users' || tab === 'quiz')) loadUsers()

  const filteredUsers = users.filter(u => {
    const matchSearch = search === '' ||
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.whatsapp_number.includes(search)
    const matchFilter = filter === 'all' || (filter === 'premium' ? u.is_premium : !u.is_premium)
    return matchSearch && matchFilter
  })

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  const selectAll = () => setSelected(new Set(filteredUsers.map(u => u.id)))
  const clearSelection = () => setSelected(new Set())

  const bulkApprove = async () => {
    if (selected.size === 0) return
    setActionLoading(true)
    const res = await fetch('/api/admin/users/approve', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: Array.from(selected) }),
    })
    const d = await res.json()
    setActionMsg(d.message || 'Done')
    await loadUsers()
    clearSelection()
    setActionLoading(false)
    setTimeout(() => setActionMsg(''), 3000)
  }

  const grantRevoke = async (revoke = false) => {
    if (!grantEmail.trim()) return
    setGrantLoading(true)
    const res = await fetch('/api/admin/users/grant', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: grantEmail.trim(), revoke }),
    })
    const d = await res.json()
    setActionMsg(d.message || (revoke ? 'Access revoked' : 'Access granted'))
    await loadUsers()
    setGrantEmail('')
    setGrantLoading(false)
    setTimeout(() => setActionMsg(''), 3000)
  }

  const saveConfig = async () => {
    setConfigSaving(true)
    await fetch('/api/admin/config', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config }),
    })
    setConfigSaving(false)
    setActionMsg('Config saved!')
    setTimeout(() => setActionMsg(''), 3000)
  }

  const uploadQuiz = async () => {
    if (!uploadFile || !uploadTestId) return
    setUploading(true)
    setUploadMsg('')
    const fd = new FormData()
    fd.append('file', uploadFile)
    fd.append('testId', uploadTestId)
    const res = await fetch('/api/admin/quiz/upload', { method: 'POST', body: fd })
    const d = await res.json()
    setUploadMsg(d.message || (res.ok ? 'Upload successful!' : 'Upload failed'))
    setUploading(false)
    setUploadFile(null)
  }

  const TABS = [
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
    { id: 'config', label: 'Site Config', icon: <Settings className="w-4 h-4" /> },
    { id: 'quiz', label: 'Quiz Upload', icon: <Upload className="w-4 h-4" /> },
  ] as const

  return (
    <div className="min-h-screen" style={{ background: 'var(--navy-dark)' }}>
      {/* Header */}
      <header className="border-b px-4 py-4 flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'var(--navy)' }}>
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5" style={{ color: 'var(--cyan)' }} />
          <span className="font-extrabold text-white text-lg">Admin Panel</span>
        </div>
        <form action="/api/admin/logout" method="POST">
          <button type="submit" className="btn-navy text-sm px-4" style={{ minHeight: 'auto', padding: '0.5rem 1rem' }}>
            <LogOut className="w-4 h-4" />Logout
          </button>
        </form>
      </header>

      {/* Tabs */}
      <div className="border-b overflow-x-auto" style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'var(--navy)' }}>
        <div className="flex min-w-max">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-5 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap"
              style={{
                borderColor: tab === t.id ? 'var(--cyan)' : 'transparent',
                color: tab === t.id ? 'var(--cyan)' : '#9ca3af',
              }}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {actionMsg && (
          <div className="mb-4 p-3 rounded-xl text-sm font-medium text-center"
            style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>
            {actionMsg}
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {tab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Overview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Sign-ups', value: stats.total },
                { label: 'Premium Users', value: stats.premium },
                { label: 'Pending', value: stats.total - stats.premium },
                { label: 'Revenue (est.)', value: `PKR ${stats.premium * 300}` },
                { label: 'Conversion Rate', value: `${stats.total > 0 ? ((stats.premium / stats.total) * 100).toFixed(0) : 0}%` },
              ].map(s => (
                <div key={s.label} className="card text-center">
                  <p className="text-2xl font-extrabold text-white">{s.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {tab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <h2 className="text-xl font-bold text-white">User CRM</h2>
              <div className="flex gap-2">
                {selected.size > 0 && (
                  <button onClick={bulkApprove} disabled={actionLoading} className="btn-primary text-sm px-4" style={{ minHeight: '36px', padding: '0.5rem 1rem' }}>
                    {actionLoading ? <div className="spinner w-4 h-4" /> : <Check className="w-4 h-4" />}
                    Approve {selected.size} Selected
                  </button>
                )}
                <button onClick={loadUsers} className="btn-navy text-sm p-2" style={{ minHeight: 'auto' }}>
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Grant/Revoke */}
            <div className="card">
              <p className="text-sm font-semibold text-gray-300 mb-3">Quick Access Control</p>
              <div className="flex gap-2">
                <input value={grantEmail} onChange={e => setGrantEmail(e.target.value)}
                  className="input-field flex-1 text-sm" style={{ minHeight: '40px' }} placeholder="student@email.com" />
                <button onClick={() => grantRevoke(false)} disabled={grantLoading} className="btn-primary text-sm px-4" style={{ minHeight: '40px', padding: '0 1rem' }}>Grant</button>
                <button onClick={() => grantRevoke(true)} disabled={grantLoading}
                  className="text-sm px-4 rounded-xl font-semibold transition-all"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)', minHeight: '40px', padding: '0 1rem' }}>
                  Revoke
                </button>
              </div>
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  className="input-field pl-10 text-sm" style={{ minHeight: '40px' }} placeholder="Search by name, email, or WhatsApp..." />
              </div>
              <div className="flex gap-2">
                {(['all', 'premium', 'pending'] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className="px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-colors"
                    style={{
                      background: filter === f ? 'rgba(0,180,216,0.15)' : 'rgba(255,255,255,0.04)',
                      color: filter === f ? 'var(--cyan)' : '#9ca3af',
                      border: `1px solid ${filter === f ? 'rgba(0,180,216,0.3)' : 'rgba(255,255,255,0.07)'}`,
                    }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Select All */}
            {filteredUsers.length > 0 && (
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <button onClick={selected.size === filteredUsers.length ? clearSelection : selectAll} className="flex items-center gap-1.5 hover:text-white transition-colors">
                  {selected.size === filteredUsers.length ? <CheckSquare className="w-4 h-4" style={{ color: 'var(--cyan)' }} /> : <Square className="w-4 h-4" />}
                  Select all ({filteredUsers.length})
                </button>
              </div>
            )}

            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: 'rgba(0,180,216,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase w-8"></th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase hidden sm:table-cell">WhatsApp</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase hidden md:table-cell">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase hidden lg:table-cell">University</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase hidden md:table-cell">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">No users found.</td></tr>
                    ) : filteredUsers.map(u => (
                      <tr key={u.id} onClick={() => toggleSelect(u.id)} className="cursor-pointer hover:bg-white/[0.02] transition-colors"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: selected.has(u.id) ? 'rgba(0,180,216,0.05)' : undefined }}>
                        <td className="px-4 py-3" onClick={e => { e.stopPropagation(); toggleSelect(u.id) }}>
                          {selected.has(u.id)
                            ? <CheckSquare className="w-4 h-4" style={{ color: 'var(--cyan)' }} />
                            : <Square className="w-4 h-4 text-gray-600" />
                          }
                        </td>
                        <td className="px-4 py-3 font-medium text-white">{u.full_name}</td>
                        <td className="px-4 py-3 text-gray-300 hidden sm:table-cell">{u.whatsapp_number}</td>
                        <td className="px-4 py-3 text-gray-300 hidden md:table-cell">{u.email}</td>
                        <td className="px-4 py-3 text-gray-300 hidden lg:table-cell text-xs">{u.university}</td>
                        <td className="px-4 py-3">
                          <span className={`badge ${u.is_premium ? 'badge-success' : 'badge-warning'}`}>
                            {u.is_premium ? 'Premium' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">{formatDate(u.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── CONFIG ── */}
        {tab === 'config' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Website Content Editor</h2>
            <div className="card space-y-4" style={{ padding: '1.5rem' }}>
              {[
                { key: 'headline', label: 'Main Headline', type: 'text' },
                { key: 'subtext', label: 'Sub-text / Description', type: 'textarea' },
                { key: 'price', label: 'Pricing Amount', type: 'text' },
                { key: 'whatsapp_number', label: 'WhatsApp Number (with country code, no +)', type: 'text' },
                { key: 'mcqs_count', label: 'MCQs Count Label', type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">{f.label}</label>
                  {f.type === 'textarea' ? (
                    <textarea value={config[f.key] || ''} onChange={e => setConfig(c => ({ ...c, [f.key]: e.target.value }))}
                      className="input-field resize-none" rows={3} style={{ height: 'auto' }} />
                  ) : (
                    <input value={config[f.key] || ''} onChange={e => setConfig(c => ({ ...c, [f.key]: e.target.value }))}
                      className="input-field" type="text" />
                  )}
                </div>
              ))}
              <button onClick={saveConfig} disabled={configSaving} className="btn-primary">
                {configSaving ? <><div className="spinner w-4 h-4" />Saving...</> : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* ── QUIZ UPLOAD ── */}
        {tab === 'quiz' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Bulk Quiz Builder</h2>

            {/* Template Download */}
            <div className="card" style={{ background: 'rgba(0,180,216,0.05)', borderColor: 'rgba(0,180,216,0.2)' }}>
              <p className="text-sm font-semibold text-white mb-2">📋 Sample Excel Template</p>
              <p className="text-xs text-gray-400 mb-3">Your Excel/CSV file must have these exact column headers:</p>
              <div className="overflow-x-auto">
                <table className="text-xs border-collapse">
                  <thead>
                    <tr>
                      {['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer', 'Subject'].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-semibold whitespace-nowrap"
                          style={{ background: 'rgba(0,180,216,0.15)', color: 'var(--cyan)', border: '1px solid rgba(0,180,216,0.2)' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                    <tr>
                      {['If 2x+3=7, find x', '1', '2', '3', '4', 'B', 'Advanced Math'].map((v, i) => (
                        <td key={i} className="px-3 py-2 text-gray-400 whitespace-nowrap"
                          style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                          {v}
                        </td>
                      ))}
                    </tr>
                  </thead>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Subjects: <code className="text-cyan" style={{ color: 'var(--cyan)' }}>Advanced Math, Basic Math, Analytical Reasoning, English</code>
                <br />Correct Answer: <code className="text-cyan" style={{ color: 'var(--cyan)' }}>A, B, C, or D</code>
              </p>
              <a href="/sample-quiz-template.csv" download
                className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium"
                style={{ color: 'var(--cyan)' }}>
                ⬇ Download Sample Template
              </a>
            </div>

            {/* Upload Form */}
            <div className="card space-y-4" style={{ padding: '1.5rem' }}>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Select Mock Test</label>
                <select value={uploadTestId} onChange={e => setUploadTestId(e.target.value)}
                  className="input-field" style={{ background: 'rgba(10,22,40,0.8)' }}>
                  <option value="">-- Choose a test --</option>
                  {tests.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Upload File (.xlsx or .csv)</label>
                <input type="file" accept=".xlsx,.csv" onChange={e => setUploadFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold cursor-pointer"
                  style={{ background: 'rgba(10,22,40,0.8)', border: '1.5px solid rgba(0,180,216,0.2)', borderRadius: '10px', padding: '0.5rem' }}
                />
                {uploadFile && <p className="text-xs text-gray-400 mt-1">Selected: {uploadFile.name}</p>}
              </div>

              {uploadMsg && (
                <div className="rounded-lg p-3 text-sm"
                  style={{ background: uploadMsg.includes('success') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: uploadMsg.includes('success') ? '#10b981' : '#ef4444', border: '1px solid' }}>
                  {uploadMsg}
                </div>
              )}

              <button onClick={uploadQuiz} disabled={uploading || !uploadFile || !uploadTestId} className="btn-primary">
                {uploading ? <><div className="spinner w-4 h-4" />Uploading & Parsing...</> : <><Upload className="w-4 h-4" />Upload Questions</>}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
