# Sprint 08: Reading completion UX

**Goal:** Ensure the end-of-post experience feels deliberately designed and encourages continued reading, rather than an abrupt halt.

## UX Changes
- Reaching the bottom of an essay logically presents the "Next" and "Previous" chronologically ordered essays.
- Suggests "Related Posts" based on overlapping category tags.

## Technical Plan
- **Files Touched:** `src/app/blog/[slug]/page.tsx`, `src/lib/markdown.ts`, `src/components/RelatedPosts.tsx` (New)
- **Actions:**
  - Create a utility inside `markdown.ts` to identify adjacent posts based on the sorted array indices.
  - Create a basic intersection algorithm to find posts sharing the highest number of frontmatter `tags`.
  - Pass this computed data into the static build loop in the dynamic route.

## Acceptance Criteria
- [ ] Every blog post displays "Next / Previous" navigation at the footer.
- [ ] Up to three "Related Posts" cards are displayed if suitable overlaps exist.
- [ ] All reading progression logic is statically generated at build time (`generateStaticParams`). No runtime fetching.

## A11y & Motion Rules
- The next/prev link hitboxes must be large and accessible (minimum 44x44px target sizes).
- Hover states must align with the global motion tokens.

## Performance Notes
- Pre-computing related posts during the static build ensures zero client-side latency or heavy javascript bundling.

## Demo Steps
- Navigate to the middle of the available blog posts timeline.
- Scroll to the bottom and verify both "Next" and "Previous" buttons are rendering correctly and routing properly.
- Verify the related posts section populates with items sharing matching tags.
