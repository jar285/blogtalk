# Sprint 03: Focus-visible polish + keyboard-first nav

**Goal:** Ensure keyboard navigation feels highly intentional, creating an agency-level accessibility experience.

## UX Changes
- Keyboard users will see crisp, deliberate focus rings that match the app's aesthetic geometry.
- The focus indicator will never "disappear" or become ambiguous.

## Technical Plan
- **Files Touched:** `src/app/globals.css`, `src/components/NavBar.tsx`, `src/components/CommandMenu.tsx`, `src/components/TableOfContents.tsx`
- **Actions:**
  - Standardize `:focus-visible` styling (e.g., precise outline offset, indigo/accent color).
  - Clean up native browser `:focus` rings that clash with the design.
  - Verify tab-index order across the application.

## Acceptance Criteria
- [ ] A consistent `:focus-visible` ring/spacing is applied globally.
- [ ] The Command Palette traps focus properly and elements within it show focus.
- [ ] Table of Contents links show clear focus rings.
- [ ] The Navbar links show clear focus rings.
- [ ] The full site can be navigated reliably by keyboard.

## A11y & Motion Rules
- Focus outlines must have high enough contrast relative to the background.
- Focus movement should not introduce horizontal scrolling or layout shift.

## Performance Notes
- CSS-only changes; no performance regressions. Avoid heavy JS focus management unless trapping focus inside a modal (like `CommandMenu`).

## Demo Steps
- Open the site and rely entirely on the `Tab` key to navigate.
- Verify the focus ring is easily visible on all links, buttons, and interactive cards.
- Open the Command Palette via keyboard and verify focus is trapped within the dialog.
