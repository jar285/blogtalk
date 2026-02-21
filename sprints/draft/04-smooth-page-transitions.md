# Sprint: Smooth Page Transitions

**Status:** Draft
**Priority:** Medium
**Inspiration:** Aurélien Salomon — morphing shared layout elements

## Goal
Upgrade from simple fade+slide to shared layout animations where persistent elements (nav, titles) morph between positions across route changes.

## Technical Approach
- Use Framer Motion `layoutId` on shared elements
- Implement exit animations on route change using `AnimatePresence`
- Potentially use `framer-motion`'s `LayoutGroup` for coordinated transitions

## Files
- `[MODIFY] src/app/template.tsx`
- `[MODIFY] src/components/ArchiveList.tsx` — add layoutId to titles
