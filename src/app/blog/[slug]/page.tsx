import { getAllPosts, getPostBySlug } from '@/lib/markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import { notFound } from 'next/navigation';
import TableOfContents, { Heading } from '@/components/TableOfContents';

export async function generateStaticParams() {
    const posts = getAllPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

import CodeBlock from '@/components/CodeBlock';

// Helper to generate a slug from plain text identical to rehypeSlug
function slugify(text: string) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const post = getPostBySlug(resolvedParams.slug);

    if (!post) {
        notFound();
    }

    // Extract H2 and H3 headings for the TOC
    const headingLines = post.content.split('\n').filter((line) => line.match(/^#{2,3}\s/));
    const headings: Heading[] = headingLines.map((line) => {
        const level = line.startsWith('###') ? 3 : 2;
        const text = line.replace(/^#+\s/, '').trim();
        return {
            id: slugify(text),
            text,
            level,
        };
    });

    return (
        <article style={{ padding: '2rem 0', maxWidth: '1200px', margin: '0 auto' }}>
            <header className="post-header" style={{ maxWidth: '800px', margin: '0 auto 3rem auto' }}>
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

            <div className="post-layout">
                <div className="markdown-content">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw, rehypeHighlight, rehypeSlug]}
                        components={{
                            code({ node, inline, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline && match ? (
                                    <CodeBlock className={className} {...props}>
                                        {children}
                                    </CodeBlock>
                                ) : (
                                    <code className={className} {...props}>
                                        {children}
                                    </code>
                                );
                            },
                        }}
                    >
                        {post.content}
                    </ReactMarkdown>
                </div>

                <aside className="post-sidebar">
                    <TableOfContents headings={headings} />
                </aside>
            </div>
        </article>
    );
}
