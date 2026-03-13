import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

/**
 * MCP Server — Exposes analytics query tools to Claude.
 *
 * Uses Vercel's mcp-handler package with the [transport] dynamic segment.
 * Each tool runs a Prisma query against the analytics_events table and
 * returns structured JSON that Claude interprets for the user.
 */

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
        const count = await prisma.analyticsEvent.count({
          where: {
            eventType: 'pageview',
            occurredAt: { gte: new Date(from), lte: new Date(to) },
          },
        });

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
        const pages = await prisma.$queryRaw<{ path: string; pageviews: bigint }[]>`
          SELECT path, COUNT(*) AS pageviews
          FROM "AnalyticsEvent"
          WHERE "eventType" = 'pageview'
            AND "occurredAt" BETWEEN ${new Date(from)} AND ${new Date(to)}
          GROUP BY path
          ORDER BY pageviews DESC
          LIMIT ${limit}
        `;

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
        const result = await prisma.$queryRaw<{ count: bigint }[]>`
          SELECT COUNT(DISTINCT "sessionId") AS count
          FROM "AnalyticsEvent"
          WHERE "eventType" = 'pageview'
            AND "occurredAt" BETWEEN ${new Date(from)} AND ${new Date(to)}
        `;

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                unique_sessions: Number(result[0]?.count ?? 0),
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
        const sources = await prisma.$queryRaw<{ referrer: string; pageviews: bigint }[]>`
          SELECT COALESCE(referrer, '(direct)') AS referrer, COUNT(*) AS pageviews
          FROM "AnalyticsEvent"
          WHERE "eventType" = 'pageview'
            AND "occurredAt" BETWEEN ${new Date(from)} AND ${new Date(to)}
          GROUP BY referrer
          ORDER BY pageviews DESC
          LIMIT ${limit}
        `;

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
        const devices = await prisma.$queryRaw<{ device: string; count: bigint }[]>`
          SELECT COALESCE(device, 'unknown') AS device, COUNT(*) AS count
          FROM "AnalyticsEvent"
          WHERE "eventType" = 'pageview'
            AND "occurredAt" BETWEEN ${new Date(from)} AND ${new Date(to)}
          GROUP BY device
          ORDER BY count DESC
        `;

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
        const trend = await prisma.$queryRaw<{ day: Date; pageviews: bigint }[]>`
          SELECT "occurredAt"::date AS day, COUNT(*) AS pageviews
          FROM "AnalyticsEvent"
          WHERE "eventType" = 'pageview'
            AND "occurredAt" BETWEEN ${new Date(from)} AND ${new Date(to)}
          GROUP BY day
          ORDER BY day
        `;

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
