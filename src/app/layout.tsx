import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

import MouseBlob from "@/components/MouseBlob";
import CommandMenu from "@/components/CommandMenu";
import ProgressBar from "@/components/ProgressBar";
import NavBar from "@/components/NavBar";

import { getAllPosts } from '@/lib/markdown';

export const metadata: Metadata = {
  title: "Jesus's Blog",
  description: "A personal space for thoughts, code, and design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch posts at build time to power the global search
  const posts = getAllPosts();

  return (
    <html lang="en" className={inter.variable}>
      <body>
        <ProgressBar />
        <MouseBlob />
        <CommandMenu posts={posts} />
        <div className="container">
          <NavBar />

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
