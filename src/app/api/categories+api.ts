import { z } from 'zod';

import { getDb } from '@/server/db';
import { parseBody, withUser } from '@/server/http';
import { category } from '@/server/schema';

const body = z.object({ name: z.string().trim().min(1, 'Enter a name').max(40) });

export const POST = withUser(async (userId, request) => {
  const parsed = await parseBody(request, body);
  if ('error' in parsed) return parsed.error;

  const id = crypto.randomUUID();
  await getDb().insert(category).values({ id, userId, name: parsed.data.name });
  return Response.json({ id, name: parsed.data.name }, { status: 201 });
});
