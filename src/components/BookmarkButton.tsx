'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Bookmark } from 'lucide-react';

interface BookmarkButtonProps {
  slug: string;
}

export default function BookmarkButton({ slug }: BookmarkButtonProps) {
  const { data: session, status } = useSession();
  const [bookmarked, setBookmarked] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [loadingState, setLoadingState] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      setBookmarked(false);
      setLoadError(false);
      setLoadingState(false);
      return;
    }

    let isMounted = true;

    async function loadBookmarkState() {
      setLoadingState(true);
      setLoadError(false);

      const maxAttempts = 2;
      let lastError: unknown = null;

      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
          const res = await fetch(`/api/bookmarks?slug=${encodeURIComponent(slug)}`);
          if (!res.ok) {
            throw new Error(`bookmark fetch failed: ${res.status}`);
          }
          const data = await res.json();

          if (!isMounted) return;

          setBookmarked(data.bookmarked);
          setLoadingState(false);
          return;
        } catch (err) {
          lastError = err;
          if (attempt < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 200 * attempt));
          }
        }
      }

      if (!isMounted) return;

      console.warn('Failed to load bookmark state', { slug, error: lastError });
      setLoadError(true);
      setLoadingState(false);
    }

    loadBookmarkState();

    return () => {
      isMounted = false;
    };
  }, [slug, session, status]);

  const handleClick = async () => {
    if (loadingState || status === 'loading') return;

    if (!session) {
      signIn('google');
      return;
    }

    // Optimistic update
    const was = bookmarked;
    setBookmarked(!was);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);

    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });

      if (res.ok) {
        const data = await res.json();
        setBookmarked(data.bookmarked);
      } else {
        setBookmarked(was);
      }
    } catch {
      setBookmarked(was);
    }
  };

  return (
    <button
      className={`bookmark-button ${bookmarked ? 'bookmarked' : ''} ${animating ? 'bookmark-pop' : ''}`}
      onClick={handleClick}
      aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this post'}
      aria-busy={loadingState}
      disabled={loadingState}
      title={loadError ? 'Bookmark state may be temporarily stale. Try refreshing.' : undefined}
    >
      <Bookmark
        size={20}
        fill={bookmarked ? 'currentColor' : 'none'}
        strokeWidth={bookmarked ? 0 : 2}
      />
    </button>
  );
}
