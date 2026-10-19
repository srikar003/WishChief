import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { getDb } from '@/server/db';
import { amount, badRequest, isoDate, parseBody, withUser } from '@/server/http';
import { category, entry } from '@/server/schema';

const body = z.object({
  amount,
  categoryId: z.string().min(1),
  description: z.string().trim().max(200).default(''),
  date: isoDate,
});

export const POST = withUser(async (userId, request) => {
  const parsed = await parseBody(request, body);
  if ('error' in parsed) return parsed.error;
  const data = parsed.data;
  const db = getDb();

  const [cat] = await db
    .select({ id: category.id })
    .from(category)
    .where(and(eq(category.id, data.categoryId), eq(category.userId, userId)));
  if (!cat) return badRequest('Pick a category');

  const id = crypto.randomUUID();
  await db.insert(entry).values({ id, userId, ...data });
  return Response.json({ id, ...data }, { status: 201 });
});
