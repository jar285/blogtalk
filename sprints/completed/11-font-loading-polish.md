# Sprint 11: Font loading polish

**Goal:** Polish the perceived performance by eradicating any typography flashes and jank during the critical rendering path.

## UX Changes
- Total elimination of layout jumps that occur right when Google Fonts natively pop-in, resulting in a cleaner, instantly "ready" document layout on first paint.

## Technical Plan
- **Files Touched:** `src/app/layout.tsx`, `src/app/globals.css`
- **Actions:**
  - Remove the native `@import` CSS directive inside `globals.css` referencing Inter from the Google CDN.
  - Implement Next.js's optimized `next/font/google` package inside the root layout.
  - Inject the variable font class directly onto the global `<html>` node.

## Acceptance Criteria
- [ ] `Inter` is provided through `next/font/google`.
- [ ] `display: swap` is respected natively without any layout shift metrics hitting Lighthouse.
- [ ] `globals.css` is stripped of third-party network import delays.

## A11y & Motion Rules
- N/A - Strictly a performance upgrade.

## Performance Notes
- Massive boost to Core Web Vitals (FCP, LCP, CLS). Self-hosting the subsetting variable font halts external network requests.

## Demo Steps
- Emulate a Slow 3G network in Chrome DevTools.
- Hard refresh the page.
- Verify that standard fallback fonts are instantly replaced by Inter without severely shifting or wrapping the text inappropriately.
