import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/stats — site-wide statistics (admin only)
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [totalUsers, totalComments, totalLikes, totalBookmarks, totalViews, totalSubscribers, recentUsers] =
      await Promise.all([
        prisma.user.count(),
        prisma.comment.count(),
        prisma.like.count(),
        prisma.bookmark.count(),
        prisma.postView.count(),
        prisma.subscriber.count(),
        prisma.user.count({
          where: {
            sessions: { some: {} },
          },
        }),
      ]);

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
      totalViews,
      totalSubscribers,
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
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
