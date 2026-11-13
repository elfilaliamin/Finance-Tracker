import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BudgetService } from './budget.service.js';

describe('Budget & Goal Engine Suite', () => {
  it('should compute progress and threshold status for spending limits', async () => {
    const mockRepo = {
      listByUser: async () => [
        {
          id: 'b-1',
          name: 'Groceries Cap',
          type: 'spending_limit',
          period: 'monthly',
          startDate: '2026-05-01',
          endDate: '2026-05-31',
          targetAmount: '2000.00',
          currency: 'MAD',
          isActive: true,
          categoryId: 'cat-1',
          walletId: null,
          category: { id: 'cat-1', name: 'Groceries', color: '#f43f5e' },
        },
      ],
      // 1650 spent out of 2000 -> 82.5% -> warning status
      getSpentInPeriod: async () => '1650.00',
    } as any;

    const service = new BudgetService(mockRepo);
    const [progress] = await service.listBudgetsWithProgress('user-1');

    assert.equal(progress.currentAmount, '1650.00');
    assert.equal(progress.remainingAmount, '350.00');
    assert.equal(progress.percentage, 82.5);
    assert.equal(progress.status, 'warning');
  });

  it('should compute exceeded status when spending surpasses target', async () => {
    const mockRepo = {
      listByUser: async () => [
        {
          id: 'b-2',
          name: 'Entertainment',
          type: 'spending_limit',
          period: 'monthly',
          startDate: '2026-05-01',
          endDate: '2026-05-31',
          targetAmount: '500.00',
          currency: 'MAD',
          isActive: true,
          categoryId: null,
          walletId: null,
        },
      ],
      getSpentInPeriod: async () => '620.00',
    } as any;

    const service = new BudgetService(mockRepo);
    const [progress] = await service.listBudgetsWithProgress('user-1');

    assert.equal(progress.currentAmount, '620.00');
    assert.equal(progress.percentage, 124);
    assert.equal(progress.status, 'exceeded');
  });

  it('should calculate required monthly savings for saving goals with deadline', async () => {
    const mockRepo = {
      listByUser: async () => [
        {
          id: 'g-1',
          name: 'Car Down Payment',
          type: 'saving_goal',
          period: 'custom',
          startDate: '2026-01-01',
          endDate: '2026-12-31', // Future deadline
          targetAmount: '30000.00',
          currency: 'MAD',
          isActive: true,
          walletId: 'w-1',
          wallet: {
            id: 'w-1',
            name: 'Savings',
            currentBalance: '18000.00',
          },
        },
      ],
    } as any;

    const service = new BudgetService(mockRepo);
    const [goal] = await service.listBudgetsWithProgress('user-1');

    assert.equal(goal.currentAmount, '18000.00');
    assert.equal(goal.remainingAmount, '12000.00');
    assert.equal(goal.percentage, 60);
    assert.ok(goal.requiredMonthlySavings !== null);
  });
});

