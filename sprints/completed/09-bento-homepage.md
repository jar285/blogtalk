# Sprint: Bento-Style Homepage Redesign

**Status:** Draft
**Priority:** Medium

## Goal
Redesign the homepage into a Bento grid with blocks for: latest article, currently reading/building, mini project spotlight, and social links.

## Technical Approach
- Rewrite `src/app/page.tsx` with CSS Grid bento layout
- Reuse stagger animations from ProjectsGrid
- Pull latest post dynamically using `getAllPosts()[0]`

## Files
- `[MODIFY] src/app/page.tsx`
- `[MODIFY] src/app/globals.css`
