# Sprint: Text Reveal Animations

**Status:** Draft
**Priority:** High
**Inspiration:** Zhenya Rynzhuk — split-word kinetic typography

## Goal
Instead of entire pages fading in, headings and paragraphs reveal with staggered split-word or split-line animations. The hero title animates word-by-word with slight delays.

## Technical Approach
- Create `<TextReveal>` component that splits text into individual `<span>` words
- Each word uses Framer Motion `variants` with stagger
- Apply to hero h1, archive header, project header
- Optional: line-by-line reveal for body paragraphs on scroll using `useInView`

## Files
- `[NEW] src/components/TextReveal.tsx`
- `[MODIFY] src/app/page.tsx` — hero title
- `[MODIFY] src/app/blog/page.tsx` — archive header
- `[MODIFY] src/app/projects/page.tsx` — projects header
