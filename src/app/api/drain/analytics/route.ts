import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * Analytics Collector — receives pageview events from the client-side hook.
 *
 * Originally designed as a Vercel Drain receiver, repurposed for direct
 * client-side collection since Drains require the Pro plan.
 *
 * Accepts single event objects or arrays. Payload shape matches the
 * Vercel drain format so the AnalyticsEvent schema and MCP tools
 * remain untouched.
 *
 * Left open (no auth) — it only writes pageview data.
 */

export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Accept single event or array
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
    console.error('[analytics] Insert error:', error);
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
  }
}
