# Sprint 12: TOC slug correctness hardening

**Goal:** Assure the intricate Table of Contents sidebar remains flawless even when users write repetitive or similarly structured headings throughout an article.

## UX Changes
- Users jumping via the anchor TOC never end up snapping to the wrong repeated heading higher up the chain. Complete reliability for deep-linking.

## Technical Plan
- **Files Touched:** `src/app/blog/[slug]/page.tsx`
- **Actions:**
  - Standardize identical, deterministic slug generation algorithms between `rehype-slug` (the markdown engine adding the IDs to the `h2`/`h3` elements) and the custom `slugify()` function (used to render the left-sidebar `<nav>` items).
  - Handle duplicate heading labels (e.g., repeating the heading "Summary") by appending indices automatically (e.g., `summary`, `summary-1`, `summary-2`).

## Acceptance Criteria
- [ ] Unique, duplicate-hardened slugs exist in the final rendered Markdown output via `rehype-slug`.
- [ ] The sidebar TOC successfully syncs with identical duplicate slugs.
- [ ] Clicks on identical headings scroll accurately without conflict.

## A11y & Motion Rules
- N/A

## Performance Notes
- Precomputable logic on the server/static phase. Zero runtime cost.

## Demo Steps
- Add three consecutive `## Summary` headings into a markdown post.
- Verify the left sidebar builds `summary`, `summary-1`, and `summary-2`.
- Click `summary-2` and verify the viewport snaps exactly to the third occurence in the document.
