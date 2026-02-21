# Sprint: Variable Font Weight on Scroll

**Status:** Draft
**Priority:** Low
**Inspiration:** Zhenya Rynzhuk — dynamic typography

## Goal
The hero heading dynamically shifts font weight from 300 → 800 as the user scrolls past it. Subtle but extremely sophisticated.

## Technical Approach
- Use Framer Motion `useScroll` + `useTransform` to map scroll to font-weight
- Apply via inline `style` on the hero h1
- Inter already supports variable weight axis

## Files
- `[MODIFY] src/app/page.tsx` — hero section
