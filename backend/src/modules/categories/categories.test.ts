import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { IncomeCategoriesService } from './incomeCategories.service.js';
import { SpendingCategoriesService } from './spendingCategories.service.js';
import { IncomeSourcesService } from '../incomeSources/incomeSources.service.js';
import { NotFoundError } from '../../errors/AppError.js';

describe('Categories & Income Sources Unit Suite', () => {
  it('IncomeCategoriesService should throw NotFoundError when category is missing', async () => {
    const mockRepo = {
      findById: async () => null,
      softDelete: async () => false,
    } as any;
    const service = new IncomeCategoriesService(mockRepo);

    await assert.rejects(
      async () => {
        await service.getCategory('missing-id', 'user-1');
      },
      (err: any) => err instanceof NotFoundError
    );
  });

  it('SpendingCategoriesService should successfully create category', async () => {
    const mockRepo = {
      create: async (_userId: string, name: string, color: string) => ({
        id: 'cat-1',
        name,
        color,
      }),
    } as any;
    const service = new SpendingCategoriesService(mockRepo);
    const result = await service.createCategory('user-1', { name: 'Groceries', color: '#f43f5e' });

    assert.equal(result.name, 'Groceries');
    assert.equal(result.color, '#f43f5e');
  });

  it('IncomeSourcesService should soft delete income source and throw if not found', async () => {
    const mockRepo = {
      softDelete: async (id: string) => (id === 'existing-id' ? true : false),
    } as any;
    const service = new IncomeSourcesService(mockRepo);

    // Should succeed for existing
    await service.deleteSource('existing-id', 'user-1');

    // Should throw NotFoundError for non-existing
    await assert.rejects(
      async () => {
        await service.deleteSource('non-existing', 'user-1');
      },
      (err: any) => err instanceof NotFoundError
    );
  });
});

