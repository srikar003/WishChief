import { z } from 'zod';

import { getUserId } from './auth';

export const unauthorized = () => Response.json({ error: 'Not signed in' }, { status: 401 });
export const notFound = () => Response.json({ error: 'Not found' }, { status: 404 });
export const badRequest = (message: string) => Response.json({ error: message }, { status: 400 });

type Params = Record<string, string>;

/** Wraps a handler: requires a session, converts thrown errors to a JSON 500. */
export function withUser(
  handler: (userId: string, request: Request, params: Params) => Promise<Response>,
) {
  return async (request: Request, params: Params = {}) => {
    try {
      const userId = await getUserId(request);
      if (!userId) return unauthorized();
      return await handler(userId, request, params);
    } catch (e) {
      console.error(e);
      const message = e instanceof Error ? e.message : 'Something went wrong';
      return Response.json({ error: message }, { status: 500 });
    }
  };
}

/** Parses a JSON body against a zod schema. Returns data or a 400 Response. */
export async function parseBody<T extends z.ZodType>(
  request: Request,
  schema: T,
): Promise<{ data: z.infer<T> } | { error: Response }> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { error: badRequest('Invalid JSON') };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { error: badRequest(parsed.error.issues[0]?.message ?? 'Invalid input') };
  }
  return { data: parsed.data };
}

export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD');
export const amount = z.number().finite().positive('Enter an amount above 0').max(1e11);
