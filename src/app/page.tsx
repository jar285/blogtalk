import { getHomeData, getAllPosts } from '@/lib/markdown';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import remarkGfm from 'remark-gfm';
import TextReveal from '@/components/TextReveal';
import ParallaxHero from '@/components/ParallaxHero';

export default function Home() {
  const homeData = getHomeData();
  const recentPosts = getAllPosts().slice(0, 3);

  return (
    <div>
      <ParallaxHero>
        <TextReveal as="h1">{homeData.title}</TextReveal>
        <TextReveal as="p" className="tagline" delay={0.2} stagger={0.03}>{homeData.subtitle}</TextReveal>
        <TextReveal as="p" className="tagline" style={{ fontSize: '1.2rem', color: 'var(--accent-color)' }} delay={0.4} stagger={0.03}>
          {homeData.tagline}
        </TextReveal>
      </ParallaxHero>

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
