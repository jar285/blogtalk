# Sprint 07: Command Palette enhancements

**Goal:** Elevate the Cmd+K interface into a "power user" central hub beyond basic navigation.

## UX Changes
- The search modal now houses quick actions like toggling the dark/light theme, copying the current page link, or jumping directly to the newsletter subscription.
- The visual hint shows `⌘K` on macOS/iOS and `Ctrl+K` on Windows/Linux environments dynamically.

## Technical Plan
- **Files Touched:** `src/components/CommandMenu.tsx`, `src/components/NavBar.tsx`
- **Actions:**
  - Inject environment detection (`navigator.userAgent`) on mount to toggle the tooltip string.
  - Add a dedicated generic "Actions" group to the `cmdk` renderer alongside standard navigation and post routing.
  - Implement focus trapping so pressing `Tab` inside the modal does not break out into the hidden background DOM.
  - Lock document body scrolling while the modal is open.

## Acceptance Criteria
- [ ] OS-aware shortcut hint properly displays `⌘K` or `CtrlK`.
- [ ] "Actions" are available inside the modal (Theme Toggle, Copy Link, etc.).
- [ ] Focus is strictly trapped within the Command Palette while open.
- [ ] Background body is locked (no double scrollbars).

## A11y & Motion Rules
- `prefers-reduced-motion: reduce` makes the modal entrance instantaneous rather than a blur/scale fade-in.

## Performance Notes
- OS detection should only execute on the client (`useEffect`) to avoid React hydration mismatches on static export.

## Demo Steps
- Open the Command Palette from a Windows and macOS system to verify shortcut hints.
- Select the `Toggle Theme` action from the palette and verify the app's CSS theme swaps instantly.
