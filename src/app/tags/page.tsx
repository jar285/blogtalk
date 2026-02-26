import { getAllTags } from '@/lib/markdown';
import Link from 'next/link';
import TextReveal from '@/components/TextReveal';

export default function TagsIndexPage() {
    const tags = getAllTags();

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '2rem' }}>
            <div className="post-header" style={{ marginBottom: '3rem', textAlign: 'left' }}>
                <span style={{
                    color: '#d97706',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    letterSpacing: '1px',
                    textTransform: 'uppercase'
                }}>
                    Browse by Topic
                </span>
                <TextReveal
                    as="h1"
                    style={{
                        fontSize: '4rem',
                        fontWeight: 800,
                        letterSpacing: '-1px',
                        margin: '0.5rem 0'
                    }}
                >
                    All Tags
                </TextReveal>
                <p className="meta" style={{
                    fontSize: '1.1rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6
                }}>
                    {tags.length} topics across the blog. Sorted by post count.
                </p>
            </div>

            <div className="tags-index-grid">
                {tags.map(({ tag, count }) => (
                    <Link
                        key={tag}
                        href={`/tags/${tag}`}
                        className="tags-index-card"
                    >
                        <span className="tags-index-name">{tag}</span>
                        <span className="tags-index-count">
                            {count} {count === 1 ? 'post' : 'posts'}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
