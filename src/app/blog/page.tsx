import { getAllPosts } from '@/lib/markdown';
import ArchiveList from '@/components/ArchiveList';
import TextReveal from '@/components/TextReveal';

export default function BlogPage() {
    // Fetched server-side at build time using Node fs
    const posts = getAllPosts();

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingTop: '2rem' }}>
            <div className="post-header" style={{ marginBottom: '4rem', textAlign: 'left' }}>
                <span style={{
                    color: '#d97706',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    letterSpacing: '1px',
                    textTransform: 'uppercase'
                }}>
                    Archive
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
                    All Essays
                </TextReveal>
                <p className="meta" style={{
                    fontSize: '1.25rem',
                    color: 'var(--text-secondary)',
                    maxWidth: '800px',
                    lineHeight: 1.6
                }}>
                    Long-form writing on technology, philosophy, and the craft of building things that matter.
                </p>
            </div>

            {/* Client component handles the stagger animations and list UI */}
            <ArchiveList posts={posts} />
        </div>
    );
}
