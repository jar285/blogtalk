---
title: "How to Author a New Post on Jesus Blog"
date: "2026-02-21"
excerpt: "A quick tutorial on YAML frontmatter, Markdown features, and publishing your thoughts instantly."
tags: ["tutorial", "markdown", "publishing"]
---

Because we're using the local file system as our Content API, publishing a new post on Jesus Blog is wonderfully simple. There are no databases to sync, no rich-text editors to fight with, and no complex deployment scripts to run locally.

Here is exactly how you write and publish a new blog post.

### Step 1: Create a Markdown File

Navigate to the `content/posts/` directory in this repository and create a new `.md` file. The name of the file will automatically become the URL **slug**. 

For example, creating `my-great-post.md` means the URL will be `/blog/my-great-post`.

### Step 2: Add the Frontmatter

At the very top of your file, you must include a YAML "frontmatter" block. This tells Next.js the metadata for your post, like the title, date, and tags. 

It must be wrapped in `---` dashes, like this:

```yaml
---
title: "The Ultimate Guide to Next.js Static Exports"
date: "2026-02-21"
excerpt: "Learn how to build lighting-fast blogs natively."
tags: ["nextjs", "react", "tutorial"]
---
```

*Note: The `date` parameter is used to sort the posts on the homepage and the main blog listing from newest to oldest!*

### Step 3: Write Your Post 

Below the frontmatter, just start writing in standard Markdown! Because we configured `remark-gfm` and `react-markdown`, you have access to advanced formatting.

You can write headers, bold text, or create lists:
- Item 1
- Item 2

You can even create blockquotes:
> "Talk is cheap. Show me the code." — Linus Torvalds

### Step 4: Push to GitHub

Once you're happy with your writing, all you have to do is push your code:

```bash
git add .
git commit -m "Publish new tutorial post"
git push
```

That's it! GitHub Actions will immediately detect the push, rebuild the static HTML, and deploy the new post to GitHub Pages in about 60 seconds. Happy writing!
