# Sprint 06: Code blocks pro features (minimal, valuable)

**Goal:** Ensure the code reading experience feels best-in-class, offering professional developer-centric layout toggles without bloat.

## UX Changes
- Readers encountering long code snippets can optionally toggle text-wrapping to read dense horizontal code.
- We will review if code expansion (collapse/expand long blocks) is necessary for extremely large files, minimizing visual fatigue.

## Technical Plan
- **Files Touched:** `src/components/CodeBlock.tsx`
- **Actions:**
  - *Note: The copy tooltip/toast feedback was already completed in a prior bugfix.*
  - Add a subtle icon toggle in the code block header (near the language badge) to enable/disable CSS `white-space: pre-wrap` on the `<pre>` container.
  - (Optional) If block height exceeds ~500px, collapse it by default and show a "View More" gradient expander.

## Acceptance Criteria
- [ ] Toggle button exists to wrap/unwrap code lines for long horizontal strings.
- [ ] Does not alter document flow or cause unexpected jumping/CLS when adjusting wrap states.
- [ ] The "copy to clipboard" logic remains fully functional regardless of the wrap state.

## A11y & Motion Rules
- Toggle button must be keyboard focusable with an aria-label (e.g., "Toggle word wrap").
- If implementing collapse/expand, the height transition should be buttery but instant for `prefers-reduced-motion`.

## Performance Notes
- Keep DOM logic simple. Toggling CSS classes is cheap; avoid recalculating dimensions with heavy JS.

## Demo Steps
- Create a markdown post with a deliberately long line of code.
- Navigate to the post and interact with the "Wrap" toggle on the code block.
- Verify the code wraps correctly, avoiding horizontal scrolling.
