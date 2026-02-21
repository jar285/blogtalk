import { getHomeData, getAllPosts } from '@/lib/markdown';
import TextReveal from '@/components/TextReveal';
import ParallaxHero from '@/components/ParallaxHero';
import BentoHomepage from '@/components/BentoHomepage';

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

      {recentPosts.length > 0 && (
        <BentoHomepage latestPost={recentPosts[0]} />
      )}
    </div>
  );
}
