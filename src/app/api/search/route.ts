import { NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/markdown';

// GET /api/search — returns all post metadata for client-side fuse.js search
export async function GET() {
  const posts = getAllPosts();

  const searchable = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    tags: post.tags,
    date: post.date,
    readingTime: post.readingTime,
  }));

  return NextResponse.json(searchable);
}
