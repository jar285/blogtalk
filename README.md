# BlogTalk

BlogTalk is a Next.js App Router blog platform with markdown content, authenticated user interactions, analytics collection, and MCP tools for chat-driven reporting.

## Stack
- Framework: Next.js 16 (App Router)
- Database: Supabase Postgres via Prisma
- Auth: NextAuth/Auth.js (Google provider)
- Content: Local markdown files parsed with `gray-matter`
- Analytics: Client beacon ingestion into `AnalyticsEvent` + MCP query tools
- Deployment: Vercel

## Local Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables (database/auth) in `.env`.
3. Run development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000`.

## Analytics And Views
- Ingestion endpoint: `POST /api/drain/analytics`
- Canonical blog view source: `AnalyticsEvent`
- Compatibility endpoint for post counters: `GET/POST /api/views?slug=...`
  - Returns canonical counts from `AnalyticsEvent`
  - Keeps legacy `PostView` writes during reconciliation window

## MCP Integration
BlogTalk exposes MCP tools at `src/app/api/mcp/[transport]/route.ts`.

- Preferred transport for Studio: Streamable HTTP at `/api/mcp/mcp`
- SSE endpoint exists at `/api/mcp/sse` but should not be your default integration path unless Redis/KV-backed SSE reliability is explicitly configured.

Quick probe:

```bash
curl -si -X POST "https://<your-host>/api/mcp/mcp" \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"probe","version":"0.0.1"}}}'
```

## Deploying
Deploys are triggered by pushing commits to `main` on GitHub (Vercel production branch).

```bash
git add .
git commit -m "<message>"
git push origin main
```

## License
MIT
