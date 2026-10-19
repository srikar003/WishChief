import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { getDb } from '@/server/db';
import { amount, isoDate, notFound, parseBody, withUser } from '@/server/http';
import { wish } from '@/server/schema';

const patch = z.object({
  title: z.string().trim().min(1).max(80).optional(),
  price: amount.optional(),
  priority: z.number().int().min(1).max(3).optional(),
  note: z.string().trim().max(200).optional(),
  countsTowardGoal: z.boolean().optional(),
  status: z.enum(['pending', 'bought']).optional(),
  boughtAt: isoDate.optional(),
});

export const PATCH = withUser(async (userId, request, { id }) => {
  const parsed = await parseBody(request, patch);
  if ('error' in parsed) return parsed.error;
  const { boughtAt, ...rest } = parsed.data;

  const set: Partial<typeof wish.$inferInsert> = { ...rest };
  if (rest.status === 'bought') set.boughtAt = boughtAt ?? new Date().toISOString().slice(0, 10);
  if (rest.status === 'pending') set.boughtAt = null;
  if (Object.keys(set).length === 0) return Response.json({ ok: true });

  const updated = await getDb()
    .update(wish)
    .set(set)
    .where(and(eq(wish.id, id), eq(wish.userId, userId)))
    .returning({ id: wish.id });
  if (updated.length === 0) return notFound();
  return Response.json({ ok: true });
});

export const DELETE = withUser(async (userId, _request, { id }) => {
  const deleted = await getDb()
    .delete(wish)
    .where(and(eq(wish.id, id), eq(wish.userId, userId)))
    .returning({ id: wish.id });
  if (deleted.length === 0) return notFound();
  return Response.json({ ok: true });
});
