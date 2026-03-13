import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * Drain Receiver — Vercel Web Analytics pushes events here.
 *
 * Validates the signing secret, normalises the payload shape,
 * and writes rows to the analytics_events table via Prisma.
 *
 * Single responsibility: receive and persist. Nothing else.
 */

function isValidDrainRequest(req: NextRequest): boolean {
  const signature = req.headers.get('x-vercel-signature');
  return signature === process.env.ANALYTICS_DRAIN_SECRET;
}

export async function POST(req: NextRequest) {
  if (!isValidDrainRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Vercel drains send either a single event object or an array
  const events: Record<string, unknown>[] = Array.isArray(payload)
    ? payload
    : [payload];

  if (events.length === 0) {
    return NextResponse.json({ received: 0 });
  }

  try {
    await prisma.analyticsEvent.createMany({
      data: events.map((e) => ({
        eventType:  String(e.eventType ?? 'pageview'),
        eventName:  e.eventName != null ? String(e.eventName) : null,
        path:       String(e.path ?? '/'),
        sessionId:  e.sessionId != null ? BigInt(e.sessionId as number) : null,
        deviceId:   e.deviceId != null ? BigInt(e.deviceId as number) : null,
        country:    e.country != null ? String(e.country) : null,
        city:       e.city != null ? String(e.city) : null,
        device:     e.device != null ? String(e.device) : null,
        browser:    e.browser != null ? String(e.browser) : null,
        referrer:   e.referrer != null ? String(e.referrer) : null,
        occurredAt: e.timestamp
          ? new Date(e.timestamp as number)
          : new Date(),
        raw:        e as unknown as Prisma.InputJsonValue,
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({ received: events.length });
  } catch (error) {
    console.error('[drain] Insert error:', error);
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
  }
}
