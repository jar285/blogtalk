# QA: Analytics Source of Truth

**QA Target**: specs/002-analytics-source-of-truth/spec.md, specs/002-analytics-source-of-truth/sprints/sprint-0.md
**QA Direction**: Both (Spec vs Code, Sprint vs Spec)
**Date**: 2026-03-25
**Verdict**: Pass with Notes

## Traceability Matrix

| Spec Item | Sprint Task | Code Evidence | Verdict |
|-----------|-------------|---------------|---------|
| AnalyticsEvent schema (14 fields) | Read prisma/schema.prisma | `prisma/schema.prisma` lines defining AnalyticsEvent model with id, eventType, eventName, path, sessionId, deviceId, country, city, device, browser, referrer, occurredAt, raw + 3 indexes | Pass |
| Collection path (beacon → drain → Prisma) | Read AnalyticsCollector.tsx and drain route | `AnalyticsCollector` sends beacon to `/api/drain/analytics`; drain route validates with Zod and calls `prisma.analyticsEvent.createMany()` | Pass |
| Data freshness: near real-time | Read AnalyticsCollector.tsx | Fires on every `pathname` change via `useEffect`, no batching, `sendBeacon` is immediate | Pass |
| Rate limit: 120/min on drain | Read rateLimiter.ts and drain route | `checkRateLimit('analytics:${ip}', 120)` with 60s default window | Pass |
| Rate limit: 240/min on views | Read views route | `checkRateLimit('views:${ip}', 240)` | Pass |
| MCP transport: HTTP preferred | Read route.ts and README | `basePath: '/api/mcp'`, README says "Preferred transport for Studio: Streamable HTTP at `/api/mcp/mcp`" | Pass |
| Tool 1: getPageviews | Read route.ts tool registration | `server.registerTool('getPageviews', ...)` with `from`/`to` params, returns `{ pageviews: count, from, to }` via `JSON.stringify` | Pass |
| Tool 2: getTopPages | Read route.ts tool registration | `server.registerTool('getTopPages', ...)` with `from`/`to`/`limit`, returns `{ pages: [{ path, pageviews }] }` | Pass |
| Tool 3: getUniqueSessions | Read route.ts tool registration | `server.registerTool('getUniqueSessions', ...)` with `from`/`to`, returns `{ unique_sessions, from, to }` | Pass |
| Tool 4: getTrafficSources | Read route.ts tool registration | `server.registerTool('getTrafficSources', ...)` with `from`/`to`/`limit`, returns `{ sources: [{ referrer, pageviews }] }` | Pass |
| Tool 5: getDeviceBreakdown | Read route.ts tool registration | `server.registerTool('getDeviceBreakdown', ...)` with `from`/`to`, returns `{ devices: { [device]: count }, from, to }` | Pass |
| Tool 6: getDailyTrend | Read route.ts tool registration | `server.registerTool('getDailyTrend', ...)` with `from`/`to`, returns `{ trend: [{ day, pageviews }] }` | Pass |
| Tool 7: getTopLikedPosts | Read route.ts tool registration | `server.registerTool('getTopLikedPosts', ...)` with `limit`, queries `Like` table, returns `{ posts: [{ slug, likes }] }` | Pass |
| All responses: structured JSON | Read all tool implementations | Every tool returns `{ content: [{ type: 'text', text: JSON.stringify({...}) }] }` | Pass |
| Strict-then-relaxed query behavior | Read normalizedAnalyticsFilter function | First query uses `strictEventTokens = true`, second query with `false` runs only if first returns zero | Pass |
| Path exclusions | Read normalizedAnalyticsFilter function | Excludes `/api/*`, `/_next/*`, `/admin*`, `/dashboard*`, empty paths | Pass |
| Date normalization | Read normalizeWindow and isDateOnlyInput | Date-only inputs expanded to full day; from/to swapped if inverted | Pass |
| PostView legacy status | Read views route | `POST` creates PostView AND returns AnalyticsEvent count; response includes `source: 'analyticsEvent'` | Pass |
| @vercel/analytics auxiliary | Read package.json | `"@vercel/analytics": "^1.5.0"` in dependencies; no MCP tool queries it | Pass |
| Admin debug internal | Read analytics-debug route | Admin-only (`session.user.role !== 'admin'`), returns diagnostic data | Pass |
| No code changes | Sprint scope | No files under `src/` modified | Pass |

## Matches

What the spec accurately describes and what the code confirms:

- The `AnalyticsEvent` model has exactly the 14 fields documented with the correct types and indexes
- The collection path is exactly: `AnalyticsCollector` → `sendBeacon` → `/api/drain/analytics` → Zod validation → `prisma.analyticsEvent.createMany()`
- All 7 MCP tools are registered with exactly the documented names in `route.ts`
- Parameter schemas match: `from`/`to` as `z.string()`, `limit` as `z.number().int().min(1).max(20).default(10)` where applicable
- Response shapes match: every tool uses `JSON.stringify` with the documented object structure
- The `normalizedAnalyticsFilter` function implements strict-then-relaxed matching exactly as described
- The `normalizeWindow` function implements date-only expansion and from/to swap exactly as described
- Rate limits confirmed: 120/min on drain, 240/min on views, no explicit limit on MCP
- MCP `maxDuration: 60` confirmed in handler options
- PostView reconciliation confirmed: `/api/views POST` writes to both tables, response includes `source: 'analyticsEvent'` and `reconciliation.delta`
- `@vercel/analytics` is in dependencies but no MCP tool or analytics query references it

## Missing

**Missing from spec** (exists in code but not fully captured):

- The `analyticsEventSchema` in `validations.ts` applies a `.transform()` that strips query strings and hash fragments from paths. This normalization detail is not explicitly documented in the spec. It is an implementation detail but could affect how Studio interprets path values from MCP tools (tools query the already-normalized data).
- The `countBlogPageviews()` and `countBlogPageviewsBySlug()` functions in `analyticsQueries.ts` use regex matching (`path ~ $1`) for blog-specific path patterns. These functions are used by `/api/views` but not by MCP tools. They are not part of the consumer contract but are a BlogTalk internal detail.
- The `AnalyticsCollector` skips no routes — it fires on every `pathname` change including non-blog pages. This means `AnalyticsEvent` contains pageviews for all site pages, not just blog posts. The MCP tools filter by path exclusions but include non-blog pages in their results.

**Missing from code** (described in spec but does not exist):

- None. The spec describes only what exists.

## Extra

Things that exist but are not addressed in the spec:

- The `raw` field on `AnalyticsEvent` stores the complete original payload as JSON. This could be useful for future analytics capabilities but is not exposed by any MCP tool today.
- The `country` and `city` fields on `AnalyticsEvent` are always null in the current collection path (the `AnalyticsCollector` does not set them). No MCP tool queries these fields. They appear to be schema provisions for future geo-analytics.

## Ambiguous

Items that need clarification:

1. **REST vs MCP for dashboard queries**: The spec correctly raises this as open question #1. MCP adds protocol overhead (initialize, tool discovery, JSON-RPC framing) that is unnecessary for predictable dashboard queries. A REST endpoint returning the same JSON would be simpler for Studio. This is an architectural decision for the owner.

2. **MCP tool response stability**: The spec flags this as open question #4 (versioning). Currently, if BlogTalk renames a field in a tool response, Studio breaks with no warning. There is no versioning mechanism.

3. **getTopLikedPosts consistency**: This tool has no date range, unlike the other 6. The spec flags this as open question #6. If Studio builds a time-bounded dashboard, this widget will always show all-time data regardless of the selected date range.

## Findings

| # | Category | Description | Severity | Status |
|---|----------|-------------|----------|--------|
| 1 | match | All 7 MCP tools verified with correct names, params, and response shapes | — | resolved |
| 2 | match | All responses confirmed as structured JSON, chartable without LLM | — | resolved |
| 3 | match | Canonical path unambiguous: AnalyticsEvent via drain route | — | resolved |
| 4 | match | PostView reconciliation status accurately described | — | resolved |
| 5 | match | Rate limits confirmed at documented values | — | resolved |
| 6 | match | @vercel/analytics confirmed as auxiliary, not queryable | — | resolved |
| 7 | missing (minor) | Path normalization (query/hash stripping) not documented in spec | low | open |
| 8 | missing (minor) | AnalyticsCollector fires on all pages, not just blog posts | low | open |
| 9 | extra | `raw` JSON field and geo fields (country, city) exist but are unused | low | deferred |
| 10 | ambiguous | REST vs MCP decision for dashboard use | high | open — owner decision |
| 11 | ambiguous | MCP response versioning absent | medium | open — owner decision |
| 12 | ambiguous | getTopLikedPosts has no date range | low | open — owner decision |

## Whether Response Shapes Are Sufficiently Defined for Charts

**Yes.** All 7 tools return structured JSON that maps directly to chart types:

| Tool | Chart Type | Data Shape | Sufficient? |
|------|-----------|------------|-------------|
| `getPageviews` | Summary card | Single number | Yes |
| `getTopPages` | Bar chart / table | Array of `{ path, pageviews }` | Yes |
| `getUniqueSessions` | Summary card | Single number | Yes |
| `getTrafficSources` | Pie chart / bar chart | Array of `{ referrer, pageviews }` | Yes |
| `getDeviceBreakdown` | Pie chart | Object of `{ device: count }` | Yes |
| `getDailyTrend` | Line chart | Array of `{ day, pageviews }` | Yes (Studio fills zero-days) |
| `getTopLikedPosts` | Table | Array of `{ slug, likes }` | Yes (no date filter) |

## Whether the Source-of-Truth Path Is Clear Enough to Unblock Studio

**Yes, with one caveat.** The canonical path (`AnalyticsEvent` → MCP tools → structured JSON) is unambiguous and code-verified. Studio can build dashboard widgets for all 7 tools using MCP as the query interface.

The caveat: if Studio opts for direct REST calls instead of MCP, BlogTalk must first create those REST endpoints. The MCP path works today but adds protocol overhead. The owner should decide whether MCP overhead is acceptable for dashboard use or whether REST endpoints should be added first (open question #1).

## Carry-Forward Items

The following validated findings should be carried to Studio's analytics-worker spec when unblocking Sprint 1:

- **All 7 MCP tools are stable and return structured JSON.** Studio can design dashboard widgets for all of them.
- **Response shapes are documented and code-verified.** Studio should create TypeScript types and Zod schemas matching these shapes.
- **HTTP transport at `/api/mcp/mcp` is preferred.** Studio should use this, not SSE.
- **`getDailyTrend` omits zero-pageview days.** Studio must fill gaps in time series client-side.
- **`getTopLikedPosts` has no date range.** Studio should display this as "all-time" regardless of dashboard date filter.
- **`getUniqueSessions` is approximate.** Studio should label it "approximate unique visitors."
- **Open question #1 (REST vs MCP) remains open.** Studio's Sprint 1 should be designed to work with MCP today but be adaptable to REST if BlogTalk adds it later.
