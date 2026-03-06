'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Heart } from 'lucide-react';

interface LikeButtonProps {
  slug: string;
}

export default function LikeButton({ slug }: LikeButtonProps) {
  const { data: session } = useSession();
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    fetch(`/api/likes?slug=${encodeURIComponent(slug)}`)
      .then((res) => res.json())
      .then((data) => {
        setCount(data.count);
        setLiked(data.liked);
      })
      .catch(() => {});
  }, [slug]);

  const handleClick = async () => {
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
