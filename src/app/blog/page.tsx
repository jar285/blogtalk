import { getAllPosts } from '@/lib/markdown';
import Link from 'next/link';

export default function BlogList() {
    const posts = getAllPosts();

    return (
        <div>
            <div className="post-header">
                <h1>All Articles</h1>
                <p className="meta">A collection of thoughts on web dev, design, and life.</p>
            </div>

            <div className="post-grid">
                {posts.map((post) => (
                    <Link href={`/blog/${post.slug}`} key={post.slug} className="post-card">
                        <span className="date">{post.date}</span>
                        <h2>{post.title}</h2>
                        <p>{post.excerpt}</p>
                        <div className="tags">
                            {post.tags.map((tag) => (
                                <span key={tag} className="tag">{tag}</span>
                            ))}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
