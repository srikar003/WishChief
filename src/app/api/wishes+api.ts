import { z } from 'zod';

import { getDb } from '@/server/db';
import { amount, parseBody, withUser } from '@/server/http';
import { wish } from '@/server/schema';

const body = z.object({
  title: z.string().trim().min(1, 'Enter a name').max(80),
  price: amount,
  priority: z.number().int().min(1).max(3).default(2),
  note: z.string().trim().max(200).default(''),
  countsTowardGoal: z.boolean().default(false),
});

export const POST = withUser(async (userId, request) => {
  const parsed = await parseBody(request, body);
  if ('error' in parsed) return parsed.error;

  const id = crypto.randomUUID();
  await getDb().insert(wish).values({ id, userId, ...parsed.data });
  return Response.json({ id, ...parsed.data, status: 'pending', boughtAt: null }, { status: 201 });
});
