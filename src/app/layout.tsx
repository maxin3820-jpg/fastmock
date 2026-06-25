import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FAST Entry Test Prep — 3 Premium Mock Tests | PKR 300',
  description: 'Pakistan\'s most accurate FAST University mock tests. 300+ premium MCQs, exact negative marking, unlimited retakes. Crack FAST entry test for PKR 300.',
  keywords: 'FAST university entry test, FAST mock test, FAST test preparation, Pakistan university test',
  openGraph: {
    title: 'FAST Entry Test Prep — Crack It For PKR 300',
    description: '3 full-length premium FAST mock tests with exact negative marking pattern.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ background: 'var(--navy-dark)' }}>
        {children}
      </body>
    </html>
  )
}
