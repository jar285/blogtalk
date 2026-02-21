import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'BlogTalk - Personal Markdown Blog',
  description: 'A personal blog powered by Next.js and Markdown',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <nav>
            <div className="logo">
              <Link href="/">BlogTalk</Link>
            </div>
            <div className="nav-links">
              <Link href="/">Home</Link>
              <Link href="/blog">Articles</Link>
            </div>
          </nav>

          <main>
            {children}
          </main>

          <footer>
            <p>&copy; {new Date().getFullYear()} Franklind. Built with Next.js & Markdown.</p>
          </footer>
        </div>
      </body>
    </html>
  )
}
