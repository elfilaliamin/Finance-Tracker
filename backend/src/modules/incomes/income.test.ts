import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createIncomeSchema } from './income.schemas.js';

describe('Income Domain & Wallet Isolation Suite', () => {
  it('createIncomeSchema should strictly reject payloads containing wallet_id', () => {
    const invalidPayloadWithWallet = {
      date: '2026-05-15',
      sourceId: randomUUID(),
      categoryId: randomUUID(),
      amount: 1500,
      currency: 'MAD',
      description: 'Consulting invoice',
      wallet_id: randomUUID(), // FORBIDDEN
    };

    const result = createIncomeSchema.safeParse(invalidPayloadWithWallet);
    assert.equal(result.success, false);
  });

  it('createIncomeSchema should accept valid payload without wallet', () => {
    const validPayload = {
      date: '2026-05-15',
      sourceId: randomUUID(),
      categoryId: randomUUID(),
      amount: 1500,
      currency: 'MAD',
      description: 'Consulting invoice',
    };

    const result = createIncomeSchema.safeParse(validPayload);
    assert.equal(result.success, true);
  });
});
