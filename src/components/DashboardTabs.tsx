'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Bookmark, MessageSquare } from 'lucide-react';

interface DashboardData {
  stats: { bookmarks: number; comments: number; likes: number };
  bookmarks: { id: string; slug: string; createdAt: string }[];
  comments: { id: string; slug: string; body: string; createdAt: string }[];
  likes: { id: string; slug: string; createdAt: string }[];
}

type Tab = 'overview' | 'bookmarks' | 'comments' | 'likes';

// Map of slug → title, populated from SSR-injected data
interface DashboardTabsProps {
  postTitles: Record<string, string>;
}

export default function DashboardTabs({ postTitles }: DashboardTabsProps) {
  const { data: session } = useSession();
  const [tab, setTab] = useState<Tab>('overview');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getTitle = (slug: string) => postTitles[slug] || slug;

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="comment-skeleton" />
        <div className="comment-skeleton" />
        <div className="comment-skeleton" />
      </div>
    );
  }

  if (!data) {
    return <p className="comment-empty">Failed to load dashboard data.</p>;
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: null },
    { key: 'bookmarks', label: 'Bookmarks', icon: <Bookmark size={16} /> },
    { key: 'comments', label: 'Comments', icon: <MessageSquare size={16} /> },
    { key: 'likes', label: 'Likes', icon: <Heart size={16} /> },
  ];

  return (
    <>
      {/* Profile header */}
      <div className="dashboard-profile">
        {session?.user?.image && (
          <Image
            src={session.user.image}
            alt={session.user.name ?? 'User'}
            width={64}
            height={64}
            className="dashboard-avatar"
            referrerPolicy="no-referrer"
          />
        )}
        <div>
          <h1 className="dashboard-name">{session?.user?.name}</h1>
          <p className="dashboard-email">{session?.user?.email}</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="dashboard-stats">
        <div className="glass-card dashboard-stat-card">
          <MessageSquare size={24} />
          <div>
            <span className="dashboard-stat-number">{data.stats.comments}</span>
            <span className="dashboard-stat-label">Comments</span>
          </div>
        </div>
        <div className="glass-card dashboard-stat-card">
          <Heart size={24} />
          <div>
            <span className="dashboard-stat-number">{data.stats.likes}</span>
            <span className="dashboard-stat-label">Likes</span>
          </div>
        </div>
        <div className="glass-card dashboard-stat-card">
          <Bookmark size={24} />
          <div>
            <span className="dashboard-stat-number">{data.stats.bookmarks}</span>
            <span className="dashboard-stat-label">Bookmarks</span>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="dashboard-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`dashboard-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="dashboard-content">
        {tab === 'overview' && (
          <div className="dashboard-overview">
            <h2>Recent Activity</h2>
            {data.comments.length === 0 &&
              data.likes.length === 0 &&
              data.bookmarks.length === 0 ? (
              <p className="comment-empty">
                No activity yet. Start by reading and engaging with posts!
              </p>
            ) : (
              <div className="dashboard-activity-list">
                {[
                  ...data.comments.slice(0, 5).map((c) => ({
                    type: 'comment' as const,
                    slug: c.slug,
                    text: c.body.slice(0, 100) + (c.body.length > 100 ? '…' : ''),
                    date: c.createdAt,
                  })),
                  ...data.likes.slice(0, 5).map((l) => ({
                    type: 'like' as const,
                    slug: l.slug,
                    text: `Liked "${getTitle(l.slug)}"`,
                    date: l.createdAt,
                  })),
                  ...data.bookmarks.slice(0, 5).map((b) => ({
                    type: 'bookmark' as const,
                    slug: b.slug,
                    text: `Bookmarked "${getTitle(b.slug)}"`,
                    date: b.createdAt,
                  })),
                ]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 10)
                  .map((item, i) => (
                    <Link
                      key={i}
                      href={`/blog/${item.slug}`}
                      className="dashboard-activity-item"
                    >
                      <span className="dashboard-activity-icon">
                        {item.type === 'comment' && <MessageSquare size={16} />}
                        {item.type === 'like' && <Heart size={16} />}
                        {item.type === 'bookmark' && <Bookmark size={16} />}
                      </span>
                      <span className="dashboard-activity-text">{item.text}</span>
                      <span className="dashboard-activity-date">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </Link>
                  ))}
              </div>
            )}
          </div>
        )}

        {tab === 'bookmarks' && (
          <div>
            <h2>Your Bookmarks</h2>
            {data.bookmarks.length === 0 ? (
              <p className="comment-empty">No bookmarks yet.</p>
            ) : (
              <div className="dashboard-list">
                {data.bookmarks.map((b) => (
                  <Link
                    key={b.id}
                    href={`/blog/${b.slug}`}
                    className="dashboard-list-item"
                  >
                    <Bookmark size={16} className="dashboard-list-icon" />
                    <span className="dashboard-list-title">{getTitle(b.slug)}</span>
                    <span className="dashboard-list-date">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'comments' && (
          <div>
            <h2>Your Comments</h2>
            {data.comments.length === 0 ? (
              <p className="comment-empty">No comments yet.</p>
            ) : (
              <div className="dashboard-list">
                {data.comments.map((c) => (
                  <Link
                    key={c.id}
                    href={`/blog/${c.slug}`}
                    className="dashboard-list-item"
                  >
                    <MessageSquare size={16} className="dashboard-list-icon" />
                    <div className="dashboard-comment-preview">
                      <span className="dashboard-list-title">{getTitle(c.slug)}</span>
                      <span className="dashboard-comment-body">
                        {c.body.slice(0, 120)}{c.body.length > 120 ? '…' : ''}
                      </span>
                    </div>
                    <span className="dashboard-list-date">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'likes' && (
          <div>
            <h2>Your Likes</h2>
            {data.likes.length === 0 ? (
              <p className="comment-empty">No likes yet.</p>
            ) : (
              <div className="dashboard-list">
                {data.likes.map((l) => (
                  <Link
                    key={l.id}
                    href={`/blog/${l.slug}`}
                    className="dashboard-list-item"
                  >
                    <Heart size={16} className="dashboard-list-icon" />
                    <span className="dashboard-list-title">{getTitle(l.slug)}</span>
                    <span className="dashboard-list-date">
                      {new Date(l.createdAt).toLocaleDateString()}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
