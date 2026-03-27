# 001 Current State Audit QA

## Metadata

- QA ID: 001-current-state-audit/qa
- Parent Spec: `specs/001-current-state-audit/spec.md`
- Parent Sprint: `specs/001-current-state-audit/sprints/sprint-0.md`

## QA Scope

Validate the current-state spec against code reality, and validate whether the sprint achieved its audit-only objective.

## Findings: Spec vs Code

### Matches

- The repo is a Next.js App Router system with API routes under `src/app/api`.
- Content is markdown-based under `content/` and loaded by `src/lib/markdown.ts`.
- Auth and data layers are represented by `src/auth.ts`, `src/middleware.ts`, and `prisma/schema.prisma`.
- API responsibilities include engagement, admin, analytics, search, subscribe, and MCP transport.

### Missing

- No explicit in-repo contract describing final deprecation path for legacy view reconciliation behavior.

### Extra

- Existing legacy sprint archive under `/sprints` remains outside the new `specs/` source-of-truth workflow.

### Ambiguous

- Intended long-term boundary between `@vercel/analytics` and custom analytics ingestion is not fully explicit.
- Some markdown content still narrates static-site assumptions that may not match runtime behavior.

## Findings: Sprint vs Spec

### Matches

- Sprint remained audit-only and did not introduce feature work.
- Reality-capture spec was created and kept high-level.
- Findings were classified into facts, questions, and drift.

### Missing

- No automated enforcement controls are defined yet (expected for a later sprint).

### Extra

- None.

### Ambiguous

- Policy decision pending on whether and how to migrate old `/sprints` artifacts into `specs`.

## Findings Classification

### Confirmed Facts

- App architecture is dynamic (Next.js routes + Prisma + Auth), not static-only.
- Markdown remains the source for post content.
- `AnalyticsEvent` is used as canonical view source in current API behavior.

### Open Questions

- What is the target end-state and timeline for removing or retaining legacy `PostView` reconciliation?
- Should dual analytics paths remain, or should one become authoritative for reporting and instrumentation?
- Should workflow enforcement be documented only or also implemented in CI and PR checks?

### Suspected Drift

- Some content/docs appear older than current runtime architecture and could mislead future planning.
- Legacy sprint workflow artifacts may cause process confusion without explicit governance.

## Disposition

- Action now: Treat this spec as the current baseline for planning.
- Action deferred: Create a follow-up spec to resolve analytics boundary, legacy view migration, and workflow automation.
- Carry-forward items (validated and relevant only):
  - Resolve analytics ownership and documentation.
  - Define policy for legacy sprint archive handling.
  - Add enforcement guardrails for spec-first compliance.
