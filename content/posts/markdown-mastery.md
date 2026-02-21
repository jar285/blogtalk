---
title: "Markdown Mastery: GFM and Syntax Highlighting"
date: "2026-02-19"
excerpt: "Exploring the capabilities of remark-gfm and rehype-highlight in a Next.js environment."
tags: ["markdown", "plugins", "design"]
---

When building a blog for developers, **code snippets** and structure matter. That's why I've configured this Next.js setup with `react-markdown` and its rich ecosystem of plugins.

### Syntax Highlighting

Thanks to `rehype-highlight`, any code block gets beautiful styling. For instance, here's the code to fetch our posts:

```typescript
export function getAllPosts() {
  const fileNames = fs.readdirSync(postsDir);
  return fileNames.map(fileName => {
    // magic happens here
  });
}
```

### GitHub Flavored Markdown (GFM)

With `remark-gfm`, we get auto-linked URLs like https://github.com, as well as complex elements like tables and task lists.

| Tool     | Description                         |
|----------|-------------------------------------|
| Next.js  | React framework for fast static sites |
| Markdown | Authoring format                    |
| GitHub   | Hosting and CI/CD                   |

#### Task List
- [x] Initial setup
- [x] Styling components
- [ ] Write 100 posts

> "Simplicity is the soul of efficiency." — Austin Freeman

It's truly a joy to write like this.
