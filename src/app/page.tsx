import { getHomeData, getAllPosts } from '@/lib/markdown';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import remarkGfm from 'remark-gfm';

export default function Home() {
  const homeData = getHomeData();
  const recentPosts = getAllPosts().slice(0, 3); // Get top 3 latest posts

  return (
    <div>
      <section className="hero">
        <h1>{homeData.title}</h1>
        <p className="tagline">{homeData.subtitle}</p>
        <p className="tagline" style={{ fontSize: '1.2rem', color: 'var(--accent-color)' }}>
          {homeData.tagline}
        </p>
      </section>

      <section className="glass-card" style={{ padding: '3rem', marginBottom: '4rem' }}>
        <div className="markdown-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{homeData.content}</ReactMarkdown>
        </div>
      </section>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Recent Posts</h2>
          <Link href="/blog" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>
            View All &rarr;
          </Link>
        </div>

        <div className="post-grid">
          {recentPosts.map((post) => (
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
      </section>
    </div>
  );
}
