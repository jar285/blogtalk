import { z } from 'zod';

export const createCommentSchema = z.object({
  body: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment must be under 2000 characters')
    .trim(),
  slug: z.string().min(1),
  parentId: z.string().optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const slugSchema = z
  .string()
  .trim()
  .min(1, 'Slug is required')
  .max(120, 'Slug is too long')
  .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens');

export const analyticsEventSchema = z
  .object({
    eventType: z.enum(['pageview', 'event']).default('pageview'),
    eventName: z.string().trim().min(1).max(100).optional().nullable(),
    path: z
      .string()
      .trim()
      .min(1)
      .max(500)
      .refine((value) => value.startsWith('/'), 'Path must start with /'),
    timestamp: z.number().int().positive().optional(),
    sessionId: z.coerce.number().int().positive().optional().nullable(),
    deviceId: z.coerce.number().int().positive().optional().nullable(),
    country: z.string().trim().max(3).optional().nullable(),
    city: z.string().trim().max(100).optional().nullable(),
    device: z.enum(['mobile', 'tablet', 'desktop']).optional().nullable(),
    browser: z.string().trim().max(300).optional().nullable(),
    referrer: z.string().trim().max(2048).optional().nullable(),
  })
  .transform((event) => {
    const normalizedPath = event.path.split('?')[0].split('#')[0] || '/';
    return {
      ...event,
      path: normalizedPath,
    };
  });

export type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;
