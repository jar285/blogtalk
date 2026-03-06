'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import CommentForm from './CommentForm';

interface Author {
  id: string;
  name: string | null;
  image: string | null;
}

export interface CommentData {
  id: string;
  body: string;
  slug: string;
  authorId: string;
  parentId: string | null;
  createdAt: string;
  author: Author;
  replies?: CommentData[];
}

interface CommentCardProps {
  comment: CommentData;
  slug: string;
  onRefresh: () => void;
  isReply?: boolean;
}

export default function CommentCard({
  comment,
  slug,
  onRefresh,
  isReply = false,
}: CommentCardProps) {
  const { data: session } = useSession();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isAuthor = session?.user?.id === comment.authorId;
  const isAdmin = session?.user?.role === 'admin';
  const canDelete = isAuthor || isAdmin;

  const timeAgo = getTimeAgo(new Date(comment.createdAt));

  const handleDelete = async () => {
    if (!confirm('Delete this comment?')) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/comments/${comment.id}`, {
        method: 'DELETE',
      });
      if (res.ok) onRefresh();
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className={`comment-card ${isReply ? 'comment-reply' : ''}`}>
      <div className="comment-header">
        <div className="comment-author">
          {comment.author.image && (
            <Image
              src={comment.author.image}
              alt={comment.author.name ?? 'User'}
              width={28}
              height={28}
              className="comment-avatar"
              referrerPolicy="no-referrer"
            />
          )}
          <span className="comment-author-name">
            {comment.author.name ?? 'Anonymous'}
          </span>
          <span className="comment-time">{timeAgo}</span>
        </div>
        <div className="comment-actions">
          {!isReply && session && (
            <button
              className="comment-action-btn"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              Reply
            </button>
          )}
          {canDelete && (
            <button
              className="comment-action-btn comment-delete-btn"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? '…' : 'Delete'}
            </button>
          )}
        </div>
      </div>

      <p className="comment-body">{comment.body}</p>

      {showReplyForm && (
        <CommentForm
          slug={slug}
          parentId={comment.id}
          placeholder={`Reply to ${comment.author.name ?? 'Anonymous'}…`}
          onSuccess={() => {
            setShowReplyForm(false);
            onRefresh();
          }}
          onCancel={() => setShowReplyForm(false)}
        />
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies">
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              slug={slug}
              onRefresh={onRefresh}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}
