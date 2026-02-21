import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

import MouseBlob from "@/components/MouseBlob";

export const metadata: Metadata = {
  title: "Jesus Blog",
  description: "A personal space for thoughts, code, and design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MouseBlob />
        <div className="container">
          <nav>
            <Link href="/" className="logo">Jesus Blog</Link>
            <div className="nav-links">
              <Link href="/">Home</Link>
              <Link href="/blog">Articles</Link>
            </div>
          </nav>

          <main>
            {children}
          </main>

          <footer>
            <p>&copy; {new Date().getFullYear()} Jesus Rosario. Built with Next.js & Markdown.</p>
          </footer>
        </div>
      </body>
    </html>
  )
}
