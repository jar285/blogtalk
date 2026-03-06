import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/views — record a view (anonymous, no auth required)
export async function POST(request: NextRequest) {
  const { slug } = await request.json();

  if (!slug || typeof slug !== 'string') {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 });
  }

  await prisma.postView.create({ data: { slug } });

  const count = await prisma.postView.count({ where: { slug } });

  return NextResponse.json({ count });
}

// GET /api/views?slug=... — get view count for a post
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 });
  }

  const count = await prisma.postView.count({ where: { slug } });

  return NextResponse.json({ count });
}
