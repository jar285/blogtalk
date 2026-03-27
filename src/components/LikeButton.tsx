'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Heart } from 'lucide-react';

interface LikeButtonProps {
  slug: string;
}

export default function LikeButton({ slug }: LikeButtonProps) {
  const { data: session, status } = useSession();
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [loadingState, setLoadingState] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadLikes() {
      setLoadingState(true);
      setLoadError(false);

      const maxAttempts = 2;
      let lastError: unknown = null;

      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
          const res = await fetch(`/api/likes?slug=${encodeURIComponent(slug)}`);
          if (!res.ok) {
            throw new Error(`likes fetch failed: ${res.status}`);
          }
          const data = await res.json();

          if (!isMounted) return;

          setCount(data.count);
          setLiked(data.liked);
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

      console.warn('Failed to load like state', { slug, error: lastError });
      setLoadError(true);
      setLoadingState(false);
    }

    loadLikes();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleClick = async () => {
    if (loadingState || status === 'loading') return;

    if (!session) {
      signIn('google');
      return;
    }

    // Optimistic update
    const wasLiked = liked;
    const prevCount = count;
    setLiked(!wasLiked);
    setCount(wasLiked ? count - 1 : count + 1);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);

    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });

      if (res.ok) {
        const data = await res.json();
        setCount(data.count);
        setLiked(data.liked);
      } else {
        // Revert on error
        setLiked(wasLiked);
        setCount(prevCount);
      }
    } catch {
      setLiked(wasLiked);
      setCount(prevCount);
    }
  };

  return (
    <button
      className={`like-button ${liked ? 'liked' : ''} ${animating ? 'like-pop' : ''}`}
      onClick={handleClick}
      aria-label={liked ? 'Unlike this post' : 'Like this post'}
      aria-busy={loadingState}
      disabled={loadingState}
      title={loadError ? 'Like count may be temporarily stale. Try refreshing.' : undefined}
    >
      <Heart
        size={20}
        fill={liked ? 'currentColor' : 'none'}
        strokeWidth={liked ? 0 : 2}
      />
      <span className="like-count">{count}</span>
    </button>
  );
}
