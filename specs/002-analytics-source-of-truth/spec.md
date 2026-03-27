# Spec: Analytics Source of Truth

**Status**: Active
**Author**: Project Owner
**Date**: 2026-03-25

## Summary

This spec defines the canonical analytics contract that BlogTalk exposes and that BlogTalk Studio consumes. It documents what BlogTalk treats as the analytics source of truth, what analytics data is canonical today, what structured interfaces exist, what data shapes consumers may depend on, and what operational constraints apply. It serves as the authoritative reference for cross-repo analytics integration.

## Purpose

BlogTalk Studio needs to build a structured analytics dashboard that displays charts, summaries, and tables using data from BlogTalk. To do that, Studio needs a stable, documented contract: which tools exist, what they accept, what they return, how fresh the data is, and what Studio may and may not assume.

This spec provides that contract. It is grounded in a code audit of BlogTalk's analytics implementation as of 2026-03-25.

## Variance

What this spec changes or introduces:

- A documented, authoritative list of analytics capabilities that external consumers (Studio) may depend on
- Explicit response shapes for all 7 MCP tools, verified against code
- A documented canonical analytics path with clear boundaries between canonical, legacy, and auxiliary systems
- A decision framework for whether REST endpoints should supplement MCP for dashboard use
- A documented end-state intent for the PostView reconciliation period

## Invariance

What must remain true. What must never happen:

1. **Studio must not infer undocumented metrics.** If a metric is not exposed by a BlogTalk MCP tool or documented API, Studio must not fabricate it, estimate it, or derive it from indirect signals.

2. **BlogTalk must expose structured data for any metric intended for charts.** MCP tool responses used by dashboards must contain typed, parseable JSON — not free-text summaries that require LLM interpretation to chart.

3. **One authoritative analytics path must be documented.** The canonical source for analytics data is the `AnalyticsEvent` table, populated via `POST /api/drain/analytics`. All reporting tools query this table. Any other path (legacy `PostView`, Vercel Analytics) is auxiliary or transitional.

4. **Legacy or reconciliation paths must have a documented end-state.** The `PostView` model is in a reconciliation period. This spec documents its current role and intended end-state so consumers do not build dependencies on it.

5. **MCP tool response shapes are a contract.** Changes to the JSON structure inside MCP tool responses are breaking changes for Studio. If a field is renamed, removed, or its type changes, Studio's dashboard will break. Tool response shapes must be treated as a versioned interface.

6. **Analytics data is read-only for consumers.** Studio and any other consumer may query analytics. They must never write, delete, or mutate analytics records in BlogTalk.

7. All workflow invariants from specs/000-workflow/spec.md apply.

## Non-Goals

- This spec does not implement new MCP tools or REST endpoints (that is for a future sprint).
- This spec does not change BlogTalk's analytics collection pipeline.
- This spec does not define Studio's dashboard UI or worker architecture (that is Studio's concern).
- This spec does not address non-analytics MCP capabilities (if any are added in the future).

## Boundaries

**In scope**:

- The `AnalyticsEvent` model and its role as canonical source
- The `POST /api/drain/analytics` ingestion route
- The `AnalyticsCollector` client-side component
- All 7 MCP tools: names, parameters, response shapes, query behavior
- The MCP transport configuration (HTTP vs SSE)
- The `/api/views` legacy compatibility route
- The `PostView` model and reconciliation status
- The `@vercel/analytics` dependency and its relationship to custom analytics
- The `GET /api/admin/analytics-debug` admin route
- Rate limiting and operational constraints
- Data freshness characteristics

**Out of scope**:

- Studio-side implementation (dashboard, worker, caching)
- BlogTalk UI components that display analytics (admin panel, view counters)
- Auth system details (covered in 001-current-state-audit)
- Non-analytics API routes (comments, likes, bookmarks, subscribe)

## Source of Truth

Authoritative files for this spec's domain:

- `src/app/api/mcp/[transport]/route.ts` — MCP server and all 7 tool definitions
- `src/app/api/drain/analytics/route.ts` — analytics event ingestion
- `src/components/AnalyticsCollector.tsx` — client-side pageview collection
- `src/lib/analyticsQueries.ts` — shared analytics query functions
- `src/lib/validations.ts` — `analyticsEventSchema` Zod schema
- `src/lib/rateLimiter.ts` — rate limiting implementation
- `src/app/api/views/route.ts` — legacy view compatibility route
- `src/app/api/admin/analytics-debug/route.ts` — admin analytics debug
- `prisma/schema.prisma` — `AnalyticsEvent` and `PostView` models

## Interfaces / Contracts Touched

This spec documents existing interfaces. It does not create new ones:

- MCP tool interface (7 tools via `mcp-handler` at `/api/mcp/mcp`)
- Analytics drain interface (`POST /api/drain/analytics`)
- Views compatibility interface (`GET/POST /api/views`)

---

## Canonical Analytics Architecture

### Source of Truth: `AnalyticsEvent`

The canonical source for all analytics data in BlogTalk is the `AnalyticsEvent` table in Supabase PostgreSQL, accessed via Prisma.

**Schema** (from `prisma/schema.prisma`):

| Field | Type | Description |
|-------|------|-------------|
| `id` | BigInt (autoincrement) | Primary key |
| `eventType` | String | `'pageview'` or `'event'` |
| `eventName` | String (nullable) | Null for pageviews |
| `path` | String | URL path (normalized, no query/hash) |
| `sessionId` | BigInt (nullable) | Tab-scoped session ID |
| `deviceId` | BigInt (nullable) | Device identifier |
| `country` | String (nullable) | Country code |
| `city` | String (nullable) | City name |
| `device` | String (nullable) | `'mobile'`, `'tablet'`, or `'desktop'` |
| `browser` | String (nullable) | User agent string |
| `referrer` | String (nullable) | Referring URL |
| `occurredAt` | DateTime | When the event happened (default: now) |
| `raw` | Json (nullable) | Full original payload |

**Indexes**: `occurredAt DESC`, `path`, `sessionId`.

### Collection Path

```
Browser (AnalyticsCollector)
  → navigator.sendBeacon('/api/drain/analytics', event)
  → Drain route validates with analyticsEventSchema (Zod)
  → prisma.analyticsEvent.createMany()
  → AnalyticsEvent table (Supabase Postgres)
```

The `AnalyticsCollector` component fires on every route change. It sends: `eventType` (always `'pageview'`), `path`, `timestamp`, `sessionId` (tab-scoped via sessionStorage), `device` (width-based: mobile/tablet/desktop), `browser` (user agent), `referrer`.

### Data Freshness

Events are written on each pageview via `sendBeacon`. There is no batching, no queue, and no delay beyond network latency. Data is near real-time. The `occurredAt` field uses the client-provided timestamp if valid, otherwise server-side `now()`.

### Rate Limits

- **Analytics drain**: 120 requests per minute per IP (in-memory rate limiter, 60-second window).
- **Views route**: 240 requests per minute per IP.
- **MCP endpoint**: No explicit rate limit on the MCP route itself. The `maxDuration` is 60 seconds per request.
- Rate limiter is in-memory (`src/lib/rateLimiter.ts`), not shared across serverless instances.

---

## MCP Analytics Interface

### Transport

BlogTalk exposes MCP tools via the `mcp-handler` package at:

- **Preferred**: `/api/mcp/mcp` (streamable HTTP)
- **Alternate**: `/api/mcp/sse` (Server-Sent Events)

The dynamic `[transport]` segment routes to the same handler. HTTP is the recommended transport for Studio integration.

### Tool Manifest

BlogTalk registers 7 MCP tools. All tools are defined in `src/app/api/mcp/[transport]/route.ts`. Studio discovers these dynamically via `mcpClient.tools()` at runtime, but the following manifest is the documented contract.

#### Tool 1: `getPageviews`

**Description**: Returns total pageview count for a date range.
**Use when**: Asked about traffic volume, visitor counts, or how busy the site was.

**Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `from` | string | yes | ISO 8601 start date (e.g., `2026-03-01`) |
| `to` | string | yes | ISO 8601 end date (e.g., `2026-03-12`) |

**Response shape** (inside `content[0].text`):

```json
{ "pageviews": 1234, "from": "2026-03-01", "to": "2026-03-12" }
```

**Query behavior**: Counts rows in `AnalyticsEvent` matching the date range. Uses strict event token matching first (eventType/eventName in `pageview`, `page_view`, `view`, `page-view`, `visit`). Falls back to relaxed matching (no event token filter) if strict returns zero. Excludes `/api/*`, `/_next/*`, `/admin*`, `/dashboard*` paths. Requires non-empty path.

#### Tool 2: `getTopPages`

**Description**: Returns the most visited pages ranked by pageview count.
**Use when**: Asked about popular posts, best-performing content, or top pages.

**Parameters**:

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `from` | string | yes | — | ISO 8601 start date |
| `to` | string | yes | — | ISO 8601 end date |
| `limit` | integer | no | 10 | Number of pages (1–20) |

**Response shape**:

```json
{ "pages": [{ "path": "/blog/my-post", "pageviews": 456 }, ...] }
```

#### Tool 3: `getUniqueSessions`

**Description**: Returns count of unique session IDs as a proxy for unique visitors.
**Use when**: Asked about unique visitors, distinct users, or how many people visited.

**Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `from` | string | yes | ISO 8601 start date |
| `to` | string | yes | ISO 8601 end date |

**Response shape**:

```json
{ "unique_sessions": 789, "from": "2026-03-01", "to": "2026-03-12" }
```

**Note**: Session IDs are tab-scoped random integers generated client-side. This is a rough proxy for unique visitors, not a precise count.

#### Tool 4: `getTrafficSources`

**Description**: Returns referrer domain breakdown.
**Use when**: Asked about where visitors come from, referral sources, or traffic origins.

**Parameters**:

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `from` | string | yes | — | ISO 8601 start date |
| `to` | string | yes | — | ISO 8601 end date |
| `limit` | integer | no | 10 | Number of sources (1–20) |

**Response shape**:

```json
{ "sources": [{ "referrer": "google.com", "pageviews": 200 }, { "referrer": "(direct)", "pageviews": 150 }, ...] }
```

**Note**: Null referrers are mapped to `"(direct)"`.

#### Tool 5: `getDeviceBreakdown`

**Description**: Returns counts split by device type.
**Use when**: Asked about device usage, mobile vs desktop, or audience device split.

**Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `from` | string | yes | ISO 8601 start date |
| `to` | string | yes | ISO 8601 end date |

**Response shape**:

```json
{ "devices": { "desktop": 500, "mobile": 300, "tablet": 50, "unknown": 10 }, "from": "2026-03-01", "to": "2026-03-12" }
```

**Note**: Null devices are mapped to `"unknown"`. Device type is determined client-side by viewport width (mobile < 768, tablet < 1024, desktop >= 1024).

#### Tool 6: `getDailyTrend`

**Description**: Returns pageview counts grouped by day for a date range.
**Use when**: Asked about trends over time, daily traffic, spikes, or growth patterns.

**Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `from` | string | yes | ISO 8601 start date |
| `to` | string | yes | ISO 8601 end date |

**Response shape**:

```json
{ "trend": [{ "day": "2026-03-01", "pageviews": 45 }, { "day": "2026-03-02", "pageviews": 62 }, ...] }
```

**Note**: Days with zero pageviews are not included in the array. Days are formatted as `YYYY-MM-DD`.

#### Tool 7: `getTopLikedPosts`

**Description**: Returns the most liked posts ranked by like count.
**Use when**: Asked about top engagement by likes or most-liked content.

**Parameters**:

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `limit` | integer | no | 10 | Number of posts (1–20) |

**Response shape**:

```json
{ "posts": [{ "slug": "my-post", "likes": 12 }, ...] }
```

**Note**: This tool queries the `Like` table, not `AnalyticsEvent`. It has no date range parameter. It returns all-time like counts.

### Common Query Behavior

All analytics-based tools (tools 1–6) share this behavior:

- **Date normalization**: Date-only inputs (`YYYY-MM-DD`) are expanded to full day range (start: `00:00:00.000 UTC`, end: `23:59:59.999 UTC`). If `from > to`, they are swapped.
- **Strict-then-relaxed matching**: Queries first filter for known pageview event tokens. If zero results, a second query runs without the event token filter. This handles ingestion format variations.
- **Path exclusions**: `/api/*`, `/_next/*`, `/admin*`, `/dashboard*` are always excluded.
- **Non-empty path required**: Events with empty or null paths are excluded.

---

## Auxiliary Analytics Paths

### Legacy: `PostView` Model and `/api/views`

The `PostView` model is a legacy per-view record (slug + createdAt). During the reconciliation period:

- `POST /api/views` creates a `PostView` record AND returns the canonical count from `AnalyticsEvent`.
- `GET /api/views?slug=...` returns both `AnalyticsEvent` count and `PostView` count with a delta.
- The response includes `source: 'analyticsEvent'` to signal which count is authoritative.

**End-state intent**: `PostView` writes should be deprecated once the reconciliation period confirms `AnalyticsEvent` is reliable and complete. After deprecation, `/api/views` would read from `AnalyticsEvent` only and stop writing to `PostView`. No timeline is set for this transition.

### Auxiliary: `@vercel/analytics`

`@vercel/analytics` is listed in `package.json` dependencies. It provides client-side analytics to Vercel's dashboard (separate from BlogTalk's custom pipeline). It is not queryable by Studio or by BlogTalk's MCP tools. It serves as a cross-reference for the blog owner, not as a data source for consumers.

**Status**: Auxiliary. Not part of the canonical analytics contract. Studio must not depend on it.

### Admin Debug: `/api/admin/analytics-debug`

An admin-only route that returns database fingerprint info, total event counts, and MCP parity checks (strict vs relaxed matching counts). This is an internal diagnostic tool, not a consumer-facing API.

**Status**: Internal. Not part of the analytics contract.

---

## What Studio May Depend On

Studio may safely build against the following as of this spec date:

1. **All 7 MCP tools** with the documented names, parameters, and response shapes.
2. **Structured JSON responses** inside MCP `content[0].text`. Responses are parseable without LLM interpretation.
3. **Date range filtering** via ISO 8601 `from`/`to` parameters on tools 1–6.
4. **Near real-time data** (no significant ingestion delay).
5. **HTTP transport** at `/api/mcp/mcp` as the preferred connection method.

## What Studio Must Not Depend On

1. **PostView counts** — these are legacy and will be deprecated.
2. **Vercel Analytics** — not queryable, not part of the contract.
3. **Admin debug endpoint** — internal only.
4. **Specific event token formats** — the strict/relaxed matching is a BlogTalk implementation detail, not a consumer concern.
5. **Zero-day gap-filling** — `getDailyTrend` does not return entries for zero-pageview days. Studio must handle gaps.

---

## Open Questions

1. **Should BlogTalk expose a REST API alongside MCP for structured dashboard queries?** MCP is designed for LLM tool calling. A dashboard making 5–6 predictable queries per page load may benefit from a simpler REST endpoint that returns the same data without MCP protocol overhead. Decision needed from the owner.

2. **What is the timeline for PostView deprecation?** The reconciliation period has no documented end date. Once deprecated, `/api/views POST` should stop writing to `PostView` and the model can eventually be removed.

3. **Is `@vercel/analytics` still needed?** If the custom analytics pipeline (`AnalyticsEvent`) is sufficient, the Vercel Analytics dependency could be removed to simplify the stack. Or it may be kept as a cross-reference. Decision needed.

4. **Should MCP tool response shapes be versioned?** Currently there is no version field in responses. If shapes change, Studio dashboards break silently. A version header or response field could make this safer.

5. **Should `getDailyTrend` fill zero-pageview days?** Currently it omits them. For charting, Studio needs continuous time series and must fill gaps client-side. BlogTalk could fill them server-side to simplify consumers.

6. **Should `getTopLikedPosts` accept a date range?** It currently returns all-time likes with no time filter, unlike the other 6 tools. Adding a date range would make it consistent and more useful for time-bounded dashboards.

## Success Criteria

- This spec accurately describes BlogTalk's analytics system as verified against code
- The MCP tool manifest matches the actual tools registered in `route.ts`
- Response shapes match the actual `JSON.stringify` outputs in each tool
- The canonical vs legacy vs auxiliary distinction is clear
- Studio can use this spec to design dashboard widgets without further BlogTalk clarification on tool shapes
- Open questions are documented for owner decision

## Dependencies and Risks

- **Dependency**: This spec depends on the current MCP tool implementations remaining stable. If tools are changed without updating this spec, the contract is broken.
- **Risk**: The in-memory rate limiter does not share state across serverless instances. Under high load, effective rate limits may be higher than documented. **Mitigation**: This is a BlogTalk operational concern, not a contract concern for Studio.
- **Risk**: Session IDs are tab-scoped random integers, making unique session counts approximate. **Mitigation**: Documented in the `getUniqueSessions` tool description. Studio should label this metric as "approximate unique visitors."
