# Sprint 05: Heading permalink micro-interaction

**Goal:** Add a delightful "pro" touch for readers by displaying a subtle permalink icon on heading hover that copies the section URL.

## UX Changes
- When hovering over (or focusing on) subheadings (`h2`, `h3`) in a blog post, a sleek link icon (`#` or `Link`) will appear beside it.
- Clicking the heading copies a deep link to that exact section of the article, confirming the action with a brief non-blocking toast notification.

## Technical Plan
- **Files Touched:** `src/app/blog/[slug]/page.tsx` (or custom heading components), `src/app/globals.css`
- **Actions:**
  - Override default `h2` and `h3` renderers in `react-markdown` to include the permalink logic and hover states.
  - Implement a copy-to-clipboard function for the constructed URL (`window.location.origin + pathname + '#' + id`).
  - Trigger a global toast (reusing the one from CodeBlocks if possible).

## Acceptance Criteria
- [ ] Subheadings reveal a subtle permalink icon on mouse hover.
- [ ] Icon is accessible and reachable via keyboard focus (`Tab`).
- [ ] Clicking the heading copies the absolute URL with the anchor hash to clipboard.
- [ ] A non-blocking success toast appears confirming the copy operation.

## A11y & Motion Rules
- The permalink anchor must be focusable.
- The link icon entrance should respect the motion tokens and reduce to instant appearance under `prefers-reduced-motion`.

## Performance Notes
- Minimal DOM additions per heading. Ensure event handlers don't leak or lag the markdown rendering tree.

## Demo Steps
- View a blog post.
- Hover over an `H2` or `H3` tag to see the anchor icon.
- Click the heading; verify the URL is copied to your clipboard.
- Paste the URL in a new tab and confirm it anchors immediately to that section.
