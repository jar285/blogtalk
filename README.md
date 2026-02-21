# BlogTalk
A fast, beautiful, statically-generated personal blog built with Next.js, Markdown, and deployed to GitHub Pages.

Designed with a premium dark glassmorphism aesthetic and optimized for a seamless writing experience.

## The Architecture
- **Framework:** [Next.js](https://nextjs.org) (App Router)
- **Content:** Local `.md` files parsed via `gray-matter`
- **Rendering:** `react-markdown` with `remark-gfm` for advanced formatting
- **Styling:** Custom vanilla CSS (dark theme + glassmorphism)
- **Deployment:** Statically exported (`output: 'export'`) and hosted on **GitHub Pages** via GitHub Actions

## How to Run Locally

First, clone the repository.

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **View the site:** Open [http://localhost:3000](http://localhost:3000) with your browser.

## How to Publish Content

Because this blog does not use an external CMS, the "Content API" is the file system itself.

### Editing the Homepage
To change the intro text, tagline, or hero section on the homepage, edit the single `content/home.md` file.

### Writing a New Blog Post
Writing a post is as simple as creating a new Markdown file in the `content/posts/` directory.

1. Create a new file (e.g., `content/posts/my-new-post.md`).
2. Add the required YAML frontmatter at the top of the file:
   ```yaml
   ---
   title: "Your Post Title"
   date: "YYYY-MM-DD"
   excerpt: "A short summary of what the post is about."
   tags: ["tag1", "tag2"]
   ---
   ```
3. Write your content in Markdown below the frontmatter. Include code blocks, tables, lists, or blockquotes!
4. **Deploy:** Simply run `git add .`, `git commit -m "Add new post"`, and `git push`. GitHub Actions will automatically rebuild the site and push it live to GitHub Pages.

## License
MIT
