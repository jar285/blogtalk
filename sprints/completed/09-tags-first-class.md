# Sprint 09: Tags become first-class

**Goal:** Ensure topic discovery feels effortless and fully integrated, allowing users to browse deeply by their specific interests.

## UX Changes
- Every tag badge (on post cards and inside articles) becomes a deeply linked button navigating to a dedicated tag gallery.
- An overarching `/tags` index page provides a high-level view of all topics explored on the blog, sorted by post density.

## Technical Plan
- **Files Touched:** `src/app/tags/page.tsx`, `src/app/tags/[tag]/page.tsx`, `src/lib/markdown.ts`, `src/components/BentoHomepage.tsx`
- **Actions:**
  - Parse all existing posts to extract a unique Set of tags and count their occurrences.
  - Use `generateStaticParams` for `/tags/[tag]/page.tsx` to pre-build a filtered list view for every existing tag.
  - Update any hardcoded `<span>` tags to `<Link>` components pointing to the new routes.

## Acceptance Criteria
- [x] `/tags` index page exists and lists all tags with their respective post counts.
- [x] Specific tag listing pages (`/tags/[tag]`) correctly load the corresponding filtered subset of posts.
- [x] Tag chips anywhere across the site are clickable and correctly mapped.
- [x] Statically generated at build time.

## A11y & Motion Rules
- Focus outlines must envelope the entire tag chip securely.

## Performance Notes
- This uses static generation so performance will be indistinguishable from normal routing. Build time may increase slightly.

## Demo Steps
- View a blog post.
- Click a specific tag (e.g., "AI", "Design") from the post header.
- Verify routing lands on `/tags/[tag]` and displays a filtered archive grid.
