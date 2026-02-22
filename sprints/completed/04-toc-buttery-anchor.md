# Sprint 04: TOC "buttery" anchor behavior

**Goal:** Ensure clicking Table of Contents links feels perfect, landing securely at the right reading position without clipping beneath sticky headers.

## UX Changes
- Clicking a TOC sidebar link will smoothly scroll the page so the section heading anchors beautifully in the viewport with generous top padding, instead of being cut off at the very edge of the window.

## Technical Plan
- **Files Touched:** `src/app/globals.css`, `src/components/TableOfContents.tsx`
- **Actions:**
  - Add standard `scroll-margin-top` to all markdown heading elements (`h1`, `h2`, `h3`, `h4`, `h5`, `h6`) matching the height of the sticky navbar / desired breathing room.
  - Enforce `scroll-behavior: smooth` for in-page anchors if it aligns with motion tokens.

## Acceptance Criteria
- [ ] Clicking any TOC item scrolls perfectly into view.
- [ ] The heading is never obscured by the top edge of the browser viewport.
- [ ] Scrollspy highlight keeps accurate tracking even with the new layout margins.

## A11y & Motion Rules
- If `prefers-reduced-motion` is active, `scroll-behavior: smooth` MUST be overridden to `auto` (instant jump).

## Performance Notes
- CSS-only layout adjustment (`scroll-margin-top`); zero JS performance overhead.
- No Cumulative Layout Shift (CLS) on initial load, only adjusts scroll targeting.

## Demo Steps
- Open a long blog post with a TOC.
- Click a middle heading link.
- Verify the scroll ends with the heading clearly visible ~80px-100px from the top of the viewport.
- Check scroll-spy updates the active link correctly.
