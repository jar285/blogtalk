'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Bookmark } from 'lucide-react';

interface BookmarkButtonProps {
  slug: string;
}

export default function BookmarkButton({ slug }: BookmarkButtonProps) {
  const { data: session } = useSession();
  const [bookmarked, setBookmarked] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!session) return;
    fetch(`/api/bookmarks?slug=${encodeURIComponent(slug)}`)
      .then((res) => res.json())
      .then((data) => setBookmarked(data.bookmarked))
      .catch(() => {});
  }, [slug, session]);

  const handleClick = async () => {
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
    >
      <Bookmark
        size={20}
        fill={bookmarked ? 'currentColor' : 'none'}
        strokeWidth={bookmarked ? 0 : 2}
      />
    </button>
  );
}
