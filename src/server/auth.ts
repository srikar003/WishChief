import { expo } from '@better-auth/expo';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { getDb } from './db';
import * as schema from './schema';

type Auth = ReturnType<typeof create>;
let _auth: Auth | null = null;

function create() {
  const googleId = process.env.GOOGLE_CLIENT_ID;
  const googleSecret = process.env.GOOGLE_CLIENT_SECRET;

  return betterAuth({
    database: drizzleAdapter(getDb(), { provider: 'pg', schema }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL ?? process.env.EXPO_PUBLIC_API_URL,
    emailAndPassword: { enabled: true, minPasswordLength: 8 },
    socialProviders:
      googleId && googleSecret
        ? { google: { clientId: googleId, clientSecret: googleSecret } }
        : {},
    plugins: [expo()],
    trustedOrigins: [
      'wishchief://',
      ...(process.env.NODE_ENV !== 'production'
        ? ['exp://', 'exp://**', 'exp://192.168.*.*:*/**', 'exp://10.*.*.*:*/**']
        : []),
    ],
  });
}

/** Lazy so a missing env var surfaces as a clear error on the first request. */
export const getAuth = () => (_auth ??= create());

/** Returns the signed-in user's id, or null. */
export async function getUserId(request: Request): Promise<string | null> {
  const session = await getAuth().api.getSession({ headers: request.headers });
  return session?.user.id ?? null;
}
