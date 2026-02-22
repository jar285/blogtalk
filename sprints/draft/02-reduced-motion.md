# Sprint 02: Reduced motion + coarse pointer gating

**Goal:** Ensure motion remains premium but respectful of user accessibility preferences and device capabilities.

## UX Changes
- Users with "Reduce Motion" enabled in their OS will see calming, static UI instead of dynamic tracking/parallax.
- Mobile users (coarse pointers) won't have heavy cursor-tracking blobs that drain battery or cause lag.

## Technical Plan
- **Files Touched:** `src/components/ParallaxHero.tsx`, `src/components/MouseBlob.tsx`, `src/components/MagneticElement.tsx`
- **Actions:** 
  - Use `useReducedMotion` from Framer Motion.
  - Gate tracking and parallax animations behind motion preference checks.
  - Use CSS `@media (pointer: coarse)` or JS equivalents to hide/simplify the `MouseBlob` on touch devices.

## Acceptance Criteria
- [ ] `ParallaxHero` falls back to static content layout when reduced motion is preferred.
- [ ] `MouseBlob` is disabled or simplified on mobile devices/coarse pointers.
- [ ] `MagneticElement` disables stickiness if reduced motion is active.

## A11y & Motion Rules
- Parallax depth must flatten; scale and heavy translations should default to `opacity` shifts only or zero-duration transitions.

## Performance Notes
- Removing `MouseBlob` on mobile removes heavy JS `useSpring` and `mousemove` listeners, saving battery and preventing scroll jank.
- Avoid layout shifts when gating features.

## Demo Steps
- Toggle "Reduce Motion" in macOS Accessibility settings or browser DevTools.
- Verify that hero parallax stops, hover effects simplify, and the cursor blob disappears or stops moving.
- Test on a simulated touch device (mobile viewport) to ensure the blob is disabled.
