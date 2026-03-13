import { NextRequest } from 'next/server';

type RateRecord = {
  count: number;
  resetAt: number;
};

const DEFAULT_WINDOW_MS = 60_000;
const store = new Map<string, RateRecord>();

function cleanupExpiredRecords(now: number) {
  for (const [key, value] of store.entries()) {
    if (value.resetAt <= now) {
      store.delete(key);
    }
  }
}

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  if (realIp) {
    return realIp.trim();
  }

  return 'unknown';
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs = DEFAULT_WINDOW_MS,
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  cleanupExpiredRecords(now);

  const record = store.get(key);

  if (!record || record.resetAt <= now) {
    store.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      allowed: true,
      remaining: Math.max(limit - 1, 0),
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(Math.ceil((record.resetAt - now) / 1000), 1),
    };
  }

  record.count += 1;

  return {
    allowed: true,
    remaining: Math.max(limit - record.count, 0),
    retryAfterSeconds: Math.max(Math.ceil((record.resetAt - now) / 1000), 1),
  };
}
