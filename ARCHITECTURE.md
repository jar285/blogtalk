# BlogTalk Architecture & Onboarding Guide

Welcome to the **BlogTalk** codebase! This document serves as a high-level overview to help you understand how the project is structured, the rationale behind key technical decisions, and where to find the moving parts.

## Architecture Philosophy
BlogTalk combines markdown-first publishing with dynamic product features (auth, engagement, analytics, admin dashboards, and MCP tools). It uses Next.js App Router with API routes backed by Supabase Postgres via Prisma.

## Tech Stack
- Framework: Next.js 16 (App Router)
- Runtime: Server routes + client components
- Database: Supabase Postgres + Prisma
- Auth: NextAuth/Auth.js
- Styling: CSS variables/modules + Framer Motion
- Content: Markdown (`gray-matter`, `react-markdown`, `remark-gfm`, `rehype-highlight`)
- Hosting: Vercel

---

## Directory Structure

```text
blogtalk/
├── content/               # The "Database"
│   ├── home.md            # Metadata controlling the homepage hero
│   └── posts/             # Markdown files containing individual blog articles
├── prisma/                # Prisma schema and migrations
├── public/                # Static assets (images, favicons)
└── src/
    ├── app/               # Next.js App Router definitions
    │   ├── globals.css    # Core design system (CSS variables, themes, utilities)
    │   ├── layout.tsx     # Global layout (Navbar, Footer, Command Palette, Blob)
    │   ├── api/            # Route handlers (auth, analytics, mcp, admin)
    │   ├── page.tsx        # Homepage (Bento Grid layout)
    │   ├── projects/      # The Projects Bento Grid page
    │   └── blog/          # Blog listing and dynamic post routes ([slug])
    ├── components/        # Reusable Client and Server UI components
    └── lib/               # Utility functions (e.g., Markdown parsing)
```

---

## Key Systems And Data Flow

### 1. The Markdown Data Layer (`src/lib/markdown.ts`)
Markdown content is still file-based. `markdown.ts` reads `.md` files from `content/posts` and parses frontmatter with `gray-matter`.
*   `getAllPosts()`: Scans `content/posts/`, parses metadata, and sorts by date.
*   `getPostBySlug(slug)`: Fetches a specific post by filename.

### 2. Blog Views And Analytics
BlogTalk currently has two view paths with one canonical source:

- Canonical: `AnalyticsEvent` (ingested via `POST /api/drain/analytics` from `AnalyticsCollector`)
- Legacy compatibility: `PostView` (written by `POST /api/views` during reconciliation)

`/api/views` now returns counts from `AnalyticsEvent` while still writing legacy rows for drift tracking.

### 3. MCP Analytics Layer (`src/app/api/mcp/[transport]/route.ts`)
MCP tools query analytics and engagement data for chat interfaces.

- Preferred endpoint: `/api/mcp/mcp` (streamable HTTP)
- Alternate endpoint: `/api/mcp/sse` (not the default integration path)

If Studio/chat integrations fail with SSE timeouts, switch to streamable HTTP first.

### 4. The Design System (`src/app/globals.css`)
We don't use Tailwind. The styling is driven by native CSS variables for maximum control and performance:
*   **Fluid Typography:** We use `clamp()` for `var(--fs-*)` so text scales smoothly based on viewport width.
*   **Dark/Light Theme:** Handled via a `[data-theme="light"]` attribute toggled on the `<html>` element.
*   **Spacing:** Enforced via an 8px baseline grid `var(--space-1)` to `var(--space-7)`.

---

## Notable UI Components

If you're looking to modify the interactive elements, start here:

*   **`BentoHomepage.tsx` & `ProjectsGrid.tsx`:** Both use CSS Grid and `framer-motion` variant staggers to cascade cards onto the screen.
*   **`ParallaxHero.tsx`:** Uses `useScroll` and `useTransform` to make individual lines of text scroll at different speeds.
*   **`CommandMenu.tsx`:** A global `⌘K` palette intercepting keyboard events to provide instant site-wide search.
*   **`MouseBlob.tsx`:** A subtle, blurred radial gradient that follows the user's cursor utilizing spring physics.
*   **`CodeBlock.tsx`:** Intercepts standard markdown code fences to render an interactive "Mac Window" with a copy-to-clipboard button and language badge.
*   **`TableOfContents.tsx`:** Parses `<h2>` and `<h3>` tags on the fly and uses an `IntersectionObserver` to highlight the user's current reading position.

## How to Run Locally

1. Clone the repo.
2. Run `npm install`.
3. Run `npm run dev` to start the local server.
4. Ensure required env vars are configured for database/auth if testing protected routes.
