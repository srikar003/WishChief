export type Entry = {
  id: string;
  amount: number;
  categoryId: string;
  description: string;
  date: string; // YYYY-MM-DD
};

export type Wish = {
  id: string;
  title: string;
  price: number;
  priority: number; // 1 high, 2 medium, 3 low
  note: string;
  countsTowardGoal: boolean;
  status: 'pending' | 'bought';
  boughtAt: string | null; // YYYY-MM-DD
};

export type Goal = {
  amount: number;
  currency: string;
  monthlyTarget: number;
};

export const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

export const monthKey = (date: string) => date.slice(0, 7);

export const toMonthKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

export const addMonthsToKey = (key: string, delta: number) => {
  const [y, m] = key.split('-').map(Number);
  const idx = y * 12 + (m - 1) + delta;
  return `${Math.floor(idx / 12)}-${String((idx % 12) + 1).padStart(2, '0')}`;
};

const monthIndex = (key: string) => {
  const [y, m] = key.split('-').map(Number);
  return y * 12 + (m - 1);
};

/** Bought wishes that are consumption (not assets): this money is gone. */
export const consumedWishes = (wishes: Wish[]) =>
  wishes.filter((w) => w.status === 'bought' && !w.countsTowardGoal);

export const totalSaved = (entries: Entry[]) => sum(entries.map((e) => e.amount));

export const spentOnWishes = (wishes: Wish[]) => sum(consumedWishes(wishes).map((w) => w.price));

export const netSaved = (entries: Entry[], wishes: Wish[]) =>
  totalSaved(entries) - spentOnWishes(wishes);

export const remaining = (goal: number, entries: Entry[], wishes: Wish[]) =>
  Math.max(goal - netSaved(entries, wishes), 0);

export const progress = (goal: number, entries: Entry[], wishes: Wish[]) =>
  goal > 0 ? Math.min(Math.max(netSaved(entries, wishes) / goal, 0), 1) : 0;

/** Net change per month: entries added minus consumption wishes bought. */
export const monthlyNet = (entries: Entry[], wishes: Wish[]) => {
  const map = new Map<string, number>();
  for (const e of entries) {
    const k = monthKey(e.date);
    map.set(k, (map.get(k) ?? 0) + e.amount);
  }
  for (const w of consumedWishes(wishes)) {
    if (!w.boughtAt) continue;
    const k = monthKey(w.boughtAt);
    map.set(k, (map.get(k) ?? 0) - w.price);
  }
  return map;
};

/** Gross savings per month (entries only), used for the monthly target. */
export const monthlySaved = (entries: Entry[]) => {
  const map = new Map<string, number>();
  for (const e of entries) {
    const k = monthKey(e.date);
    map.set(k, (map.get(k) ?? 0) + e.amount);
  }
  return map;
};

/** Average net savings per month over up to the last 3 months (including this one). */
export const avgMonthly = (entries: Entry[], wishes: Wish[], now: Date = new Date()) => {
  const net = monthlyNet(entries, wishes);
  if (net.size === 0) return 0;
  const current = toMonthKey(now);
  const first = [...net.keys()].sort()[0];
  const start = Math.max(monthIndex(first), monthIndex(current) - 2);
  const count = monthIndex(current) - start + 1;
  if (count <= 0) return 0;
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += net.get(addMonthsToKey(current, -i)) ?? 0;
  }
  return total / count;
};

export const monthsToGoal = (rem: number, avg: number): number | null => {
  if (rem <= 0) return 0;
  if (avg <= 0) return null;
  return rem / avg;
};

export const etaDate = (months: number | null, now: Date = new Date()): Date | null => {
  if (months === null) return null;
  const d = new Date(now.getFullYear(), now.getMonth(), 1);
  d.setMonth(d.getMonth() + Math.ceil(months));
  return d;
};

export const wishDelayMonths = (price: number, avg: number): number | null =>
  avg > 0 ? price / avg : null;

/** Consecutive months (counting back from now) with savings >= target. */
export const streak = (
  entries: Entry[],
  monthlyTarget: number,
  now: Date = new Date(),
): number => {
  if (monthlyTarget <= 0 || entries.length === 0) return 0;
  const saved = monthlySaved(entries);
  const first = [...saved.keys()].sort()[0];
  const current = toMonthKey(now);
  let key = current;
  let count = 0;
  if ((saved.get(current) ?? 0) >= monthlyTarget) count++;
  key = addMonthsToKey(current, -1);
  while (monthIndex(key) >= monthIndex(first) && (saved.get(key) ?? 0) >= monthlyTarget) {
    count++;
    key = addMonthsToKey(key, -1);
  }
  return count;
};

/** Cumulative net savings by month, oldest first, ending at the current month. */
export const cumulativeSeries = (entries: Entry[], wishes: Wish[], now: Date = new Date()) => {
  const net = monthlyNet(entries, wishes);
  if (net.size === 0) return [] as { month: string; value: number }[];
  const first = [...net.keys()].sort()[0];
  const current = toMonthKey(now);
  const out: { month: string; value: number }[] = [];
  let running = 0;
  for (let i = monthIndex(first); i <= monthIndex(current); i++) {
    const key = addMonthsToKey('0000-01', i);
    running += net.get(key) ?? 0;
    out.push({ month: key, value: running });
  }
  return out;
};

export const byCategory = (entries: Entry[]) => {
  const map = new Map<string, number>();
  for (const e of entries) map.set(e.categoryId, (map.get(e.categoryId) ?? 0) + e.amount);
  return map;
};
