import GithubSlugger from 'github-slugger';
import { getAllPosts, getPostBySlug, getAdjacentPosts, getRelatedPosts } from '@/lib/markdown';
import NewsletterCTA from '@/components/NewsletterCTA';
import RelatedPosts from '@/components/RelatedPosts';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import { notFound } from 'next/navigation';
import TableOfContents, { Heading } from '@/components/TableOfContents';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export async function generateStaticParams() {
    const posts = getAllPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

import CodeBlock from '@/components/CodeBlock';
import CopyableHeading from '@/components/CopyableHeading';
export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const post = getPostBySlug(resolvedParams.slug);

    if (!post) {
        notFound();
    }

    // Extract H2 and H3 headings for the TOC
    const slugger = new GithubSlugger();
    const headingLines = post.content.split('\n').filter((line) => line.match(/^#{2,3}\s/));
    const headings: Heading[] = headingLines.map((line) => {
        const level = line.startsWith('###') ? 3 : 2;
        const text = line.replace(/^#+\s/, '').trim();
        return {
            id: slugger.slug(text),
            text,
            level,
        };
    });

    const { next, prev } = getAdjacentPosts(resolvedParams.slug);
    const relatedPosts = getRelatedPosts(resolvedParams.slug, post.tags, 3);

    return (
        <article className="post-article">
            <header className="post-header">
                <h1>{post.title}</h1>
                <div className="meta">
                    <span className="meta-date">
                        {post.date}
                    </span>
                    <span className="meta-divider">&middot;</span>
                    <span className="meta-read-time">
                        {post.readingTime}
                    </span>
                </div>
                {post.tags && post.tags.length > 0 && (
                    <div className="tags post-tags">
                        {post.tags.map((tag) => (
                            <Link key={tag} href={`/tags/${tag.toLowerCase()}`} className="tag tag-link">{tag}</Link>
                        ))}
                    </div>
                )}
            </header>

            <div className="post-layout">
                <div className="markdown-content">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw, rehypeHighlight, rehypeSlug]}
                        components={{
                            pre({ children }: any) {
                                return <>{children}</>;
                            },
                            code({ node, inline, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                if (!inline && match) {
                                    return (
                                        <CodeBlock className={className} {...props}>
                                            {children}
                                        </CodeBlock>
                                    );
                                }
                                if (!inline) {
                                    return (
                                        <pre className="markdown-pre">
                                            <code className={className} {...props}>
                                                {children}
                                            </code>
                                        </pre>
                                    );
                                }
                                return (
                                    <code className={className} {...props}>
                                        {children}
                                    </code>
                                );
                            },
                            h2: ({ node, ...props }) => <CopyableHeading level={2} {...props} />,
                            h3: ({ node, ...props }) => <CopyableHeading level={3} {...props} />,
                        }}
                    >
                        {post.content}
                    </ReactMarkdown>

                    <NewsletterCTA />

                    {/* Next / Previous navigation */}
                    <nav className="post-nav" aria-label="Post navigation">
                        {prev ? (
                            <Link href={`/blog/${prev.slug}`} className="post-nav-link post-nav-prev">
                                <ArrowLeft size={18} />
                                <div className="post-nav-text">
                                    <span className="post-nav-label">Previous</span>
                                    <span className="post-nav-title">{prev.title}</span>
                                </div>
                            </Link>
                        ) : <div />}
                        {next ? (
                            <Link href={`/blog/${next.slug}`} className="post-nav-link post-nav-next">
                                <div className="post-nav-text">
                                    <span className="post-nav-label">Next</span>
                                    <span className="post-nav-title">{next.title}</span>
                                </div>
                                <ArrowRight size={18} />
                            </Link>
                        ) : <div />}
                    </nav>

                    <RelatedPosts posts={relatedPosts} />
                </div>

                <aside className="post-sidebar">
                    <TableOfContents headings={headings} />
                </aside>
            </div>
        </article>
    );
}
