import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

type DbFingerprint = {
  hostMasked: string | null;
  hostHint: string | null;
  dbNameHint: string | null;
};

function mask(value: string, prefix = 4, suffix = 3): string {
  if (value.length <= prefix + suffix) {
    return '*'.repeat(Math.max(value.length, 3));
  }
  return `${value.slice(0, prefix)}***${value.slice(-suffix)}`;
}

function getDbFingerprint(): DbFingerprint {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    return {
      hostMasked: null,
      hostHint: null,
      dbNameHint: null,
    };
  }

  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname || null;
    const dbName = parsed.pathname?.replace(/^\//, '') || null;

    let hostHint: string | null = null;
    if (host) {
      const firstLabel = host.split('.')[0] ?? host;
      hostHint = mask(firstLabel, 3, 2);
    }

    return {
      hostMasked: host ? mask(host, 5, 4) : null,
      hostHint,
      dbNameHint: dbName ? mask(dbName, 3, 2) : null,
    };
  } catch {
    return {
      hostMasked: 'invalid-url',
      hostHint: null,
      dbNameHint: null,
    };
  }
}

function parseDateInput(input: string | null, fallback: Date): Date {
  if (!input) return fallback;
  const parsed = new Date(input);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

// GET /api/admin/analytics-debug — runtime context fingerprint + analytics counters (admin only)
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const now = new Date();
  const defaultFrom = new Date(now);
  defaultFrom.setDate(defaultFrom.getDate() - 90);

  const from = parseDateInput(request.nextUrl.searchParams.get('from'), defaultFrom);
  const to = parseDateInput(request.nextUrl.searchParams.get('to'), now);

  const [runtimeInfoRows, totalsRows, strictRows, relaxedRows, strictTopRows, relaxedTopRows] =
    await Promise.all([
      prisma.$queryRaw<{ current_schema: string; current_database: string }[]>`
        SELECT current_schema() AS current_schema, current_database() AS current_database
      `,
      prisma.$queryRaw<{ total_events: bigint; max_occurred_at: Date | null }[]>`
        SELECT COUNT(*)::bigint AS total_events, MAX("occurredAt") AS max_occurred_at
        FROM "AnalyticsEvent"
      `,
      prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*)::bigint AS count
        FROM "AnalyticsEvent"
        WHERE "occurredAt" BETWEEN ${from} AND ${to}
          AND (
            LOWER(COALESCE("eventType", '')) IN ('pageview', 'page_view', 'view', 'page-view', 'visit')
            OR LOWER(COALESCE("eventName", '')) IN ('pageview', 'page_view', 'view', 'page-view', 'visit')
            OR LOWER(COALESCE("raw"->>'eventType', '')) IN ('pageview', 'page_view', 'view', 'page-view', 'visit')
            OR LOWER(COALESCE("raw"->>'eventName', '')) IN ('pageview', 'page_view', 'view', 'page-view', 'visit')
          )
          AND COALESCE("path", '') <> ''
          AND "path" NOT LIKE '/api/%'
          AND "path" NOT LIKE '/_next/%'
          AND "path" NOT LIKE '/admin%'
          AND "path" NOT LIKE '/dashboard%'
      `,
      prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*)::bigint AS count
        FROM "AnalyticsEvent"
        WHERE "occurredAt" BETWEEN ${from} AND ${to}
          AND COALESCE("path", '') <> ''
          AND "path" NOT LIKE '/api/%'
          AND "path" NOT LIKE '/_next/%'
          AND "path" NOT LIKE '/admin%'
          AND "path" NOT LIKE '/dashboard%'
      `,
      prisma.$queryRaw<{ path: string; views: bigint }[]>`
        SELECT "path", COUNT(*)::bigint AS views
        FROM "AnalyticsEvent"
        WHERE "occurredAt" BETWEEN ${from} AND ${to}
          AND (
            LOWER(COALESCE("eventType", '')) IN ('pageview', 'page_view', 'view', 'page-view', 'visit')
            OR LOWER(COALESCE("eventName", '')) IN ('pageview', 'page_view', 'view', 'page-view', 'visit')
            OR LOWER(COALESCE("raw"->>'eventType', '')) IN ('pageview', 'page_view', 'view', 'page-view', 'visit')
            OR LOWER(COALESCE("raw"->>'eventName', '')) IN ('pageview', 'page_view', 'view', 'page-view', 'visit')
          )
          AND COALESCE("path", '') <> ''
          AND "path" NOT LIKE '/api/%'
          AND "path" NOT LIKE '/_next/%'
          AND "path" NOT LIKE '/admin%'
          AND "path" NOT LIKE '/dashboard%'
        GROUP BY "path"
        ORDER BY views DESC
        LIMIT 10
      `,
      prisma.$queryRaw<{ path: string; views: bigint }[]>`
        SELECT "path", COUNT(*)::bigint AS views
        FROM "AnalyticsEvent"
        WHERE "occurredAt" BETWEEN ${from} AND ${to}
          AND COALESCE("path", '') <> ''
          AND "path" NOT LIKE '/api/%'
          AND "path" NOT LIKE '/_next/%'
          AND "path" NOT LIKE '/admin%'
          AND "path" NOT LIKE '/dashboard%'
        GROUP BY "path"
        ORDER BY views DESC
        LIMIT 10
      `,
    ]);

  const runtimeInfo = runtimeInfoRows[0] ?? {
    current_schema: null,
    current_database: null,
  };
  const totals = totalsRows[0] ?? {
    total_events: BigInt(0),
    max_occurred_at: null,
  };

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      window: {
        from: from.toISOString(),
        to: to.toISOString(),
      },
      runtime: {
        ...runtimeInfo,
        dbFingerprint: getDbFingerprint(),
      },
      analyticsEvent: {
        total: Number(totals.total_events ?? BigInt(0)),
        maxOccurredAt: totals.max_occurred_at ? new Date(totals.max_occurred_at).toISOString() : null,
      },
      mcpParityChecks: {
        strictMatchCount: Number(strictRows[0]?.count ?? BigInt(0)),
        relaxedMatchCount: Number(relaxedRows[0]?.count ?? BigInt(0)),
        strictTopPaths: strictTopRows.map((row) => ({ path: row.path, views: Number(row.views) })),
        relaxedTopPaths: relaxedTopRows.map((row) => ({ path: row.path, views: Number(row.views) })),
      },
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}
