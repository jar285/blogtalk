---
title: "The File System as a Content API"
date: "2026-02-20"
excerpt: "Why we don't need an external CMS, and how Next.js generates our blog using local Markdown files."
tags: ["nextjs", "architecture", "cms"]
coverImage: "/blogtalk/images/fs-api.jpg"
---

When building a blog, one of the first questions you might ask is: **"Which Content Management System (CMS) or Content API should we use?"** Should we use Contentful? Sanity? WordPress?

For this blog, the answer is: **None of them.**

### The "API" is the File System

Instead of relying on a third-party service to host our content and making network requests to fetch it on every build, we use the local repository as our single source of truth. 

Our "Content API" is powered by Node's native `fs` module combined with `gray-matter`:

```typescript
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export function getAllPosts() {
  const postsDir = path.join(process.cwd(), 'content', 'posts');
  const fileNames = fs.readdirSync(postsDir);
  
  // Map files and parse frontmatter...
}
```

### Why Building Statically Rocks

By placing `.md` files directly into our `content/posts/` directory:
1. **Version Control:** Content changes are tracked via Git. Pull requests can be used for editing and reviewing posts.
2. **Performance:** `npm run build` generates pre-rendered HTML files (`nextConfig.output = 'export'`). There is absolutely zero database overhead when a user visits the site.
3. **Simplicity:** No CMS schemas to configure, no API keys to protect, no GraphQL queries to write.

### How to Publish

Because we push this code to **GitHub**, and we have a **GitHub Action** listening to the `main` branch, pushing a new markdown file automatically triggers a Next.js build and deploys the generated static HTML to **GitHub Pages**.

We write a `.md` file. We `git push`. The post goes live.

That's the ultimate Content API.
