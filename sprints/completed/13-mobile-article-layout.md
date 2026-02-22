---
title: "Sprint 13: Mobile Article Layout"
status: completed
---

# Sprint 13: Mobile Article Layout

**Goal:** Make mobile article reading feel seamless and editorial.

**Files touched:**
- `src/app/blog/[slug]/page.tsx`
- `src/app/globals.css`
- `src/app/layout.tsx`

## Changes Implemented

### 1. Mobile Article Header - Cohesive Editorial Module
- Replaced desktop-style stacked clusters with a single vertical rhythm module
- Added `@media (max-width: 767px)` block for mobile-first header styling
- Added `border-bottom` divider between header and body for editorial transition
- Aligned all spacing to 8px baseline grid (`--space-*` tokens)

### 2. Headline Typography Tuning
- Reduced `--fs-h1` clamp lower bound from `2rem` (32px) to `1.625rem` (26px)
- `.post-header h1` now uses `var(--fs-h1)` token instead of hardcoded clamp
- Improved `line-height` from `1.15` to `1.25` for readability
- `text-wrap: balance` preserved
- Fixed hardcoded `color: #fff` to `var(--text-primary)` for light-theme support

### 3. Tag Chips - Supporting Role on Mobile
- Reduced mobile chip font-size to `0.65rem`, padding to `0.15rem 0.5rem`
- Lowered font-weight from `600` to `500` and border opacity
- Added `flex-shrink: 0` to prevent squishing during horizontal scroll
- Horizontal scroll preserved (no JS truncation)
- Added `[data-theme="light"]` override for chip background/border

### 4. Meta Row - Tighter on Mobile
- Reduced font-size to `0.8rem`, gap to `0.35rem`, letter-spacing to `0.5px`

### 5. Safe-Area Padding
- Added `viewport-fit=cover` meta tag in `layout.tsx`
- Footer gets `padding-bottom: calc(3rem + env(safe-area-inset-bottom, 0px))`

### 6. Structural Cleanup
- Removed inline `style` on `<article>` in blog slug page; replaced with `.post-article` CSS class
- Desktop `margin-bottom` uses `var(--space-6)` instead of hardcoded `4rem`

## Acceptance Criteria
- [x] Title does not exceed ~50-65% of first viewport height (reduced H1 clamp, `text-wrap: balance`)
- [x] Meta is a single compact row under title
- [x] Tags do not compete with title (smaller + lighter, horizontally scrolling on mobile)
- [x] Consistent 8px spacing rhythm throughout header
- [x] No left-side metadata column on mobile - everything on one vertical grid
- [x] No layout shifts
- [x] Reduced motion respected (no new animations introduced)
- [x] Body readability polish (font size, line height, padding)
- [x] iOS safe area + nav spacing check (viewport-fit=cover + env safe-area-inset-bottom)
- [x] Light theme H1 and tag chip colors work correctly
