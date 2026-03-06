import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/bookmarks?slug=... — check if current user bookmarked
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ bookmarked: false });
  }

  if (!slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 });
  }

  const bookmark = await prisma.bookmark.findUnique({
    where: { slug_userId: { slug, userId: session.user.id } },
  });

  return NextResponse.json({ bookmarked: !!bookmark });
}

// POST /api/bookmarks — toggle bookmark
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await request.json();

  if (!slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 });
  }

  const existing = await prisma.bookmark.findUnique({
    where: { slug_userId: { slug, userId: session.user.id } },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    return NextResponse.json({ bookmarked: false });
  }

  await prisma.bookmark.create({
    data: { slug, userId: session.user.id },
  });

  return NextResponse.json({ bookmarked: true }, { status: 201 });
}
