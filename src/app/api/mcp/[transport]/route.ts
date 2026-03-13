import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * MCP Server — Exposes analytics query tools to Claude.
 *
 * Uses Vercel's mcp-handler package with the [transport] dynamic segment.
 * Each tool runs a Prisma query against the analytics_events table and
 * returns structured JSON that Claude interprets for the user.
 */

function normalizedAnalyticsFilter(from: Date, to: Date, strictEventTokens = true) {
  const eventTokenFilter = strictEventTokens
    ? Prisma.sql`
        AND (
          LOWER(COALESCE("eventType", '')) IN ('pageview', 'page_view', 'view', 'page-view', 'visit')
          OR LOWER(COALESCE("eventName", '')) IN ('pageview', 'page_view', 'view', 'page-view', 'visit')
          OR LOWER(COALESCE("raw"->>'eventType', '')) IN ('pageview', 'page_view', 'view', 'page-view', 'visit')
          OR LOWER(COALESCE("raw"->>'eventName', '')) IN ('pageview', 'page_view', 'view', 'page-view', 'visit')
        )
      `
    : Prisma.sql``;

  return Prisma.sql`
    "occurredAt" BETWEEN ${from} AND ${to}
    ${eventTokenFilter}
    AND COALESCE("path", '') <> ''
    AND "path" NOT LIKE '/api/%'
    AND "path" NOT LIKE '/_next/%'
    AND "path" NOT LIKE '/admin%'
    AND "path" NOT LIKE '/dashboard%'
  `;
}

const handler = createMcpHandler(
  (server) => {
    // ── Tool 1: Pageviews over a date range ──────────────────────
    server.registerTool(
      'getPageviews',
      {
        title: 'Get Pageviews',
        description:
          'Returns total pageview count for blogtalk over a given date range. ' +
          'Use this when asked about traffic volume, how many visitors, or how busy the site was.',
        inputSchema: {
          from: z.string().describe('ISO 8601 start date, e.g. 2026-03-01'),
          to: z.string().describe('ISO 8601 end date, e.g. 2026-03-12'),
        },
      },
      async ({ from, to }) => {
        const fromDate = new Date(from);
        const toDate = new Date(to);

        let rows = await prisma.$queryRaw<{ count: bigint }[]>`
          SELECT COUNT(*)::bigint AS count
          FROM "AnalyticsEvent"
          WHERE ${normalizedAnalyticsFilter(fromDate, toDate, true)}
        `;

        let count = Number(rows[0]?.count ?? BigInt(0));
        if (count === 0) {
          rows = await prisma.$queryRaw<{ count: bigint }[]>`
            SELECT COUNT(*)::bigint AS count
            FROM "AnalyticsEvent"
            WHERE ${normalizedAnalyticsFilter(fromDate, toDate, false)}
          `;
          count = Number(rows[0]?.count ?? BigInt(0));
        }

        return {
          content: [
            { type: 'text' as const, text: JSON.stringify({ pageviews: count, from, to }) },
          ],
        };
      },
    );

    // ── Tool 2: Top pages ────────────────────────────────────────
    server.registerTool(
      'getTopPages',
      {
        title: 'Get Top Pages',
        description:
          'Returns the most visited pages ranked by pageview count. ' +
          'Use this when asked which posts are popular, what content performs best, or top pages.',
        inputSchema: {
          from: z.string().describe('ISO 8601 start date'),
          to: z.string().describe('ISO 8601 end date'),
          limit: z.number().int().min(1).max(20).default(10).describe('Number of pages to return'),
        },
      },
      async ({ from, to, limit }) => {
        const fromDate = new Date(from);
        const toDate = new Date(to);

        let pages = await prisma.$queryRaw<{ path: string; pageviews: bigint }[]>`
          SELECT path, COUNT(*) AS pageviews
          FROM "AnalyticsEvent"
          WHERE ${normalizedAnalyticsFilter(fromDate, toDate, true)}
          GROUP BY path
          ORDER BY pageviews DESC
          LIMIT ${limit}
        `;

        if (pages.length === 0) {
          pages = await prisma.$queryRaw<{ path: string; pageviews: bigint }[]>`
            SELECT path, COUNT(*) AS pageviews
            FROM "AnalyticsEvent"
            WHERE ${normalizedAnalyticsFilter(fromDate, toDate, false)}
            GROUP BY path
            ORDER BY pageviews DESC
            LIMIT ${limit}
          `;
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                pages: pages.map((p) => ({ path: p.path, pageviews: Number(p.pageviews) })),
              }),
            },
          ],
        };
      },
    );

    // ── Tool 3: Unique sessions (proxy for unique visitors) ──────
    server.registerTool(
      'getUniqueSessions',
      {
        title: 'Get Unique Sessions',
        description:
          'Returns the count of unique session IDs — a proxy for unique visitors. ' +
          'Use this when asked about unique visitors, distinct users, or how many people visited.',
        inputSchema: {
          from: z.string().describe('ISO 8601 start date'),
          to: z.string().describe('ISO 8601 end date'),
        },
      },
      async ({ from, to }) => {
        const fromDate = new Date(from);
        const toDate = new Date(to);

        let result = await prisma.$queryRaw<{ count: bigint }[]>`
          SELECT COUNT(DISTINCT "sessionId") AS count
          FROM "AnalyticsEvent"
          WHERE ${normalizedAnalyticsFilter(fromDate, toDate, true)}
        `;

        let uniqueSessions = Number(result[0]?.count ?? 0);
        if (uniqueSessions === 0) {
          result = await prisma.$queryRaw<{ count: bigint }[]>`
            SELECT COUNT(DISTINCT "sessionId") AS count
            FROM "AnalyticsEvent"
            WHERE ${normalizedAnalyticsFilter(fromDate, toDate, false)}
          `;
          uniqueSessions = Number(result[0]?.count ?? 0);
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                  unique_sessions: uniqueSessions,
                from,
                to,
              }),
            },
          ],
        };
      },
    );

    // ── Tool 4: Traffic sources ──────────────────────────────────
    server.registerTool(
      'getTrafficSources',
      {
        title: 'Get Traffic Sources',
        description:
          'Returns a breakdown of referrer domains driving traffic to the site. ' +
          'Use this when asked where visitors come from, referral sources, or traffic origins.',
        inputSchema: {
          from: z.string().describe('ISO 8601 start date'),
          to: z.string().describe('ISO 8601 end date'),
          limit: z.number().int().min(1).max(20).default(10),
        },
      },
      async ({ from, to, limit }) => {
        const fromDate = new Date(from);
        const toDate = new Date(to);

        let sources = await prisma.$queryRaw<{ referrer: string; pageviews: bigint }[]>`
          SELECT COALESCE(referrer, '(direct)') AS referrer, COUNT(*) AS pageviews
          FROM "AnalyticsEvent"
          WHERE ${normalizedAnalyticsFilter(fromDate, toDate, true)}
          GROUP BY referrer
          ORDER BY pageviews DESC
          LIMIT ${limit}
        `;

        if (sources.length === 0) {
          sources = await prisma.$queryRaw<{ referrer: string; pageviews: bigint }[]>`
            SELECT COALESCE(referrer, '(direct)') AS referrer, COUNT(*) AS pageviews
            FROM "AnalyticsEvent"
            WHERE ${normalizedAnalyticsFilter(fromDate, toDate, false)}
            GROUP BY referrer
            ORDER BY pageviews DESC
            LIMIT ${limit}
          `;
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                sources: sources.map((s) => ({
                  referrer: s.referrer,
                  pageviews: Number(s.pageviews),
                })),
              }),
            },
          ],
        };
      },
    );

    // ── Tool 5: Device breakdown ─────────────────────────────────
    server.registerTool(
      'getDeviceBreakdown',
      {
        title: 'Get Device Breakdown',
        description:
          'Returns counts split by device type: mobile, tablet, desktop. ' +
          'Use this when asked about device usage, mobile vs desktop, or audience device split.',
        inputSchema: {
          from: z.string().describe('ISO 8601 start date'),
          to: z.string().describe('ISO 8601 end date'),
        },
      },
      async ({ from, to }) => {
        const fromDate = new Date(from);
        const toDate = new Date(to);

        let devices = await prisma.$queryRaw<{ device: string; count: bigint }[]>`
          SELECT COALESCE(device, 'unknown') AS device, COUNT(*) AS count
          FROM "AnalyticsEvent"
          WHERE ${normalizedAnalyticsFilter(fromDate, toDate, true)}
          GROUP BY device
          ORDER BY count DESC
        `;

        if (devices.length === 0) {
          devices = await prisma.$queryRaw<{ device: string; count: bigint }[]>`
            SELECT COALESCE(device, 'unknown') AS device, COUNT(*) AS count
            FROM "AnalyticsEvent"
            WHERE ${normalizedAnalyticsFilter(fromDate, toDate, false)}
            GROUP BY device
            ORDER BY count DESC
          `;
        }

        const breakdown: Record<string, number> = {};
        for (const row of devices) {
          breakdown[row.device] = Number(row.count);
        }

        return {
          content: [
            { type: 'text' as const, text: JSON.stringify({ devices: breakdown, from, to }) },
          ],
        };
      },
    );

    // ── Tool 6: Daily pageview trend ─────────────────────────────
    server.registerTool(
      'getDailyTrend',
      {
        title: 'Get Daily Trend',
        description:
          'Returns pageview counts grouped by day for a date range — useful for spotting ' +
          'spikes, drops, or growth patterns. Use this when asked about trends over time.',
        inputSchema: {
          from: z.string().describe('ISO 8601 start date'),
          to: z.string().describe('ISO 8601 end date'),
        },
      },
      async ({ from, to }) => {
        const fromDate = new Date(from);
        const toDate = new Date(to);

        let trend = await prisma.$queryRaw<{ day: Date; pageviews: bigint }[]>`
          SELECT "occurredAt"::date AS day, COUNT(*) AS pageviews
          FROM "AnalyticsEvent"
          WHERE ${normalizedAnalyticsFilter(fromDate, toDate, true)}
          GROUP BY day
          ORDER BY day
        `;

        if (trend.length === 0) {
          trend = await prisma.$queryRaw<{ day: Date; pageviews: bigint }[]>`
            SELECT "occurredAt"::date AS day, COUNT(*) AS pageviews
            FROM "AnalyticsEvent"
            WHERE ${normalizedAnalyticsFilter(fromDate, toDate, false)}
            GROUP BY day
            ORDER BY day
          `;
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                trend: trend.map((t) => ({
                  day: t.day.toISOString().split('T')[0],
                  pageviews: Number(t.pageviews),
                })),
              }),
            },
          ],
        };
      },
    );

    // ── Tool 7: Top liked posts ──────────────────────────────────
    server.registerTool(
      'getTopLikedPosts',
      {
        title: 'Get Top Liked Posts',
        description:
          'Returns the most liked posts ranked by like count. ' +
          'Use this when asked what content gets the most likes or top engagement by likes.',
        inputSchema: {
          limit: z.number().int().min(1).max(20).default(10).describe('Number of posts to return'),
        },
      },
      async ({ limit }) => {
        const liked = await prisma.$queryRaw<{ slug: string; likes: bigint }[]>`
          SELECT slug, COUNT(*) AS likes
          FROM "Like"
          GROUP BY slug
          ORDER BY likes DESC
          LIMIT ${limit}
        `;

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                posts: liked.map((row) => ({
                  slug: row.slug,
                  likes: Number(row.likes),
                })),
              }),
            },
          ],
        };
      },
    );
  },
  {},
  {
    basePath: '/api/mcp',
    maxDuration: 60,
    verboseLogs: process.env.NODE_ENV !== 'production',
  },
);

export { handler as GET, handler as POST };
