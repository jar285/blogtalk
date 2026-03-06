import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/dashboard — user's bookmarks, comments, likes with stats
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  const [bookmarks, comments, likes, commentCount, likeCount] =
    await Promise.all([
      prisma.bookmark.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.comment.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.like.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.comment.count({ where: { authorId: userId } }),
      prisma.like.count({ where: { userId } }),
    ]);

  return NextResponse.json({
    stats: {
      bookmarks: bookmarks.length,
      comments: commentCount,
      likes: likeCount,
    },
    bookmarks,
    comments,
    likes,
  });
}
