'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import CommentForm from './CommentForm';
import CommentCard, { type CommentData } from './CommentCard';

interface CommentSectionProps {
  slug: string;
}

export default function CommentSection({ slug }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const commentCount = comments.reduce(
    (acc, c) => acc + 1 + (c.replies?.length ?? 0),
    0
  );

  return (
    <section className="comment-section">
      <h2 className="comment-section-title">
        Comments {commentCount > 0 && <span className="comment-count">{commentCount}</span>}
      </h2>

      {session ? (
        <CommentForm slug={slug} onSuccess={fetchComments} />
      ) : (
        <div className="comment-sign-in-prompt glass-card">
          <p>Sign in to join the conversation.</p>
          <button
            className="comment-btn comment-btn-submit"
            onClick={() => signIn('google')}
          >
            Sign in with Google
          </button>
        </div>
      )}

      <div className="comment-list">
        {loading ? (
          <div className="comment-loading">
            <div className="comment-skeleton" />
            <div className="comment-skeleton" />
          </div>
        ) : comments.length === 0 ? (
          <p className="comment-empty">No comments yet. Be the first!</p>
        ) : (
          comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              slug={slug}
              onRefresh={fetchComments}
            />
          ))
        )}
      </div>
    </section>
  );
}
