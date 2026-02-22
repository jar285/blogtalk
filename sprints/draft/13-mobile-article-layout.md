---
title: "Sprint 13: Mobile Article Layout"
status: draft
---

# Sprint 13: Mobile Article Layout

**Goal:** Make mobile article reading feel seamless and editorial.

**Files touched:**
- `src/app/blog/[slug]/page.tsx`
- `src/app/globals.css`

## Acceptance Criteria:
- [ ] Title doesn’t exceed ~50–65% of first viewport height (Reduce H1 clamp values, `text-wrap: balance`).
- [ ] Meta is a single compact row under title.
- [ ] Tags don’t compete with title (smaller + lighter, optionally horizontally scrolling).
- [ ] Consistent 8px spacing rhythm throughout header.
- [ ] No left-side metadata column on mobile. Everything aligned on one vertical grid.
- [ ] No layout shifts.
- [ ] Reduced motion respected.
- [ ] Body readability polish (font size, line height, max-width, padding).
- [ ] iOS safe area + nav spacing check.
