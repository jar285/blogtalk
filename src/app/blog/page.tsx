import { getAllPosts, PostData } from '@/lib/markdown';
import Link from 'next/link';

// Helper to format "YYYY-MM-DD" into "Month YYYY" (e.g., February 2026)
function formatMonthYear(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export default function BlogList() {
    const posts = getAllPosts();

    // Group posts by formatted Month+Year
    const groupedPosts = posts.reduce((acc, post) => {
        const monthYear = formatMonthYear(post.date);
        if (!acc[monthYear]) {
            acc[monthYear] = [];
        }
        acc[monthYear].push(post);
        return acc;
    }, {} as Record<string, Omit<PostData, 'content'>[]>);

    return (
        <div>
            <div className="post-header" style={{ marginBottom: '4rem' }}>
                <h1 style={{ fontSize: '3.5rem' }}>The Archive</h1>
                <p className="meta" style={{ fontSize: '1.125rem' }}>
                    A structured collection of thoughts on AI, web architecture, and design.
                </p>
            </div>

            <div className="archive-container">
                {Object.keys(groupedPosts).map((monthYear) => (
                    <section key={monthYear} style={{ marginBottom: '5rem' }}>
                        <h2 style={{
                            fontSize: '2rem',
                            fontWeight: 800,
                            borderBottom: '2px solid var(--glass-border)',
                            paddingBottom: '1rem',
                            marginBottom: '2rem',
                            color: 'var(--accent-color)'
                        }}>
                            {monthYear}
                        </h2>

                        <div className="post-grid" style={{ marginTop: 0 }}>
                            {groupedPosts[monthYear].map((post) => (
                                <Link href={`/blog/${post.slug}`} key={post.slug} className="post-card">
                                    <span className="date">{post.date}</span>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#fff', lineHeight: 1.3 }}>
                                        {post.title}
                                    </h3>
                                    <p>{post.excerpt}</p>
                                    <div className="tags">
                                        {post.tags.map((tag) => (
                                            <span key={tag} className="tag">{tag}</span>
                                        ))}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}
