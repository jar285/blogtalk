import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/likes?slug=... — get like count + whether current user liked
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 });
  }

  const session = await auth();

  const [count, userLike] = await Promise.all([
    prisma.like.count({ where: { slug } }),
    session?.user?.id
      ? prisma.like.findUnique({
          where: { slug_userId: { slug, userId: session.user.id } },
        })
      : null,
  ]);

  return NextResponse.json({ count, liked: !!userLike });
}

// POST /api/likes — toggle like (create or delete)
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await request.json();

  if (!slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 });
  }

  const existing = await prisma.like.findUnique({
    where: { slug_userId: { slug, userId: session.user.id } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    const count = await prisma.like.count({ where: { slug } });
    return NextResponse.json({ count, liked: false });
  }

  await prisma.like.create({
    data: { slug, userId: session.user.id },
  });

  const count = await prisma.like.count({ where: { slug } });
  return NextResponse.json({ count, liked: true }, { status: 201 });
}
