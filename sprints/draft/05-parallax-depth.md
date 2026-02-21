# Sprint: Parallax Depth on Scroll

**Status:** Draft
**Priority:** Low

## Goal
Different layers on the homepage (hero text, tagline, background blob) move at different scroll speeds for a cinematic depth effect.

## Technical Approach
- Use Framer Motion `useScroll` + `useTransform` to map scroll position to Y offsets
- Apply varying speeds to hero h1, tagline, and the MouseBlob

## Files
- `[MODIFY] src/app/page.tsx`
- `[MODIFY] src/components/MouseBlob.tsx`
