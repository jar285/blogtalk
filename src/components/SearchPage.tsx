'use client';

import { useEffect, useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import Link from 'next/link';
import { Search as SearchIcon } from 'lucide-react';

interface SearchPost {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  date: string;
  readingTime: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [posts, setPosts] = useState<SearchPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/search')
      .then((r) => r.json())
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fuse = useMemo(
    () =>
      new Fuse(posts, {
        keys: [
          { name: 'title', weight: 0.4 },
          { name: 'excerpt', weight: 0.3 },
          { name: 'tags', weight: 0.3 },
        ],
        threshold: 0.3,
        includeScore: true,
      }),
    [posts]
  );

  const results = useMemo(() => {
    if (!query.trim()) return posts;
    return fuse.search(query).map((r) => r.item);
  }, [query, fuse, posts]);

  return (
    <div className="search-page">
      <h1>Search</h1>

      <div className="search-input-wrapper">
        <SearchIcon size={18} className="search-input-icon" />
        <input
          type="text"
          placeholder="Search posts by title, excerpt, or tag…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
          autoFocus
        />
      </div>

      {loading ? (
        <div className="search-loading">
          <div className="skeleton-block" style={{ height: '4rem' }} />
          <div className="skeleton-block" style={{ height: '4rem' }} />
          <div className="skeleton-block" style={{ height: '4rem' }} />
        </div>
      ) : (
        <>
          <p className="search-count">
            {query.trim()
              ? `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`
              : `${posts.length} posts`}
          </p>
          <div className="search-results">
            {results.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="glass-card search-result-card"
              >
                <h2 className="search-result-title">{post.title}</h2>
                <p className="search-result-excerpt">{post.excerpt}</p>
                <div className="search-result-meta">
                  <span>{post.date}</span>
                  <span className="meta-divider">·</span>
                  <span>{post.readingTime}</span>
                  {post.tags.length > 0 && (
                    <>
                      <span className="meta-divider">·</span>
                      <span className="search-result-tags">
                        {post.tags.join(', ')}
                      </span>
                    </>
                  )}
                </div>
              </Link>
            ))}
            {results.length === 0 && query.trim() && (
              <p className="search-empty">
                No posts found. Try a different search term.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
