import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { analyticsEventSchema } from '@/lib/validations';
import { checkRateLimit, getClientIp } from '@/lib/rateLimiter';

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
  const ip = getClientIp(req);
  const rate = checkRateLimit(`analytics:${ip}`, 120);
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

  if (events.length > 100) {
    return NextResponse.json({ error: 'Too many events in one request' }, { status: 413 });
  }

  if (events.length === 0) {
    return NextResponse.json({ received: 0 });
  }

  const nowMs = Date.now();
  const maxFutureSkewMs = 5 * 60 * 1000;
  const minTimestampMs = Date.UTC(2020, 0, 1);

  const parsedEvents = events
    .map((rawEvent) => analyticsEventSchema.safeParse(rawEvent))
    .filter((result): result is { success: true; data: ReturnType<typeof analyticsEventSchema.parse> } => result.success)
    .map((result) => result.data)
    .filter((event) => {
      if (!event.timestamp) {
        return true;
      }
      return event.timestamp >= minTimestampMs && event.timestamp <= nowMs + maxFutureSkewMs;
    });

  if (parsedEvents.length === 0) {
    return NextResponse.json({ error: 'No valid events' }, { status: 400 });
  }

  try {
    await prisma.analyticsEvent.createMany({
      data: parsedEvents.map((event) => ({
        eventType: event.eventType,
        eventName: event.eventName ?? null,
        path: event.path,
        sessionId: event.sessionId != null ? BigInt(event.sessionId) : null,
        deviceId: event.deviceId != null ? BigInt(event.deviceId) : null,
        country: event.country ?? null,
        city: event.city ?? null,
        device: event.device ?? null,
        browser: event.browser ?? null,
        referrer: event.referrer ?? null,
        occurredAt: event.timestamp
          ? new Date(event.timestamp)
          : new Date(),
        raw: event as unknown as Prisma.InputJsonValue,
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({
      received: parsedEvents.length,
      rejected: events.length - parsedEvents.length,
    });
  } catch (error) {
    console.error('[analytics] Insert error:', error);
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
  }
}
