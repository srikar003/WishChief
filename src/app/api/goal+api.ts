import { z } from 'zod';

import { getDb } from '@/server/db';
import { parseBody, withUser } from '@/server/http';
import { goal } from '@/server/schema';

const body = z.object({
  amount: z.number().finite().positive('Enter a goal above 0').max(1e11),
  currency: z.enum(['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY']),
  monthlyTarget: z.number().finite().min(0).max(1e11),
});

export const PUT = withUser(async (userId, request) => {
  const parsed = await parseBody(request, body);
  if ('error' in parsed) return parsed.error;
  const values = parsed.data;

  await getDb()
    .insert(goal)
    .values({ userId, ...values })
    .onConflictDoUpdate({ target: goal.userId, set: { ...values, updatedAt: new Date() } });

  return Response.json(values);
});
