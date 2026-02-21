# Sprint: Magnetic Cursor Interactions

**Status:** Draft
**Priority:** High
**Inspiration:** Zhenya Rynzhuk — gravitational UI elements

## Goal
Nav links, project cards, and buttons subtly pull toward the cursor as it approaches. When the cursor leaves, they spring back with physics-based easing. Creates a spatial, alive feel.

## Technical Approach
- Create a reusable `<MagneticElement>` client component using Framer Motion
- Uses `onMouseMove` to calculate offset between cursor and element center
- Applies a `translate` transform proportional to the distance (clamped)
- Uses `useSpring` for buttery smooth return-to-origin on mouse leave
- Wrap nav links, project cards, and CTA buttons with this component

## Files
- `[NEW] src/components/MagneticElement.tsx`
- `[MODIFY] src/app/layout.tsx` — wrap nav links
- `[MODIFY] src/components/ProjectsGrid.tsx` — wrap card titles

## Verification
- Hover over nav links → should pull toward cursor
- Move cursor away → should spring back smoothly
- No jitter, no layout shift, no performance issues
