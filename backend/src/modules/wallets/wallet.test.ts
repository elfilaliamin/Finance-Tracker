import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { WalletService } from './wallet.service.js';
import { Money } from '../../utils/money.js';

describe('Wallet & Balance Adjustment Suite', () => {
  it('should calculate correct delta and resulting balance in delta mode (+)', async () => {
    const mockRepo = {
      findById: async () => ({
        id: 'wallet-1',
        userId: 'user-1',
        name: 'Checking',
        currentBalance: '1000.00',
        defaultCurrency: 'MAD',
      }),
      recordAdjustment: async (_wId: string, _uId: string, data: any) => ({
        wallet: { currentBalance: data.resultingBalance },
        adjustment: data,
      }),
    } as any;

    const service = new WalletService(mockRepo);
    const result = await service.recordAdjustment('wallet-1', 'user-1', {
      adjustmentDate: '2026-05-15',
      adjustmentType: 'delta',
      amount: 250,
      notes: 'Deposit',
    });

    assert.equal(result.adjustment.amount, '250.00');
    assert.equal(result.adjustment.resultingBalance, '1250.00');
  });

  it('should calculate correct delta and resulting balance in delta mode (-)', async () => {
    const mockRepo = {
      findById: async () => ({
        id: 'wallet-1',
        userId: 'user-1',
        name: 'Cash',
        currentBalance: '500.00',
        defaultCurrency: 'MAD',
      }),
      recordAdjustment: async (_wId: string, _uId: string, data: any) => ({
        wallet: { currentBalance: data.resultingBalance },
        adjustment: data,
      }),
    } as any;

    const service = new WalletService(mockRepo);
    const result = await service.recordAdjustment('wallet-1', 'user-1', {
      adjustmentDate: '2026-05-15',
      adjustmentType: 'delta',
      amount: -120,
      notes: 'Cash spent offline',
    });

    assert.equal(result.adjustment.amount, '-120.00');
    assert.equal(result.adjustment.resultingBalance, '380.00');
  });

  it('should calculate correct delta in reconcile mode to reach exact target balance', async () => {
    const mockRepo = {
      findById: async () => ({
        id: 'wallet-1',
        userId: 'user-1',
        name: 'Bank',
        currentBalance: '4820.50',
        defaultCurrency: 'MAD',
      }),
      recordAdjustment: async (_wId: string, _uId: string, data: any) => ({
        wallet: { currentBalance: data.resultingBalance },
        adjustment: data,
      }),
    } as any;

    const service = new WalletService(mockRepo);
    // User counts 5000.00 DH in account -> delta should be +179.50 DH
    const result = await service.recordAdjustment('wallet-1', 'user-1', {
      adjustmentDate: '2026-05-15',
      adjustmentType: 'reconcile',
      amount: 5000,
      notes: 'Monthly bank statement check',
    });

    assert.equal(result.adjustment.amount, '179.50');
    assert.equal(result.adjustment.resultingBalance, '5000.00');
  });
});
