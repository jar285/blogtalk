# Sprint: 002-analytics-source-of-truth / sprint-0

**Parent Spec**: specs/002-analytics-source-of-truth/spec.md
**Status**: Complete
**Date**: 2026-03-25

## Goal

Audit BlogTalk's current analytics implementation, document all data paths and MCP tools with their exact parameters and response shapes, and determine what Studio can safely depend on today versus what requires owner decisions.

## Spec Items Implemented

This sprint addresses the following sections of the parent spec:

- **Canonical Analytics Architecture**: Full documentation of `AnalyticsEvent`, collection path, data freshness, rate limits
- **MCP Analytics Interface**: All 7 tools documented with names, parameters, response shapes, and query behavior
- **Auxiliary Analytics Paths**: PostView reconciliation, `@vercel/analytics`, admin debug
- **What Studio May / Must Not Depend On**: Categorized
- **Open Questions**: Surfaced from code audit

## Scope

What this sprint does:

- Audit every analytics-related file in BlogTalk
- Document all analytics data paths (canonical, legacy, auxiliary)
- Document all 7 MCP tools with exact parameter schemas and response shapes
- Determine whether MCP responses are structured or text-only (confirmed: structured JSON)
- Document whether a REST analytics surface exists (confirmed: it does not, only MCP + legacy `/api/views`)
- Identify what Studio can safely depend on now
- Identify what requires owner decisions before proceeding
- Document rate limits, data freshness, and operational constraints

## Out of Scope

- Implementing new MCP tools or REST endpoints
- Changing any BlogTalk code
- Building Studio dashboard components
- Resolving open questions (those require owner decisions)

## Tasks

- [x] Read `src/app/api/mcp/[transport]/route.ts` — identify all registered tools
- [x] Document `getPageviews` tool: params, response shape, query behavior
- [x] Document `getTopPages` tool: params, response shape, query behavior
- [x] Document `getUniqueSessions` tool: params, response shape, query behavior
- [x] Document `getTrafficSources` tool: params, response shape, query behavior
- [x] Document `getDeviceBreakdown` tool: params, response shape, query behavior
- [x] Document `getDailyTrend` tool: params, response shape, query behavior
- [x] Document `getTopLikedPosts` tool: params, response shape, query behavior
- [x] Read `src/app/api/drain/analytics/route.ts` — document ingestion pipeline
- [x] Read `src/components/AnalyticsCollector.tsx` — document client-side collection
- [x] Read `prisma/schema.prisma` — document `AnalyticsEvent` and `PostView` models
- [x] Read `src/lib/analyticsQueries.ts` — document shared query functions
- [x] Read `src/lib/validations.ts` — document `analyticsEventSchema`
- [x] Read `src/lib/rateLimiter.ts` — document rate limiting
- [x] Read `src/app/api/views/route.ts` — document legacy compatibility path
- [x] Read `src/app/api/admin/analytics-debug/route.ts` — document admin debug
- [x] Check `package.json` for `@vercel/analytics` — confirm dual analytics
- [x] Confirm MCP transport configuration (HTTP preferred, SSE alternate)
- [x] Categorize: what Studio can depend on vs what it must not
- [x] Surface open questions requiring owner decisions

## Audit Findings

### Analytics Data Paths Identified

| Path | Role | Status |
|------|------|--------|
| `AnalyticsEvent` table | Canonical analytics source | Active, stable |
| `POST /api/drain/analytics` | Event ingestion from client beacon | Active, stable |
| `AnalyticsCollector` component | Client-side pageview tracking | Active, stable |
| MCP tools at `/api/mcp/mcp` | Structured analytics query interface | Active, 7 tools |
| `PostView` table | Legacy per-view records | Active, reconciliation period |
| `GET/POST /api/views` | Legacy compatibility endpoint | Active, returns canonical counts |
| `@vercel/analytics` | Vercel dashboard analytics | Auxiliary, not queryable |
| `GET /api/admin/analytics-debug` | Admin diagnostic tool | Internal only |

### Canonical Path Confirmed

The canonical analytics path is:

```
AnalyticsCollector → /api/drain/analytics → AnalyticsEvent → MCP tools
```

All 7 MCP tools query the `AnalyticsEvent` table (tools 1–6) or the `Like` table (tool 7). No tool queries `PostView`. The canonical source is unambiguous.

### MCP Tools: Structured vs Text

**Confirmed: All tools return structured JSON.** Every tool wraps its response in `JSON.stringify()` and returns it as `{ content: [{ type: 'text', text: <json_string> }] }`. The inner JSON contains typed numbers, arrays, and objects — not free-text prose. This means Studio can parse responses directly for charting without LLM interpretation.

### What Studio Can Depend On Now

These are stable, code-verified, and safe for Studio to build against:

1. **Tool names**: `getPageviews`, `getTopPages`, `getUniqueSessions`, `getTrafficSources`, `getDeviceBreakdown`, `getDailyTrend`, `getTopLikedPosts`
2. **Parameter schemas**: All use Zod validation. `from`/`to` as ISO 8601 strings, `limit` as integer 1–20.
3. **Response shapes**: Documented in the parent spec with exact field names and types.
4. **HTTP transport**: `/api/mcp/mcp` as preferred endpoint.
5. **Data freshness**: Near real-time (beacon on each pageview, no batching).
6. **Common query behavior**: Strict-then-relaxed matching, path exclusions, date normalization.

### What Requires Owner Decisions

1. **REST API**: Should BlogTalk add REST endpoints for dashboard-style queries? MCP protocol overhead may be unnecessary for predictable, repeated queries.
2. **PostView deprecation timeline**: When does the reconciliation period end? Studio should not build on PostView.
3. **`@vercel/analytics` retention**: Keep, remove, or document as explicitly auxiliary?
4. **Response versioning**: Should tools include a version field to prevent silent breaking changes?
5. **Zero-day gap-filling in `getDailyTrend`**: Should BlogTalk fill missing days, or should Studio handle it?
6. **Date range for `getTopLikedPosts`**: Should this tool accept `from`/`to` for consistency?

### Studio → BlogTalk Dashboard Capability Mapping

| Studio Dashboard Widget | BlogTalk Tool | Chartable? | Status |
|-------------------------|---------------|------------|--------|
| Total pageviews (summary card) | `getPageviews` | Yes (single number) | Ready |
| Top pages (bar chart / table) | `getTopPages` | Yes (array of path + count) | Ready |
| Unique visitors (summary card) | `getUniqueSessions` | Yes (single number, approximate) | Ready |
| Traffic sources (pie chart / bar chart) | `getTrafficSources` | Yes (array of referrer + count) | Ready |
| Device breakdown (pie chart) | `getDeviceBreakdown` | Yes (object of device → count) | Ready |
| Daily trend (line chart) | `getDailyTrend` | Yes (time series array) | Ready (Studio must fill zero-days) |
| Top liked posts (table) | `getTopLikedPosts` | Yes (array of slug + likes) | Ready (no date filter) |

All 7 dashboard widgets map to real, existing, code-verified tools.

## Acceptance Criteria

- All analytics data paths are documented with their role and status
- All 7 MCP tools are documented with exact parameters and response shapes
- Response format is confirmed as structured JSON (not free text)
- The canonical path is identified and unambiguous
- What Studio can depend on is explicitly listed
- What requires owner decisions is explicitly listed
- No BlogTalk code was changed

## Invariants Carried Forward

All workflow invariants from specs/000-workflow/spec.md apply, plus:

- No BlogTalk code changes during this audit
- All findings verified against actual source files
- Structured JSON confirmation based on code reading, not runtime testing

## Validated Findings from Prior QA

From specs/001-current-state-audit/qa.md:

- Analytics uses dual pathways (`@vercel/analytics` plus custom ingestion), with boundary intent not fully documented. (Addressed: this sprint documents the distinction and marks `@vercel/analytics` as auxiliary.)
- Legacy view reconciliation in `/api/views` has no explicit end-of-migration contract. (Addressed: documented as open question #2.)

## Evidence of Completion

- `specs/002-analytics-source-of-truth/spec.md` exists with all 7 tools documented
- All files listed in Source of Truth section were read and their behavior documented
- No files under `src/` were modified
- The capability mapping table confirms all dashboard widgets map to real tools

## Linked Files / Routes / Modules

Files this sprint reads (not modifies):

- `src/app/api/mcp/[transport]/route.ts` — 7 tool definitions
- `src/app/api/drain/analytics/route.ts` — ingestion pipeline
- `src/components/AnalyticsCollector.tsx` — client-side collection
- `src/lib/analyticsQueries.ts` — shared query functions
- `src/lib/validations.ts` — analyticsEventSchema
- `src/lib/rateLimiter.ts` — rate limiting
- `src/app/api/views/route.ts` — legacy compatibility
- `src/app/api/admin/analytics-debug/route.ts` — admin debug
- `prisma/schema.prisma` — data models
- `package.json` — @vercel/analytics dependency

Files this sprint creates:

- `specs/002-analytics-source-of-truth/spec.md`
- `specs/002-analytics-source-of-truth/sprints/sprint-0.md` (this file)
- `specs/002-analytics-source-of-truth/qa.md`

## Risks and Mitigations

- **Risk**: MCP tool implementations could change without updating this spec. **Mitigation**: The spec is dated; future sprints should re-verify tools before implementation.
- **Risk**: The audit was static (code reading only, no runtime verification). Tool behavior under edge cases (malformed dates, huge date ranges, concurrent requests) was not tested. **Mitigation**: Findings are based on code logic, which is deterministic. Runtime edge cases can be tested in a future sprint.
