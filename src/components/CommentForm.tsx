'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface CommentFormProps {
  slug: string;
  parentId?: string;
  onSuccess: () => void;
  onCancel?: () => void;
  placeholder?: string;
}

export default function CommentForm({
  slug,
  parentId,
  onSuccess,
  onCancel,
  placeholder = 'Write a comment…',
}: CommentFormProps) {
  const { data: session } = useSession();
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [error, setError] = useState('');

  if (!session) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    setStatus('submitting');
    setError('');

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: body.trim(), slug, parentId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to post comment');
      }

      setBody('');
      setStatus('idle');
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  };

  const charCount = body.length;
  const isOverLimit = charCount > 2000;

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <textarea
        className="comment-textarea"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        rows={3}
        maxLength={2000}
        disabled={status === 'submitting'}
      />
      <div className="comment-form-footer">
        <span className={`comment-char-count ${isOverLimit ? 'over-limit' : ''}`}>
          {charCount}/2000
        </span>
        <div className="comment-form-actions">
          {onCancel && (
            <button
              type="button"
              className="comment-btn comment-btn-cancel"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="comment-btn comment-btn-submit"
            disabled={!body.trim() || isOverLimit || status === 'submitting'}
          >
            {status === 'submitting' ? 'Posting…' : parentId ? 'Reply' : 'Comment'}
          </button>
        </div>
      </div>
      {error && <p className="comment-error">{error}</p>}
    </form>
  );
}
