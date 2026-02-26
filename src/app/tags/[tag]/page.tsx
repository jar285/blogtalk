import { getAllTags, getPostsByTag } from '@/lib/markdown';
import Link from 'next/link';
import TextReveal from '@/components/TextReveal';
import ArchiveList from '@/components/ArchiveList';

export async function generateStaticParams() {
    const tags = getAllTags();
    return tags.map(({ tag }) => ({ tag }));
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
    const { tag } = await params;
    const decodedTag = decodeURIComponent(tag);
    const posts = getPostsByTag(decodedTag);

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingTop: '2rem' }}>
            <div className="post-header" style={{ marginBottom: '3rem', textAlign: 'left' }}>
                <Link
                    href="/tags"
                    style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        marginBottom: '1rem',
                    }}
                >
                    ← All Tags
                </Link>
                <TextReveal
                    as="h1"
                    style={{
                        fontSize: '3.5rem',
                        fontWeight: 800,
                        letterSpacing: '-1px',
                        margin: '0.5rem 0'
                    }}
                >
                    {`#${decodedTag}`}
                </TextReveal>
                <p className="meta" style={{
                    fontSize: '1.1rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6
                }}>
                    {posts.length} {posts.length === 1 ? 'essay' : 'essays'} tagged with &ldquo;{decodedTag}&rdquo;
                </p>
            </div>

            <ArchiveList posts={posts} />
        </div>
    );
}
