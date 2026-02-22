# Sprint 10: Newsletter CTA UX

**Goal:** Elevate the Newsletter Component so the Call-To-Action feels like a premium reality even without complex backend integration initially.

## UX Changes
- Replaces the generic, blocking browser `alert()` on submission with smooth, inline React success/error toast or state swaps inside the UI box itself.

## Technical Plan
- **Files Touched:** `src/components/NewsletterCTA.tsx`, `src/app/globals.css`
- **Actions:**
  - Use standard React state (`enum: 'idle' | 'loading' | 'success' | 'error'`) to manage the form state.
  - Wrap the generic inline styles currently in `NewsletterCTA.tsx` into a robust `module.css` or the central design system classes.
  - Simulate a 1-second network delay before returning a mocked `success` state for visual effect.

## Acceptance Criteria
- [ ] Browser `alert()` is removed.
- [ ] Inputs are fully labeled and structurally accessible to screen readers.
- [ ] The submit button animates to a loader state dynamically.
- [ ] The component gracefully transitions to a permanent "Thanks for subscribing!" UI block on success.

## A11y & Motion Rules
- Network-loading spinners generally should not animate under `prefers-reduced-motion` but the status transition text must still correctly render.
- Form must include an explicit `<label className="sr-only">`.

## Performance Notes
- Move hardcoded inline DOM styles to pure CSS caching for minor hydration improvements.

## Demo Steps
- Scroll to the bottom of any article.
- Submit an email into the input.
- Watch the button switch to "Subscribing...", wait 1 second, and watch the CTA smoothly transform into a success message block.
