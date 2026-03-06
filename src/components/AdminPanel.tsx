'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

/* ── Types ─────────────────────────────────────────────── */
interface AdminStats {
  totalUsers: number;
  totalComments: number;
  totalLikes: number;
  totalBookmarks: number;
  totalViews: number;
  totalSubscribers: number;
  recentUsers: number;
  topLikedSlugs: { slug: string; count: number }[];
  topCommentedSlugs: { slug: string; count: number }[];
}

interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  _count: { comments: number; likes: number; bookmarks: number };
}

interface AdminComment {
  id: string;
  body: string;
  slug: string;
  createdAt: string;
  parentId: string | null;
  author: { id: string; name: string | null; image: string | null; email: string | null };
}

type Tab = 'overview' | 'users' | 'comments';

/* ── Helpers ───────────────────────────────────────────── */
function getTimeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

/* ── Component ─────────────────────────────────────────── */
export default function AdminPanel({
  postTitles,
}: {
  postTitles: Record<string, string>;
}) {
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [commentPage, setCommentPage] = useState(1);
  const [commentTotalPages, setCommentTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [roleUpdating, setRoleUpdating] = useState<string | null>(null);
  const [deletingComment, setDeletingComment] = useState<string | null>(null);

  /* ── Fetch stats ──────────────────────────────────────── */
  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => {
        if (!r.ok) throw new Error(`Stats fetch failed: ${r.status}`);
        return r.json();
      })
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /* ── Fetch users when tab changes ─────────────────────── */
  useEffect(() => {
    if (tab === 'users') {
      fetch('/api/admin/users')
        .then((r) => {
          if (!r.ok) throw new Error(`Users fetch failed: ${r.status}`);
          return r.json();
        })
        .then(setUsers)
        .catch(console.error);
    }
  }, [tab]);

  /* ── Fetch comments when tab/page changes ─────────────── */
  const fetchComments = useCallback((page: number) => {
    fetch(`/api/admin/comments?page=${page}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Comments fetch failed: ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setComments(data.comments);
        setCommentPage(data.page);
        setCommentTotalPages(data.totalPages);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (tab === 'comments') fetchComments(commentPage);
  }, [tab, commentPage, fetchComments]);

  /* ── Role toggle ──────────────────────────────────────── */
  async function toggleRole(userId: string, currentRole: string) {
    setRoleUpdating(userId);
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRoleUpdating(null);
    }
  }

  /* ── Delete comment ───────────────────────────────────── */
  async function deleteComment(id: string) {
    if (!confirm('Delete this comment permanently?')) return;
    setDeletingComment(id);
    try {
      const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingComment(null);
    }
  }

  /* ── Slug → title helper ──────────────────────────────── */
  const titleFor = (slug: string) => postTitles[slug] ?? slug;

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="skeleton-block" style={{ height: '2rem', width: '200px' }} />
          <div className="skeleton-block" style={{ height: '6rem' }} />
          <div className="skeleton-block" style={{ height: '12rem' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header">
        <h1>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
          </svg>
          Admin Panel
        </h1>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {(['overview', 'users', 'comments'] as Tab[]).map((t) => (
          <button
            key={t}
            className={`admin-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'overview' && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
            )}
            {t === 'users' && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            )}
            {t === 'comments' && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            )}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ─── Overview ────────────────────────────────────── */}
      {tab === 'overview' && stats && (
        <div className="admin-content">
          <div className="admin-stats">
            <div className="glass-card admin-stat-card">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              </svg>
              <div>
                <span className="admin-stat-number">{stats.totalUsers}</span>
                <span className="admin-stat-label">Users</span>
              </div>
            </div>
            <div className="glass-card admin-stat-card">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <div>
                <span className="admin-stat-number">{stats.totalComments}</span>
                <span className="admin-stat-label">Comments</span>
              </div>
            </div>
            <div className="glass-card admin-stat-card">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <div>
                <span className="admin-stat-number">{stats.totalLikes}</span>
                <span className="admin-stat-label">Likes</span>
              </div>
            </div>
            <div className="glass-card admin-stat-card">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              <div>
                <span className="admin-stat-number">{stats.totalBookmarks}</span>
                <span className="admin-stat-label">Bookmarks</span>
              </div>
            </div>
          </div>

          {/* Top posts */}
          <div className="admin-top-posts">
            {stats.topLikedSlugs.length > 0 && (
              <div className="glass-card admin-top-section">
                <h3>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  Most Liked Posts
                </h3>
                <ul className="admin-leaderboard">
                  {stats.topLikedSlugs.map((s, i) => (
                    <li key={s.slug}>
                      <span className="admin-rank">#{i + 1}</span>
                      <Link href={`/blog/${s.slug}`} className="admin-post-link">
                        {titleFor(s.slug)}
                      </Link>
                      <span className="admin-count">{s.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {stats.topCommentedSlugs.length > 0 && (
              <div className="glass-card admin-top-section">
                <h3>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Most Commented Posts
                </h3>
                <ul className="admin-leaderboard">
                  {stats.topCommentedSlugs.map((s, i) => (
                    <li key={s.slug}>
                      <span className="admin-rank">#{i + 1}</span>
                      <Link href={`/blog/${s.slug}`} className="admin-post-link">
                        {titleFor(s.slug)}
                      </Link>
                      <span className="admin-count">{s.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Users ───────────────────────────────────────── */}
      {tab === 'users' && (
        <div className="admin-content">
          <div className="admin-user-list">
            {users.map((user) => (
              <div key={user.id} className="glass-card admin-user-card">
                <div className="admin-user-info">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name ?? ''}
                      className="admin-user-avatar"
                    />
                  ) : (
                    <div className="admin-user-avatar-placeholder">
                      {(user.name ?? '?')[0]}
                    </div>
                  )}
                  <div>
                    <span className="admin-user-name">
                      {user.name ?? 'Anonymous'}
                    </span>
                    <span className="admin-user-email">{user.email}</span>
                  </div>
                </div>
                <div className="admin-user-meta">
                  <span className="admin-user-stat" title="Comments">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                    {user._count.comments}
                  </span>
                  <span className="admin-user-stat" title="Likes">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                    {user._count.likes}
                  </span>
                  <span className="admin-user-stat" title="Bookmarks">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                    {user._count.bookmarks}
                  </span>
                  <span className={`admin-role-badge ${user.role}`}>
                    {user.role}
                  </span>
                  <button
                    className="admin-role-toggle"
                    onClick={() => toggleRole(user.id, user.role)}
                    disabled={roleUpdating === user.id}
                    title={user.role === 'admin' ? 'Demote to user' : 'Promote to admin'}
                  >
                    {roleUpdating === user.id ? '...' : user.role === 'admin' ? 'Demote' : 'Promote'}
                  </button>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                No users yet.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ─── Comments ────────────────────────────────────── */}
      {tab === 'comments' && (
        <div className="admin-content">
          <div className="admin-comment-list">
            {comments.map((comment) => (
              <div key={comment.id} className="glass-card admin-comment-card">
                <div className="admin-comment-header">
                  <div className="admin-comment-author">
                    {comment.author.image ? (
                      <img
                        src={comment.author.image}
                        alt={comment.author.name ?? ''}
                        className="admin-comment-avatar"
                      />
                    ) : (
                      <div className="admin-comment-avatar-placeholder">
                        {(comment.author.name ?? '?')[0]}
                      </div>
                    )}
                    <div>
                      <span className="admin-comment-name">
                        {comment.author.name ?? 'Anonymous'}
                      </span>
                      <span className="admin-comment-meta">
                        on <Link href={`/blog/${comment.slug}`}>{titleFor(comment.slug)}</Link>
                        {' · '}{getTimeAgo(comment.createdAt)}
                        {comment.parentId && ' · reply'}
                      </span>
                    </div>
                  </div>
                  <button
                    className="admin-delete-btn"
                    onClick={() => deleteComment(comment.id)}
                    disabled={deletingComment === comment.id}
                    title="Delete comment"
                  >
                    {deletingComment === comment.id ? (
                      '...'
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="admin-comment-body">{comment.body}</p>
              </div>
            ))}
            {comments.length === 0 && (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                No comments yet.
              </p>
            )}
          </div>

          {/* Pagination */}
          {commentTotalPages > 1 && (
            <div className="admin-pagination">
              <button
                disabled={commentPage <= 1}
                onClick={() => setCommentPage((p) => p - 1)}
              >
                ← Prev
              </button>
              <span>
                Page {commentPage} of {commentTotalPages}
              </span>
              <button
                disabled={commentPage >= commentTotalPages}
                onClick={() => setCommentPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
