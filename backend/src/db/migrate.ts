import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, client } from './index.js';
import * as schema from './schema.js';
import * as argon2 from '@node-rs/argon2';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { eq } from 'drizzle-orm';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrationsAndSeed() {
  console.log('[Database] Running Drizzle migrations...');
  const migrationsFolder = path.resolve(__dirname, '../../drizzle');
  await migrate(db, { migrationsFolder });
  console.log('[Database] Migrations applied successfully.');

  // Seed Essential Data (Strict Rule 0: No mock data; only functional requirements)
  console.log('[Database] Checking essential seed data...');

  // 1. Currencies (MAD as default base, USD, EUR)
  const existingCurrencies = await db.select().from(schema.currencies);
  if (existingCurrencies.length === 0) {
    console.log('[Database] Seeding supported currencies (MAD, USD, EUR)...');
    await db.insert(schema.currencies).values([
      { code: 'MAD', name: 'Moroccan Dirham', symbol: 'DH', decimals: 2, isBase: true },
      { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2, isBase: false },
      { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2, isBase: false },
    ]);
  }

  // 2. Initial Admin User from environment variables
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@financetracker.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMeImmediately123!';
  const existingAdmin = await db.select().from(schema.users).where(eq(schema.users.email, adminEmail));

  if (existingAdmin.length === 0) {
    console.log(`[Database] Seeding initial admin user (${adminEmail})...`);
    const passwordHash = await argon2.hash(adminPassword);
    const [adminUser] = await db
      .insert(schema.users)
      .values({
        email: adminEmail,
        passwordHash,
        displayName: 'Administrator',
      })
      .returning();

    // Default settings for admin
    await db.insert(schema.userSettings).values({
      userId: adminUser.id,
      displayCurrency: 'MAD',
      conversionMode: 'historical',
      exchangeRateFrequency: 'daily',
      theme: 'system',
    });
  }

  console.log('[Database] Essential seed check complete.');
}

// Allow direct execution
if (process.argv[1] && process.argv[1].endsWith('migrate.ts')) {
  runMigrationsAndSeed()
    .then(async () => {
      await client.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[Database] Migration failed:', err);
      await client.end();
      process.exit(1);
    });
}

