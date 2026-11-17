# Database Schema Architecture

Finance Tracker utilizes PostgreSQL 16 managed through **Drizzle ORM**. The data model consists of 14 normalized relational tables with strict foreign key constraints, cascade rules, and decimal numeric precision for financial fidelity.

---

## Entity Relationship Overview

```
 users (1) <---+--- (N) wallets (1) <--- (N) wallet_adjustments
               |          |
               |          +------------ (N) wallet_transfers (from/to)
               |          |
               |          +------------ (N) spendings (paid_from)
               |          |
               |          +------------ (N) incomes (wallet_id)
               |
               +--- (N) income_sources (1) <--- (N) incomes
               +--- (N) income_categories (1) <-+
               |
               +--- (N) spending_categories (1) <--- (N) spending_items
               +--- (N) spendings (1) <-------------- (N) spending_items
               |
               +--- (N) budgets
               +--- (1) user_settings
               
 currencies (1) <--- exchange_rates, wallets, incomes, spendings, budgets
```

---

## Tables Reference

### 1. `users`
Stores user identities and authentication hashes.
- `id` (`uuid`, PK): Random UUID.
- `email` (`varchar(255)`, Unique, Not Null): User login email.
- `password_hash` (`text`, Not Null): Argon2id password hash.
- `display_name` (`varchar(100)`, Not Null): User's profile name.
- `created_at` / `updated_at` (`timestamptz`, Not Null).

### 2. `currencies`
Master list of ISO-4217 currencies and crypto identifiers.
- `code` (`varchar(3)`, PK): Currency symbol code (e.g. `USD`, `EUR`, `MAD`).
- `name` (`varchar(50)`, Not Null): Currency display name.
- `symbol` (`varchar(5)`, Not Null): UI symbol (e.g. `$`, `€`, `DH`).
- `decimals` (`smallint`, Not Null, Default `2`): Supported fractional digits.
- `is_base` (`boolean`, Not Null, Default `false`): System base currency flag.
- `updated_at` (`timestamptz`, Not Null).

### 3. `exchange_rates`
Historical and cached foreign exchange rates.
- `id` (`uuid`, PK): Random UUID.
- `base_currency` (`varchar(3)`, FK `currencies.code`): Source currency.
- `target_currency` (`varchar(3)`, FK `currencies.code`): Target currency.
- `rate` (`numeric(18, 6)`, Not Null): Multiplier rate.
- `rate_date` (`date`, Not Null): Date of record.
- `source` (`varchar(50)`, Not Null, Default `open.er-api.com`).
- `created_at` (`timestamptz`, Not Null).
- *Index:* Unique compound index on `(base_currency, target_currency, rate_date)`.

### 4. `wallets`
Physical, digital, and liability asset containers.
- `id` (`uuid`, PK): Random UUID.
- `user_id` (`uuid`, FK `users.id`, ON DELETE CASCADE).
- `name` (`varchar(100)`, Not Null): Wallet title.
- `description` (`text`): Optional description.
- `color` (`varchar(7)`, Default `#3b82f6`): Hex UI color badge.
- `icon` (`varchar(50)`): Lucide icon identifier.
- `type` (`varchar(10)`, Not Null): `'asset'` (Cash, Bank, Savings) or `'liability'` (Credit card, Loan).
- `current_balance` (`numeric(14, 2)`, Not Null, Default `0.00`): Running balance.
- `default_currency` (`varchar(3)`, FK `currencies.code`).
- `status` (`varchar(10)`, Default `active`): `'active'` | `'archived'`.
- `sort_order` (`integer`, Default `0`).
- `created_at` / `updated_at` (`timestamptz`, Not Null).

### 5. `wallet_adjustments`
Audit log of manual balance modifications and exact count reconciliations.
- `id` (`uuid`, PK): Random UUID.
- `wallet_id` (`uuid`, FK `wallets.id`, ON DELETE CASCADE).
- `user_id` (`uuid`, FK `users.id`, ON DELETE CASCADE).
- `adjustment_date` (`date`, Not Null): Effective date.
- `adjustment_type` (`varchar(15)`, Default `delta`):
  - `'delta'`: Additive or subtractive offset.
  - `'reconcile'`: Explicit count override.
- `amount` (`numeric(14, 2)`, Not Null): Offset amount applied.
- `resulting_balance` (`numeric(14, 2)`, Not Null): Balance immediately after adjustment.
- `currency` (`varchar(3)`, FK `currencies.code`).
- `exchange_rate_to_base` (`numeric(18, 6)`, Not Null).
- `base_amount` (`numeric(14, 2)`, Not Null).
- `notes` (`text`): Reason or context.
- `created_at` / `updated_at` (`timestamptz`, Not Null).

### 6. `wallet_transfers`
Inter-wallet money transfers with currency conversion.
- `id` (`uuid`, PK): Random UUID.
- `user_id` (`uuid`, FK `users.id`, ON DELETE CASCADE).
- `from_wallet_id` (`uuid`, FK `wallets.id`, ON DELETE CASCADE).
- `to_wallet_id` (`uuid`, FK `wallets.id`, ON DELETE CASCADE).
- `amount` (`numeric(14, 2)`, Not Null): Amount deducted from source wallet.
- `from_currency` (`varchar(3)`, FK `currencies.code`).
- `target_amount` (`numeric(14, 2)`, Not Null): Amount credited to target wallet.
- `to_currency` (`varchar(3)`, FK `currencies.code`).
- `exchange_rate` (`numeric(18, 6)`, Default `1.000000`).
- `transfer_date` (`date`, Not Null).
- `notes` (`text`): Memo or transfer remarks.
- `created_at` / `updated_at` (`timestamptz`, Not Null).

### 7. `income_sources`
Income originators (e.g., Employer, Freelance Client, Investment Dividends).
- `id` (`uuid`, PK): Random UUID.
- `user_id` (`uuid`, FK `users.id`, ON DELETE CASCADE).
- `title` (`varchar(100)`, Not Null).
- `description` (`text`).
- `color` (`varchar(7)`, Default `#10b981`).
- `status` (`varchar(10)`, Default `active`): `'active'` | `'inactive'`.
- `is_deleted` (`boolean`, Default `false`): Soft delete flag.
- `created_at` / `updated_at` (`timestamptz`, Not Null).

### 8. `income_categories`
Taxonomic categorization for revenues (e.g., Salary, Bonus, Rental).
- `id` (`uuid`, PK): Random UUID.
- `user_id` (`uuid`, FK `users.id`, ON DELETE CASCADE).
- `name` (`varchar(100)`, Not Null).
- `color` (`varchar(7)`, Default `#06b6d4`).
- `icon` (`varchar(50)`).
- `is_deleted` (`boolean`, Default `false`).
- `created_at` / `updated_at` (`timestamptz`, Not Null).

### 9. `incomes`
Individual revenue transactions.
- `id` (`uuid`, PK): Random UUID.
- `user_id` (`uuid`, FK `users.id`, ON DELETE CASCADE).
- `wallet_id` (`uuid`, FK `wallets.id`, ON DELETE SET NULL): Optional wallet automatically credited.
- `date` (`date`, Not Null): Date income was received.
- `source_id` (`uuid`, FK `income_sources.id`).
- `category_id` (`uuid`, FK `income_categories.id`).
- `amount` (`numeric(14, 2)`, Not Null).
- `currency` (`varchar(3)`, FK `currencies.code`).
- `exchange_rate_to_base` (`numeric(18, 6)`, Not Null).
- `base_amount` (`numeric(14, 2)`, Not Null).
- `description` (`varchar(255)`, Not Null).
- `notes` (`text`).
- `is_deleted` (`boolean`, Default `false`).
- `created_at` / `updated_at` (`timestamptz`, Not Null).

### 10. `spending_categories`
Categories for expenditure classification (e.g., Groceries, Housing, Utilities).
- `id` (`uuid`, PK): Random UUID.
- `user_id` (`uuid`, FK `users.id`, ON DELETE CASCADE).
- `name` (`varchar(100)`, Not Null).
- `description` (`text`).
- `color` (`varchar(7)`, Default `#f43f5e`).
- `icon` (`varchar(50)`).
- `is_deleted` (`boolean`, Default `false`).
- `created_at` / `updated_at` (`timestamptz`, Not Null).

### 11. `spendings`
Itemized receipt header record.
- `id` (`uuid`, PK): Random UUID.
- `user_id` (`uuid`, FK `users.id`, ON DELETE CASCADE).
- `date` (`date`, Not Null).
- `paid_from_wallet_id` (`uuid`, FK `wallets.id`, ON DELETE SET NULL): Wallet deducted.
- `store` (`varchar(150)`): Merchant or vendor name.
- `currency` (`varchar(3)`, FK `currencies.code`).
- `exchange_rate_to_base` (`numeric(18, 6)`, Not Null).
- `total_amount` (`numeric(14, 2)`, Not Null): Sum of line items.
- `base_total_amount` (`numeric(14, 2)`, Not Null).
- `notes` (`text`).
- `is_deleted` (`boolean`, Default `false`).
- `created_at` / `updated_at` (`timestamptz`, Not Null).

### 12. `spending_items`
Individual line items itemized within a spending receipt.
- `id` (`uuid`, PK): Random UUID.
- `spending_id` (`uuid`, FK `spendings.id`, ON DELETE CASCADE).
- `category_id` (`uuid`, FK `spending_categories.id`, ON DELETE SET NULL).
- `article_name` (`varchar(150)`, Not Null): Item or service title.
- `unit_price` (`numeric(14, 2)`, Not Null): Unit price per article.
- `quantity` (`numeric(10, 3)`, Default `1.000`): Decimal quantity (supports weighted goods).
- `line_total` (`numeric(14, 2)`, Not Null): Computed as `unit_price * quantity`.
- `base_line_total` (`numeric(14, 2)`, Not Null).
- `created_at` (`timestamptz`, Not Null).

### 13. `budgets`
Unified budget and savings goal engine.
- `id` (`uuid`, PK): Random UUID.
- `user_id` (`uuid`, FK `users.id`, ON DELETE CASCADE).
- `name` (`varchar(100)`, Not Null): Budget or goal title.
- `type` (`varchar(20)`, Not Null):
  - `'spending_limit'`: Category expenditure ceiling.
  - `'saving_goal'`: Target savings accumulation.
- `wallet_id` (`uuid`, FK `wallets.id`, ON DELETE CASCADE): Linked wallet for saving goals.
- `category_id` (`uuid`, FK `spending_categories.id`, ON DELETE SET NULL): Linked category for spending limits.
- `period` (`varchar(10)`, Not Null): `'monthly'` | `'yearly'` | `'custom'`.
- `start_date` (`date`, Not Null).
- `end_date` (`date`).
- `target_amount` (`numeric(14, 2)`, Not Null).
- `currency` (`varchar(3)`, FK `currencies.code`).
- `is_active` (`boolean`, Default `true`).
- `is_deleted` (`boolean`, Default `false`).
- `created_at` / `updated_at` (`timestamptz`, Not Null).

### 14. `user_settings`
User display preferences and global financial configurations.
- `user_id` (`uuid`, PK, FK `users.id`, ON DELETE CASCADE).
- `display_currency` (`varchar(3)`, FK `currencies.code`, Default `'MAD'`).
- `conversion_mode` (`varchar(15)`, Default `'historical'`): `'historical'` vs `'latest'`.
- `exchange_rate_frequency` (`varchar(15)`, Default `'daily'`).
- `theme` (`varchar(10)`, Default `'system'`): `'light'` | `'dark'` | `'system'`.
- `default_spending_wallet_id` (`uuid`, FK `wallets.id`, ON DELETE SET NULL).
- `dashboard_layout` (`jsonb`): Grid configuration for dashboard widgets.
- `updated_at` (`timestamptz`, Not Null).
