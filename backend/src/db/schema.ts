import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  date,
  timestamp,
  boolean,
  smallint,
  integer,
  jsonb,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

// 1. Users
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 2. Currencies
export const currencies = pgTable('currencies', {
  code: varchar('code', { length: 3 }).primaryKey(), // USD, EUR, MAD
  name: varchar('name', { length: 50 }).notNull(),
  symbol: varchar('symbol', { length: 5 }).notNull(),
  decimals: smallint('decimals').default(2).notNull(),
  isBase: boolean('is_base').default(false).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 3. Exchange Rates
export const exchangeRates = pgTable(
  'exchange_rates',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    baseCurrency: varchar('base_currency', { length: 3 })
      .notNull()
      .references(() => currencies.code),
    targetCurrency: varchar('target_currency', { length: 3 })
      .notNull()
      .references(() => currencies.code),
    rate: numeric('rate', { precision: 18, scale: 6 }).notNull(),
    rateDate: date('rate_date').notNull(),
    source: varchar('source', { length: 50 }).default('open.er-api.com').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pairDateIdx: uniqueIndex('exchange_rates_pair_date_idx').on(
      table.baseCurrency,
      table.targetCurrency,
      table.rateDate
    ),
  })
);

// 4. Wallets
export const wallets = pgTable(
  'wallets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    color: varchar('color', { length: 7 }).notNull().default('#3b82f6'),
    icon: varchar('icon', { length: 50 }),
    type: varchar('type', { length: 10 }).notNull(), // 'asset' | 'liability'
    currentBalance: numeric('current_balance', { precision: 14, scale: 2 })
      .notNull()
      .default('0.00'),
    defaultCurrency: varchar('default_currency', { length: 3 })
      .notNull()
      .references(() => currencies.code),
    status: varchar('status', { length: 10 }).notNull().default('active'), // 'active' | 'archived'
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('wallets_user_id_idx').on(table.userId),
  })
);

// 5. Wallet Adjustments
export const walletAdjustments = pgTable(
  'wallet_adjustments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    walletId: uuid('wallet_id')
      .notNull()
      .references(() => wallets.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    adjustmentDate: date('adjustment_date').notNull(),
    adjustmentType: varchar('adjustment_type', { length: 15 }).notNull().default('delta'), // 'delta' | 'reconcile'
    amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
    resultingBalance: numeric('resulting_balance', { precision: 14, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 })
      .notNull()
      .references(() => currencies.code),
    exchangeRateToBase: numeric('exchange_rate_to_base', { precision: 18, scale: 6 }).notNull(),
    baseAmount: numeric('base_amount', { precision: 14, scale: 2 }).notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    walletDateIdx: index('wallet_adj_wallet_date_idx').on(table.walletId, table.adjustmentDate),
    dateIdx: index('wallet_adj_date_idx').on(table.adjustmentDate),
  })
);

// 6. Income Sources
export const incomeSources = pgTable('income_sources', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description'),
  color: varchar('color', { length: 7 }).notNull().default('#10b981'),
  status: varchar('status', { length: 10 }).notNull().default('active'), // 'active' | 'inactive'
  isDeleted: boolean('is_deleted').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 7. Income Categories
export const incomeCategories = pgTable('income_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  color: varchar('color', { length: 7 }).notNull().default('#06b6d4'),
  icon: varchar('icon', { length: 50 }),
  isDeleted: boolean('is_deleted').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 8. Incomes (NO WALLET ID)
export const incomes = pgTable(
  'incomes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    sourceId: uuid('source_id')
      .notNull()
      .references(() => incomeSources.id),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => incomeCategories.id),
    amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 })
      .notNull()
      .references(() => currencies.code),
    exchangeRateToBase: numeric('exchange_rate_to_base', { precision: 18, scale: 6 }).notNull(),
    baseAmount: numeric('base_amount', { precision: 14, scale: 2 }).notNull(),
    description: varchar('description', { length: 255 }).notNull(),
    notes: text('notes'),
    isDeleted: boolean('is_deleted').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    dateIdx: index('incomes_date_idx').on(table.date),
    userIdx: index('incomes_user_id_idx').on(table.userId),
    sourceIdx: index('incomes_source_id_idx').on(table.sourceId),
  })
);

// 9. Spending Categories
export const spendingCategories = pgTable('spending_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  color: varchar('color', { length: 7 }).notNull().default('#f43f5e'),
  icon: varchar('icon', { length: 50 }),
  isDeleted: boolean('is_deleted').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 10. Spendings
export const spendings = pgTable(
  'spendings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    paidFromWalletId: uuid('paid_from_wallet_id').references(() => wallets.id, {
      onDelete: 'set null',
    }),
    store: varchar('store', { length: 150 }),
    currency: varchar('currency', { length: 3 })
      .notNull()
      .references(() => currencies.code),
    exchangeRateToBase: numeric('exchange_rate_to_base', { precision: 18, scale: 6 }).notNull(),
    totalAmount: numeric('total_amount', { precision: 14, scale: 2 }).notNull(),
    baseTotalAmount: numeric('base_total_amount', { precision: 14, scale: 2 }).notNull(),
    notes: text('notes'),
    isDeleted: boolean('is_deleted').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    dateIdx: index('spendings_date_idx').on(table.date),
    walletIdx: index('spendings_wallet_id_idx').on(table.paidFromWalletId),
  })
);

// 11. Spending Items
export const spendingItems = pgTable(
  'spending_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    spendingId: uuid('spending_id')
      .notNull()
      .references(() => spendings.id, { onDelete: 'cascade' }),
    categoryId: uuid('category_id').references(() => spendingCategories.id, {
      onDelete: 'set null',
    }),
    articleName: varchar('article_name', { length: 150 }).notNull(),
    unitPrice: numeric('unit_price', { precision: 14, scale: 2 }).notNull(),
    quantity: numeric('quantity', { precision: 10, scale: 3 }).notNull().default('1.000'),
    lineTotal: numeric('line_total', { precision: 14, scale: 2 }).notNull(),
    baseLineTotal: numeric('base_line_total', { precision: 14, scale: 2 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    spendingIdx: index('spending_items_spending_id_idx').on(table.spendingId),
    categoryIdx: index('spending_items_category_id_idx').on(table.categoryId),
  })
);

// 12. Budgets & Goals
export const budgets = pgTable('budgets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'spending_limit' | 'saving_goal'
  walletId: uuid('wallet_id').references(() => wallets.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').references(() => spendingCategories.id, { onDelete: 'set null' }),
  period: varchar('period', { length: 10 }).notNull(), // 'monthly' | 'yearly' | 'custom'
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  targetAmount: numeric('target_amount', { precision: 14, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 })
    .notNull()
    .references(() => currencies.code),
  isActive: boolean('is_active').notNull().default(true),
  isDeleted: boolean('is_deleted').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 13. User Settings
export const userSettings = pgTable('user_settings', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  displayCurrency: varchar('display_currency', { length: 3 })
    .notNull()
    .default('MAD')
    .references(() => currencies.code),
  conversionMode: varchar('conversion_mode', { length: 15 }).notNull().default('historical'), // 'historical' | 'latest'
  exchangeRateFrequency: varchar('exchange_rate_frequency', { length: 15 })
    .notNull()
    .default('daily'),
  theme: varchar('theme', { length: 10 }).notNull().default('system'), // 'light' | 'dark' | 'system'
  defaultSpendingWalletId: uuid('default_spending_wallet_id').references(() => wallets.id, {
    onDelete: 'set null',
  }),
  dashboardLayout: jsonb('dashboard_layout'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
