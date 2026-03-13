import { prisma } from '@/lib/prisma';

const BLOG_PATH_PATTERN = '^/blog/[^/?#]+(/)?([?#].*)?$';

export async function countBlogPageviews(): Promise<number> {
  const rows = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*)::bigint AS count
    FROM "AnalyticsEvent"
    WHERE "eventType" = 'pageview'
      AND "path" ~ ${BLOG_PATH_PATTERN}
  `;

  return Number(rows[0]?.count ?? BigInt(0));
}

export async function countBlogPageviewsBySlug(slug: string): Promise<number> {
  const pathPattern = `^/blog/${slug}(/)?([?#].*)?$`;

  const rows = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*)::bigint AS count
    FROM "AnalyticsEvent"
    WHERE "eventType" = 'pageview'
      AND "path" ~ ${pathPattern}
  `;

  return Number(rows[0]?.count ?? BigInt(0));
}
