import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/users — list all users with stats (admin only)
export async function GET() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      _count: {
        select: {
          comments: true,
          likes: true,
          bookmarks: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(users);
}

// PATCH /api/admin/users — update user role (admin only)
export async function PATCH(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { userId, role } = await request.json();

  if (!userId || !['user', 'admin'].includes(role)) {
    return NextResponse.json(
      { error: 'Invalid userId or role' },
      { status: 400 }
    );
  }

  // Prevent self-demotion
  if (userId === session.user.id) {
    return NextResponse.json(
      { error: 'Cannot change your own role' },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, name: true, role: true },
  });

  return NextResponse.json(updated);
}
