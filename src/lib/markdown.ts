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
            const { data } = matter(fileContents);

            return {
                slug,
                title: data.title,
                date: data.date,
                excerpt: data.excerpt,
                tags: data.tags || [],
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

export function getPostBySlug(slug: string): PostData | null {
    try {
        const fullPath = path.join(postsDir, `${slug}.md`);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        return {
            slug,
            title: data.title,
            date: data.date,
            excerpt: data.excerpt,
            tags: data.tags || [],
            coverImage: data.coverImage,
            content,
        };
    } catch (error) {
        return null;
    }
}
