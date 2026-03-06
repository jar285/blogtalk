'use client';

import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';

export default function ViewCounter({ slug }: { slug: string }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // Record a view and get the current count
    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    })
      .then((r) => r.json())
      .then((data) => setCount(data.count))
      .catch(() => {
        // Fallback: just fetch count without recording
        fetch(`/api/views?slug=${encodeURIComponent(slug)}`)
          .then((r) => r.json())
          .then((data) => setCount(data.count))
          .catch(console.error);
      });
  }, [slug]);

  if (count === null) return null;

  return (
    <span className="view-counter" title={`${count} view${count !== 1 ? 's' : ''}`}>
      <Eye size={16} />
      {count.toLocaleString()}
    </span>
  );
}
