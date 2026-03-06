import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { createCommentSchema } from '@/lib/validations';

// GET /api/comments?slug=...
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 });
  }

  const comments = await prisma.comment.findMany({
    where: { slug, parentId: null },
    include: {
      author: { select: { id: true, name: true, image: true } },
      replies: {
        include: {
          author: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(comments);
}

// POST /api/comments
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const json = await request.json();
  const parsed = createCommentSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { body, slug, parentId } = parsed.data;

  // If replying, verify parent exists and belongs to same slug
  if (parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: parentId },
    });
    if (!parent || parent.slug !== slug) {
      return NextResponse.json(
        { error: 'Invalid parent comment' },
        { status: 400 }
      );
    }
    // Only allow one level of nesting
    if (parent.parentId) {
      return NextResponse.json(
        { error: 'Cannot reply to a reply' },
        { status: 400 }
      );
    }
  }

  const comment = await prisma.comment.create({
    data: {
      body,
      slug,
      authorId: session.user.id,
      parentId: parentId ?? null,
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
      replies: {
        include: {
          author: { select: { id: true, name: true, image: true } },
        },
      },
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
