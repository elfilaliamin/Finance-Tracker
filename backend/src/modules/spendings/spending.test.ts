import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SpendingService } from './spending.service.js';
import { createSpendingSchema, updateSpendingSchema } from './spending.schemas.js';
import { Money } from '../../utils/money.js';

describe('Spending & Line Items Suite', () => {
  it('createSpendingSchema should validate invoice bill with multiple line items', () => {
    const validBill = {
      date: '2026-05-15',
      paidFromWalletId: '11111111-1111-4111-8111-111111111111',
      store: 'Supermarket Carrefour',
      currency: 'MAD',
      items: [
        {
          articleName: 'Organic Milk 1L',
          unitPrice: 12.5,
          quantity: 2,
        },
        {
          articleName: 'Olive Oil 1L',
          unitPrice: 85,
          quantity: 1,
        },
      ],
    };

    const result = createSpendingSchema.safeParse(validBill);
    assert.equal(result.success, true);
  });

  it('updateSpendingSchema should validate partial update with modified items', () => {
    const updatePayload = {
      storeMerchant: 'Updated Merchant',
      items: [
        {
          name: 'Updated Item',
          unitPrice: 20,
          quantity: 3,
        },
      ],
    };

    const result = updateSpendingSchema.safeParse(updatePayload);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.store, 'Updated Merchant');
      assert.equal(result.data.items?.[0].articleName, 'Updated Item');
    }
  });

  it('SpendingService should calculate line totals and grand totals correctly', async () => {
    let capturedHeader: any = null;
    let capturedItems: any[] = [];

    const mockRepo = {
      create: async (_userId: string, header: any, items: any[]) => {
        capturedHeader = header;
        capturedItems = items;
        return { ...header, id: 'sp-1', items };
      },
    } as any;

    const service = new SpendingService(mockRepo);

    await service.createSpending('user-1', {
      date: '2026-05-15',
      currency: 'MAD',
      items: [
        {
          articleName: 'Item A',
          unitPrice: 15.25,
          quantity: 2,
        },
        {
          articleName: 'Item B',
          unitPrice: 10,
          quantity: 1.5,
        },
      ],
    });

    assert.ok(capturedHeader);
    // Item A: 15.25 * 2 = 30.50
    // Item B: 10.00 * 1.5 = 15.00
    // Grand Total: 30.50 + 15.00 = 45.50
    assert.equal(capturedHeader.totalAmount, '45.50');
    assert.equal(capturedItems.length, 2);
    assert.equal(capturedItems[0].lineTotal, '30.50');
    assert.equal(capturedItems[1].lineTotal, '15.00');
  });
});

