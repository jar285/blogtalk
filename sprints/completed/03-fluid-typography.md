# Sprint: Fluid Typography & Vertical Rhythm

**Status:** Draft
**Priority:** Medium
**Inspiration:** Aurélien Salomon — precise typographic systems

## Goal
Replace fixed `rem` values with `clamp()` for fluid scaling. Establish a strict 8px baseline grid for all spacing to create perfect visual rhythm.

## Technical Approach
- Define CSS custom properties for fluid type scale using `clamp()`
- Apply to hero h1, h2, h3, body text, and meta text
- Audit all margins/paddings to snap to 8px multiples
- Ensure zero awkward breakpoints — everything scales smoothly

## Files
- `[MODIFY] src/app/globals.css` — typography overhaul
