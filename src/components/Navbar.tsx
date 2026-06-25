'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, GraduationCap } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <nav className="sticky top-0 z-50 border-b border-white/5" style={{ background: 'rgba(6,14,26,0.95)', backdropFilter: 'blur(12px)' }}>
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <GraduationCap className="w-6 h-6 text-cyan" style={{ color: 'var(--cyan)' }} />
          <span className="gradient-text font-extrabold">FAST PrepPro</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a>
          <a href="#leaderboard" className="text-gray-400 hover:text-white transition-colors">Leaderboard</a>
          <Link href="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link>
          <Link href="/register" className="btn-primary text-sm px-4 py-2" style={{ minHeight: 'auto' }}>Get Access →</Link>
        </div>
        <button className="md:hidden p-2 rounded-lg hover:bg-white/5" onClick={() => setOpen(!open)} aria-label="menu">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-white/5 px-4 py-4 flex flex-col gap-4" style={{ background: 'var(--navy-dark)' }}>
          <a href="#features" className="text-gray-300" onClick={() => setOpen(false)}>Features</a>
          <a href="#leaderboard" className="text-gray-300" onClick={() => setOpen(false)}>Leaderboard</a>
          <Link href="/login" className="text-gray-300" onClick={() => setOpen(false)}>Login</Link>
          <Link href="/register" className="btn-primary text-center" onClick={() => setOpen(false)}>Get Access — PKR 300</Link>
        </div>
      )}
    </nav>
  )
}
