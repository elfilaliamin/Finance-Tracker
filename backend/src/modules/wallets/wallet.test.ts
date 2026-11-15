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

  it('should get transactions history for wallet combining money added and spendings', async () => {
    const mockRepo = {
      findById: async () => ({
        id: 'wallet-1',
        userId: 'user-1',
        name: 'Checking Account',
        currentBalance: '1500.00',
        defaultCurrency: 'MAD',
      }),
      getWalletTransactions: async (wId: string, uId: string, _filters: any) => ({
        wallet: { id: wId, name: 'Checking Account', currentBalance: '1500.00', defaultCurrency: 'MAD' },
        summary: {
          totalAdded: '2000.00',
          totalSpent: '500.00',
          netChange: '1500.00',
          transactionCount: 2,
        },
        transactions: [
          {
            id: 'adj-1',
            source: 'adjustment',
            type: 'deposit',
            direction: 'in',
            title: 'Initial Balance Deposit',
            amount: '2000.00',
            signedAmount: '+2000.00',
            currency: 'MAD',
            date: '2026-05-01',
          },
          {
            id: 'spend-1',
            source: 'spending',
            type: 'spending',
            direction: 'out',
            title: 'Marjane Supermarket',
            amount: '500.00',
            signedAmount: '-500.00',
            currency: 'MAD',
            date: '2026-05-02',
          },
        ],
      }),
    } as any;

    const service = new WalletService(mockRepo);
    const result = await service.getTransactions('wallet-1', 'user-1');

    assert.ok(result);
    assert.equal(result.wallet.id, 'wallet-1');
    assert.equal(result.summary.totalAdded, '2000.00');
    assert.equal(result.summary.totalSpent, '500.00');
    assert.equal(result.transactions.length, 2);
    assert.equal(result.transactions[0].direction, 'in');
    assert.equal(result.transactions[1].direction, 'out');
  });
});
