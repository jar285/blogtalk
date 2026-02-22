# Sprint 01: Motion tokens + unified transitions

**Goal:** Unify motion feel across the app to create a cohesive, agency-level "language" of movement.

## UX Changes
- Every interactive element (links, buttons, cards) has a predictable and sophisticated response to hover, active, and focus-visible states.
- Replaces scattered, one-off transition durations (`0.3s`, `0.2s`) with an intentional physics-based standard.

## Technical Plan
- **Files Touched:** `[MODIFY] src/app/globals.css`
- **Actions:**
  - Define motion tokens (e.g., `--ease-out-expo`, `--ease-spring`, `--duration-fast`, `--duration-slow`).
  - Audit all existing components leveraging transitions in CSS and replace hardcoded values with variables.
  - Standardize focus and hover logic systematically onto global target classes or element tags.

## Acceptance Criteria
- [ ] Global motion tokens exist in `:root`.
- [ ] Every interactive element has defined `hover`, `active`, and `focus-visible` states.
- [ ] No random one-off transition variants exist in the CSS.

## A11y & Motion Rules
- Must include `@media (prefers-reduced-motion: reduce)` hooks to disable or speed up these transitions (duration: `0.01ms` or opacity-only) to respect accessibility.

## Performance Notes
- Strictly animate `transform`, `opacity`, and `filter` to avoid Layout Shifts (CLS).
- Do not add widespread heavy JS listeners.

## Demo Steps
- Open standard page routes and navigate using keyboard `Tab`.
- Hover and click standard hyperlinks, bento cards, and interactive buttons to verify exact transitions match the defined motion curves.
