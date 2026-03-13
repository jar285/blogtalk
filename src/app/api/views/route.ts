import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/rateLimiter';
import { slugSchema } from '@/lib/validations';
import { countBlogPageviewsBySlug } from '@/lib/analyticsQueries';

// POST /api/views — record a view (anonymous, no auth required)
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`views:${ip}`, 240);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rate.retryAfterSeconds),
        },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsedSlug = slugSchema.safeParse((body as { slug?: unknown })?.slug);
  if (!parsedSlug.success) {
    return NextResponse.json({ error: parsedSlug.error.issues[0]?.message ?? 'Invalid slug' }, { status: 400 });
  }

  const slug = parsedSlug.data;

  // Keep legacy writes during reconciliation period.
  await prisma.postView.create({ data: { slug } });

  const [count, legacyCount] = await Promise.all([
    countBlogPageviewsBySlug(slug),
    prisma.postView.count({ where: { slug } }),
  ]);

  return NextResponse.json({
    count,
    legacyCount,
    source: 'analyticsEvent',
    reconciliation: {
      delta: count - legacyCount,
    },
  });
}

// GET /api/views?slug=... — get view count for a post
export async function GET(request: NextRequest) {
  const rawSlug = request.nextUrl.searchParams.get('slug');
  const parsedSlug = slugSchema.safeParse(rawSlug);

  if (!parsedSlug.success) {
    return NextResponse.json({ error: parsedSlug.error.issues[0]?.message ?? 'Invalid slug' }, { status: 400 });
  }

  const slug = parsedSlug.data;
  const [count, legacyCount] = await Promise.all([
    countBlogPageviewsBySlug(slug),
    prisma.postView.count({ where: { slug } }),
  ]);

  return NextResponse.json({
    count,
    legacyCount,
    source: 'analyticsEvent',
    reconciliation: {
      delta: count - legacyCount,
    },
  });
}
