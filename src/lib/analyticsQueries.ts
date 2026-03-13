import { prisma } from '@/lib/prisma';

const BLOG_PATH_PATTERN = '^/(blog|posts)/[^/?#]+(/)?([?#].*)?$';

function strictEventTokenClause() {
  return `(
    LOWER(COALESCE("eventType", '')) IN ('pageview', 'page_view', 'view', 'page-view', 'visit')
    OR LOWER(COALESCE("eventName", '')) IN ('pageview', 'page_view', 'view', 'page-view', 'visit')
    OR LOWER(COALESCE("raw"->>'eventType', '')) IN ('pageview', 'page_view', 'view', 'page-view', 'visit')
    OR LOWER(COALESCE("raw"->>'eventName', '')) IN ('pageview', 'page_view', 'view', 'page-view', 'visit')
  )`;
}

function baseExclusionsClause() {
  return `
    "path" NOT LIKE '/api/%'
    AND "path" NOT LIKE '/_next/%'
    AND "path" NOT LIKE '/admin%'
    AND "path" NOT LIKE '/dashboard%'
  `;
}

export async function countBlogPageviews(): Promise<number> {
  const strictQuery = `
    SELECT COUNT(*)::bigint AS count
    FROM "AnalyticsEvent"
    WHERE ${strictEventTokenClause()}
      AND ${baseExclusionsClause()}
      AND "path" ~ $1
  `;

  const fallbackQuery = `
    SELECT COUNT(*)::bigint AS count
    FROM "AnalyticsEvent"
    WHERE ${baseExclusionsClause()}
      AND "path" ~ $1
  `;

  let rows = await prisma.$queryRawUnsafe<{ count: bigint }[]>(strictQuery, BLOG_PATH_PATTERN);
  let count = Number(rows[0]?.count ?? BigInt(0));

  if (count === 0) {
    rows = await prisma.$queryRawUnsafe<{ count: bigint }[]>(fallbackQuery, BLOG_PATH_PATTERN);
    count = Number(rows[0]?.count ?? BigInt(0));
  }

  return count;
}

export async function countBlogPageviewsBySlug(slug: string): Promise<number> {
  const pathPattern = `^/(blog|posts)/${slug}(/)?([?#].*)?$`;

  const strictQuery = `
    SELECT COUNT(*)::bigint AS count
    FROM "AnalyticsEvent"
    WHERE ${strictEventTokenClause()}
      AND ${baseExclusionsClause()}
      AND "path" ~ $1
  `;

  const fallbackQuery = `
    SELECT COUNT(*)::bigint AS count
    FROM "AnalyticsEvent"
    WHERE ${baseExclusionsClause()}
      AND "path" ~ $1
  `;

  let rows = await prisma.$queryRawUnsafe<{ count: bigint }[]>(strictQuery, pathPattern);
  let count = Number(rows[0]?.count ?? BigInt(0));

  if (count === 0) {
    rows = await prisma.$queryRawUnsafe<{ count: bigint }[]>(fallbackQuery, pathPattern);
    count = Number(rows[0]?.count ?? BigInt(0));
  }

  return count;
}
