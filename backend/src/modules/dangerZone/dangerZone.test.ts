import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DangerZoneService } from './dangerZone.service.js';
import { ValidationError } from '../../errors/AppError.js';

describe('Danger Zone & Workspace Portability Suite', () => {
  const service = new DangerZoneService();

  it('scopedPurge should strictly reject requests with incorrect typed confirmation', async () => {
    await assert.rejects(
      async () => {
        await service.scopedPurge('user-1', 'spending', 'delete all please');
      },
      (err: any) => err instanceof ValidationError && err.message.includes('PERMANENTLY DELETE')
    );
  });

  it('dryRunImport should reject packages with missing or invalid version', async () => {
    await assert.rejects(
      async () => {
        await service.dryRunImport('user-1', { version: '0.0.1' });
      },
      (err: any) => err instanceof ValidationError
    );
  });

  it('dryRunImport should report record counts for valid package', async () => {
    const pkg = {
      version: '1.0.0',
      exportedAt: '2026-05-15T12:00:00Z',
      wallets: [{ id: 'w-1' }],
      incomes: [{ id: 'inc-1' }, { id: 'inc-2' }],
      spendings: [{ id: 'sp-1' }],
    };

    const report = await service.dryRunImport('user-1', pkg);
    assert.equal(report.isValid, true);
    assert.equal(report.summary.walletsCount, 1);
    assert.equal(report.summary.incomesCount, 2);
    assert.equal(report.summary.spendingsCount, 1);
  });
});

