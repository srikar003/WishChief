import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// ---- Better Auth tables ----

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ---- App tables (every row is scoped by user_id) ----

const money = (name: string) => numeric(name, { precision: 14, scale: 2, mode: 'number' });

export const goal = pgTable('goal', {
  userId: text('user_id')
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  amount: money('amount').notNull(),
  currency: text('currency').notNull().default('USD'),
  monthlyTarget: money('monthly_target').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const category = pgTable(
  'category',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [index('category_user_idx').on(t.userId)],
);

export const entry = pgTable(
  'entry',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    amount: money('amount').notNull(),
    categoryId: text('category_id')
      .notNull()
      .references(() => category.id),
    description: text('description').notNull().default(''),
    date: date('date', { mode: 'string' }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [index('entry_user_date_idx').on(t.userId, t.date)],
);

export const wish = pgTable(
  'wish',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    price: money('price').notNull(),
    priority: integer('priority').notNull().default(2),
    note: text('note').notNull().default(''),
    countsTowardGoal: boolean('counts_toward_goal').notNull().default(false),
    status: text('status', { enum: ['pending', 'bought'] })
      .notNull()
      .default('pending'),
    boughtAt: date('bought_at', { mode: 'string' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [index('wish_user_idx').on(t.userId)],
);
