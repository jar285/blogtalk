# Sprint: Dark / Light Mode Toggle

**Status:** Draft
**Priority:** Medium

## Goal
A sleek toggle in the nav that transitions the entire color palette. The mouse blob shifts from indigo glow to warm amber in light mode.

## Technical Approach
- Define `:root` and `[data-theme="light"]` CSS variable sets
- Create a `<ThemeToggle>` client component with localStorage persistence
- Animate the transition using CSS `transition` on `background-color` and `color`

## Files
- `[NEW] src/components/ThemeToggle.tsx`
- `[MODIFY] src/app/globals.css` — light theme variables
- `[MODIFY] src/app/layout.tsx` — add toggle to nav
