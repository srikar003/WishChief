import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from './schema';

let _db: ReturnType<typeof create> | null = null;

function create() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
  return drizzle(neon(url), { schema });
}

/** Lazy so that importing this file never fails before env vars are loaded. */
export const getDb = () => (_db ??= create());
