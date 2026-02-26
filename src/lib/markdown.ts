import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDir = path.join(process.cwd(), 'content');
const postsDir = path.join(contentDir, 'posts');

export interface HomeData {
    title: string;
    subtitle: string;
    tagline: string;
    content: string;
}

export interface PostData {
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    tags: string[];
    readingTime: string;
    coverImage?: string;
    content: string;
}

export function getHomeData(): HomeData {
    const fullPath = path.join(contentDir, 'home.md');
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
        title: data.title,
        subtitle: data.subtitle,
        tagline: data.tagline,
        content,
    };
}

export function getAllPosts(): Omit<PostData, 'content'>[] {
    // Check if directory exists, if not return empty
    if (!fs.existsSync(postsDir)) {
        return [];
    }

    const fileNames = fs.readdirSync(postsDir);
    const allPostsData = fileNames
        .filter((fileName) => fileName.endsWith('.md'))
        .map((fileName) => {
            const slug = fileName.replace(/\.md$/, '');
            const fullPath = path.join(postsDir, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const { data, content } = matter(fileContents);

            const words = content.trim().split(/\s+/).length;
            const readingTime = Math.ceil(words / 200) + ' min read';

            return {
                slug,
                title: data.title,
                date: data.date,
                excerpt: data.excerpt,
                tags: data.tags || [],
                readingTime,
                coverImage: data.coverImage,
            };
        });

    // Sort posts by date
    return allPostsData.sort((a, b) => {
        if (a.date < b.date) {
            return 1;
        } else {
            return -1;
        }
    });
}

/**
 * Get all unique tags with their post counts, sorted by count descending.
 */
export function getAllTags(): { tag: string; count: number }[] {
    const posts = getAllPosts();
    const tagMap = new Map<string, number>();

    for (const post of posts) {
        for (const tag of post.tags || []) {
            const lower = tag.toLowerCase();
            tagMap.set(lower, (tagMap.get(lower) || 0) + 1);
        }
    }

    return Array.from(tagMap.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/**
 * Get all posts matching a specific tag (case-insensitive).
 */
export function getPostsByTag(tag: string): Omit<PostData, 'content'>[] {
    const posts = getAllPosts();
    const lower = tag.toLowerCase();
    return posts.filter((p) =>
        (p.tags || []).some((t) => t.toLowerCase() === lower)
    );
}

export function getPostBySlug(slug: string): PostData | null {
    try {
        const fullPath = path.join(postsDir, `${slug}.md`);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        const words = content.trim().split(/\s+/).length;
        const readingTime = Math.ceil(words / 200) + ' min read';

        return {
            slug,
            title: data.title,
            date: data.date,
            excerpt: data.excerpt,
            tags: data.tags || [],
            readingTime,
            coverImage: data.coverImage,
            content,
        };
    } catch (error) {
        return null;
    }
}

/**
 * Get the next and previous posts relative to the given slug.
 * Posts are sorted newest-first, so "next" = newer, "prev" = older.
 */
export function getAdjacentPosts(slug: string): {
    next: Omit<PostData, 'content'> | null;
    prev: Omit<PostData, 'content'> | null;
} {
    const posts = getAllPosts(); // sorted newest-first
    const idx = posts.findIndex((p) => p.slug === slug);
    if (idx === -1) return { next: null, prev: null };

    return {
        next: idx > 0 ? posts[idx - 1] : null,          // newer post
        prev: idx < posts.length - 1 ? posts[idx + 1] : null,  // older post
    };
}

/**
 * Find up to `limit` related posts by tag overlap, excluding the current slug.
 * Scored by number of shared tags, then by date (newest first).
 */
export function getRelatedPosts(
    slug: string,
    tags: string[],
    limit: number = 3
): Omit<PostData, 'content'>[] {
    if (!tags || tags.length === 0) return [];

    const posts = getAllPosts();
    const tagSet = new Set(tags.map((t) => t.toLowerCase()));

    const scored = posts
        .filter((p) => p.slug !== slug)
        .map((p) => {
            const overlap = (p.tags || []).filter((t) =>
                tagSet.has(t.toLowerCase())
            ).length;
            return { post: p, overlap };
        })
        .filter((s) => s.overlap > 0)
        .sort((a, b) => {
            if (b.overlap !== a.overlap) return b.overlap - a.overlap;
            return b.post.date.localeCompare(a.post.date);
        });

    return scored.slice(0, limit).map((s) => s.post);
}
