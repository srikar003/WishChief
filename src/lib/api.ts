import { Platform } from 'react-native';

import type { Entry, Wish } from './calc';
import { authClient } from './auth-client';
import { getBaseUrl } from './base-url';

export type Category = { id: string; name: string };
export type GoalData = { amount: number; currency: string; monthlyTarget: number };
export type AppData = {
  goal: GoalData | null;
  categories: Category[];
  entries: Entry[];
  wishes: Wish[];
};

async function request<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  // Native has no cookie jar; Better Auth's Expo client keeps the session cookie for us.
  const native = Platform.OS !== 'web';
  if (native) headers.Cookie = await authClient.getCookie();

  const res = await fetch(`${getBaseUrl()}${path}`, {
    method: init.method ?? 'GET',
    headers,
    credentials: native ? 'omit' : 'include',
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? `Request failed (${res.status})`);
  return json as T;
}

export const api = {
  data: () => request<AppData>('/api/data'),
  saveGoal: (goal: GoalData) => request('/api/goal', { method: 'PUT', body: goal }),
  addEntry: (e: Omit<Entry, 'id'>) => request('/api/entries', { method: 'POST', body: e }),
  deleteEntry: (id: string) => request(`/api/entries/${id}`, { method: 'DELETE' }),
  addCategory: (name: string) => request('/api/categories', { method: 'POST', body: { name } }),
  addWish: (w: Pick<Wish, 'title' | 'price' | 'priority' | 'note' | 'countsTowardGoal'>) =>
    request('/api/wishes', { method: 'POST', body: w }),
  updateWish: (id: string, patch: Partial<Omit<Wish, 'id' | 'boughtAt'>> & { boughtAt?: string }) =>
    request(`/api/wishes/${id}`, { method: 'PATCH', body: patch }),
  deleteWish: (id: string) => request(`/api/wishes/${id}`, { method: 'DELETE' }),
};
