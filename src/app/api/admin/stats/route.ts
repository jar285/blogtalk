import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/stats — site-wide statistics (admin only)
export async function GET() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [totalUsers, totalComments, totalLikes, totalBookmarks, recentUsers] =
    await Promise.all([
      prisma.user.count(),
      prisma.comment.count(),
      prisma.like.count(),
      prisma.bookmark.count(),
      prisma.user.count({
        where: {
          // Users created in the last 7 days
          // Using sessions as a proxy for "recently active"
          sessions: { some: {} },
        },
      }),
    ]);

  // Top posts by engagement (likes + comments)
  const [topLikedSlugs, topCommentedSlugs] = await Promise.all([
    prisma.like.groupBy({
      by: ['slug'],
      _count: { slug: true },
      orderBy: { _count: { slug: 'desc' } },
      take: 5,
    }),
    prisma.comment.groupBy({
      by: ['slug'],
      _count: { slug: true },
      orderBy: { _count: { slug: 'desc' } },
      take: 5,
    }),
  ]);

  return NextResponse.json({
    totalUsers,
    totalComments,
    totalLikes,
    totalBookmarks,
    recentUsers,
    topLikedSlugs: topLikedSlugs.map((s) => ({
      slug: s.slug,
      count: s._count.slug,
    })),
    topCommentedSlugs: topCommentedSlugs.map((s) => ({
      slug: s.slug,
      count: s._count.slug,
    })),
  });
}
