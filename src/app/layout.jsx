import './globals.css'

export const metadata = {
  title: 'FAST Entry Test Prep — 3 Premium Mock Tests | PKR 300',
  description: "Pakistan's most accurate FAST University mock tests. 300+ premium MCQs, exact negative marking, unlimited retakes.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ background: 'var(--navy-dark)' }}>
        {children}
      </body>
    </html>
  )
}
