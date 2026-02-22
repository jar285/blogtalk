# BlogTalk Architecture & Onboarding Guide

Welcome to the **BlogTalk** codebase! This document serves as a high-level overview to help you understand how the project is structured, the rationale behind key technical decisions, and where to find the moving parts.

## 🎯 Architecture Philosophy
BlogTalk is a **radically fast, static markdown blog** built for GitHub Pages. It avoids traditional databases (like Postgres) or headless CMS platforms (like Sanity) in favor of a flat-file Markdown approach. 
The entire site is pre-rendered at build-time using Next.js Static Export.

## 🛠️ Tech Stack
*   **Framework:** Next.js 15 (App Router)
*   **Mode:** Fully Static Export (`output: 'export'` in `next.config.ts`)
*   **Styling:** Pure CSS Variables & Modules (Fluid Typography, 8px Baseline Grid)
*   **Animations:** Framer Motion (Page Transitions, Scroll Parallax, Bento Grid Staggers)
*   **Content:** Markdown (`gray-matter`, `react-markdown`, `remark-gfm`, `rehype-highlight`)
*   **Hosting:** GitHub Pages (via GitHub Actions)

---

## 📂 Directory Structure

```text
blogtalk/
├── content/               # The "Database"
│   ├── home.md            # Metadata controlling the homepage hero
│   └── posts/             # Markdown files containing individual blog articles
├── public/                # Static assets (images, favicons)
└── src/
    ├── app/               # Next.js App Router definitions
    │   ├── globals.css    # Core design system (CSS variables, themes, utilities)
    │   ├── layout.tsx     # Global layout (Navbar, Footer, Command Palette, Blob)
    │   ├── page.tsx       # Homepage (Bento Grid layout)
    │   ├── projects/      # The Projects Bento Grid page
    │   └── blog/          # Blog listing and dynamic post routes ([slug])
    ├── components/        # Reusable Client and Server UI components
    └── lib/               # Utility functions (e.g., Markdown parsing)
```

---

## 🧠 Key Systems & Data Flow

### 1. The Markdown Data Layer (`src/lib/markdown.ts`)
Since we don't have a database, `markdown.ts` acts as our ORM. It reads `.md` files directly from the filesystem using Node's `fs` and parses their YAML frontmatter with `gray-matter`.
*   `getAllPosts()`: Scans `content/posts/`, parses metadata, and sorts by date.
*   `getPostBySlug(slug)`: Fetches a specific post by filename.

### 2. Static Routing (`src/app/blog/[slug]/page.tsx`)
Because we deploy to GitHub Pages (which requires a static HTML file for every route), we use `generateStaticParams()`. At build time, Next.js calls this function to get a list of all markdown filenames, then generates a dedicated HTML file for each post.

### 3. The Design System (`src/app/globals.css`)
We don't use Tailwind. The styling is driven by native CSS variables for maximum control and performance:
*   **Fluid Typography:** We use `clamp()` for `var(--fs-*)` so text scales smoothly based on viewport width.
*   **Dark/Light Theme:** Handled via a `[data-theme="light"]` attribute toggled on the `<html>` element.
*   **Spacing:** Enforced via an 8px baseline grid `var(--space-1)` to `var(--space-7)`.

---

## 🍱 Notable UI Components

If you're looking to modify the interactive elements, start here:

*   **`BentoHomepage.tsx` & `ProjectsGrid.tsx`:** Both use CSS Grid and `framer-motion` variant staggers to cascade cards onto the screen.
*   **`ParallaxHero.tsx`:** Uses `useScroll` and `useTransform` to make individual lines of text scroll at different speeds.
*   **`CommandMenu.tsx`:** A global `⌘K` palette intercepting keyboard events to provide instant site-wide search.
*   **`MouseBlob.tsx`:** A subtle, blurred radial gradient that follows the user's cursor utilizing spring physics.
*   **`CodeBlock.tsx`:** Intercepts standard markdown code fences to render an interactive "Mac Window" with a copy-to-clipboard button and language badge.
*   **`TableOfContents.tsx`:** Parses `<h2>` and `<h3>` tags on the fly and uses an `IntersectionObserver` to highlight the user's current reading position.

## 🚀 How to Run Locally

1. Clone the repo.
2. Run `npm install`.
3. Run `npm run dev` to start the local server.
4. To test the static export locally: run `npm run build` followed by `npx serve out`.
