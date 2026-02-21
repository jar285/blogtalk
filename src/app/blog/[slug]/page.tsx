import { getAllPosts, getPostBySlug } from '@/lib/markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
    const posts = getAllPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const post = getPostBySlug(resolvedParams.slug);

    if (!post) {
        notFound();
    }

    return (
        <article style={{ padding: '2rem 0', maxWidth: '800px', margin: '0 auto' }}>
            <header className="post-header">
                <h1>{post.title}</h1>
                <div className="meta">
                    <span style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>
                        {post.date}
                    </span>
                    <span style={{ opacity: 0.5 }}>&middot;</span>
                    <span style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem', color: '#d97706' }}>
                        {post.readingTime}
                    </span>
                    <span style={{ opacity: 0.5 }}>&middot;</span>
                    <div className="tags" style={{ marginTop: 0 }}>
                        {post.tags.map((tag) => (
                            <span key={tag} className="tag">{tag}</span>
                        ))}
                    </div>
                </div>
            </header>

            <div className="markdown-content">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeHighlight]}
                >
                    {post.content}
                </ReactMarkdown>
            </div>
        </article>
    );
}
