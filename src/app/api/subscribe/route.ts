import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// POST /api/subscribe — subscribe to the newsletter
export async function POST(request: NextRequest) {
  const json = await request.json();
  const parsed = subscribeSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { email } = parsed.data;

  // Upsert — don't error on duplicate
  await prisma.subscriber.upsert({
    where: { email },
    update: {}, // no-op if already exists
    create: { email },
  });

  return NextResponse.json({ success: true });
}
