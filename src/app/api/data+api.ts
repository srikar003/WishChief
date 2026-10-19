import { asc, desc, eq } from 'drizzle-orm';

import { getDb } from '@/server/db';
import { withUser } from '@/server/http';
import { category, entry, goal, wish } from '@/server/schema';

const DEFAULT_CATEGORIES = ['Mutual Funds', 'Gold', 'Cash', 'Stocks', 'FD', 'Other'];

/** Everything the app needs in one round trip. Seeds default categories on first call. */
export const GET = withUser(async (userId) => {
  const db = getDb();

  let categories = await db
    .select()
    .from(category)
    .where(eq(category.userId, userId))
    .orderBy(asc(category.createdAt), asc(category.name));

  if (categories.length === 0) {
    const base = Date.now();
    await db.insert(category).values(
      DEFAULT_CATEGORIES.map((name, i) => ({
        id: crypto.randomUUID(),
        userId,
        name,
        createdAt: new Date(base + i),
      })),
    );
    categories = await db
      .select()
      .from(category)
      .where(eq(category.userId, userId))
      .orderBy(asc(category.createdAt));
  }

  const [goalRow] = await db.select().from(goal).where(eq(goal.userId, userId));
  const entries = await db
    .select()
    .from(entry)
    .where(eq(entry.userId, userId))
    .orderBy(desc(entry.date), desc(entry.createdAt));
  const wishes = await db
    .select()
    .from(wish)
    .where(eq(wish.userId, userId))
    .orderBy(asc(wish.priority), asc(wish.createdAt));

  return Response.json({
    goal: goalRow
      ? {
          amount: goalRow.amount,
          currency: goalRow.currency,
          monthlyTarget: goalRow.monthlyTarget,
        }
      : null,
    categories: categories.map((c) => ({ id: c.id, name: c.name })),
    entries: entries.map((e) => ({
      id: e.id,
      amount: e.amount,
      categoryId: e.categoryId,
      description: e.description,
      date: e.date,
    })),
    wishes: wishes.map((w) => ({
      id: w.id,
      title: w.title,
      price: w.price,
      priority: w.priority,
      note: w.note,
      countsTowardGoal: w.countsTowardGoal,
      status: w.status,
      boughtAt: w.boughtAt,
    })),
  });
});
