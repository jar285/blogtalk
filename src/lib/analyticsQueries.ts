import { prisma } from '@/lib/prisma';

const BLOG_PATH_PATTERN = '^/(blog|posts)/[^/?#]+(/)?([?#].*)?$';

export async function countBlogPageviews(): Promise<number> {
  const rows = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*)::bigint AS count
    FROM "AnalyticsEvent"
    WHERE (
      LOWER(COALESCE("eventType", '')) IN ('pageview', 'page_view', 'view')
      OR LOWER(COALESCE("eventName", '')) IN ('pageview', 'page_view', 'view')
    )
      AND "path" NOT LIKE '/api/%'
      AND "path" NOT LIKE '/_next/%'
      AND "path" NOT LIKE '/admin%'
      AND "path" NOT LIKE '/dashboard%'
      AND "path" ~ ${BLOG_PATH_PATTERN}
  `;

  return Number(rows[0]?.count ?? BigInt(0));
}

export async function countBlogPageviewsBySlug(slug: string): Promise<number> {
  const pathPattern = `^/(blog|posts)/${slug}(/)?([?#].*)?$`;

  const rows = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*)::bigint AS count
    FROM "AnalyticsEvent"
    WHERE (
      LOWER(COALESCE("eventType", '')) IN ('pageview', 'page_view', 'view')
      OR LOWER(COALESCE("eventName", '')) IN ('pageview', 'page_view', 'view')
    )
      AND "path" NOT LIKE '/api/%'
      AND "path" NOT LIKE '/_next/%'
      AND "path" NOT LIKE '/admin%'
      AND "path" NOT LIKE '/dashboard%'
      AND "path" ~ ${pathPattern}
  `;

  return Number(rows[0]?.count ?? BigInt(0));
}
