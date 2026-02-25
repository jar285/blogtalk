import Link from 'next/link';
import { PostData } from '@/lib/markdown';
import { FileText } from 'lucide-react';

interface RelatedPostsProps {
    posts: Omit<PostData, 'content'>[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
    if (posts.length === 0) return null;

    return (
        <section className="related-posts" aria-label="Related posts">
            <h2 className="related-posts-heading">Related Posts</h2>
            <div className="related-posts-grid">
                {posts.map((post) => (
                    <Link
                        key={post.slug}
                        href={`/blog/${post.slug}`}
                        className="related-post-card"
                    >
                        <FileText size={18} className="related-post-icon" />
                        <div className="related-post-info">
                            <span className="related-post-title">{post.title}</span>
                            <span className="related-post-meta">
                                {post.date} &middot; {post.readingTime}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
