import { and, eq } from 'drizzle-orm';

import { getDb } from '@/server/db';
import { notFound, withUser } from '@/server/http';
import { entry } from '@/server/schema';

export const DELETE = withUser(async (userId, _request, { id }) => {
  const deleted = await getDb()
    .delete(entry)
    .where(and(eq(entry.id, id), eq(entry.userId, userId)))
    .returning({ id: entry.id });
  if (deleted.length === 0) return notFound();
  return Response.json({ ok: true });
});
