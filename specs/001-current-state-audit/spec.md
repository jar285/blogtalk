# 001 Current State Audit Spec

## Metadata

- Spec ID: 001-current-state-audit
- Status: Draft
- Purpose: Capture the system as it exists today, without redesign.

## Context

Before feature work continues, the repository needs a reality-based description of current architecture and behavior.
This spec documents the present state so future changes are grounded in verified facts.

## Goals

- Describe major system parts and responsibilities in high-level English.
- Define boundaries between UI, routes, domain logic, data, and content layers.
- Identify external dependencies and source-of-truth systems.
- Surface ambiguity and potential drift between docs and implementation.

## Non-Goals

- Introduce features.
- Change architecture.
- Perform broad refactoring.

## Current System Summary

### Major Parts

- Next.js App Router application in `src/app` with pages and API handlers.
- API surface in `src/app/api` for auth, engagement, analytics, admin, search, subscribe, and MCP.
- UI/component layer in `src/components`.
- Shared utilities in `src/lib`.
- Auth configuration in `src/auth.ts` and request middleware in `src/middleware.ts`.
- Prisma schema in `prisma/schema.prisma` for identity and product data.
- Markdown content source in `content/home.md` and `content/posts/*.md`.

### Boundaries And Responsibilities

- Content rendering depends on file-based markdown ingestion.
- Interaction and analytics events persist to Postgres via Prisma.
- Route handlers coordinate transport concerns and call shared logic/utilities.
- UI components consume API endpoints and session state.

### External Dependencies

- Next.js, React, Prisma, NextAuth/Auth.js, Supabase Postgres, Vercel.
- Markdown parsing/rendering libraries and Fuse.js search.
- MCP tooling for chat-driven analytics access.

### Source-Of-Truth Systems

- Post content and home copy: `content/`.
- Auth and interaction state: Postgres via Prisma models.
- Canonical view analytics: `AnalyticsEvent` records.

## Known Ambiguity And Drift Signals

- Legacy/static narrative remains in parts of markdown content while runtime is dynamic.
- Analytics uses dual pathways (`@vercel/analytics` plus custom ingestion), with boundary intent not fully documented.
- Legacy view reconciliation in `/api/views` has no explicit end-of-migration contract.
- Architecture docs reference migrations under `prisma/`; visible repository state centers on schema definition.

## Success Criteria

- The audit spec can be read without code-level detail and still explain real system behavior.
- Facts, ambiguities, and drift signals are separated clearly.
- The sprint and QA documents for this spec define how to validate and carry findings forward.
