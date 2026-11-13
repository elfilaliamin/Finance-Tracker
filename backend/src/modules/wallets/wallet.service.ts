import { WalletRepository, walletRepository } from './wallet.repository.js';
import { currencyService } from '../currencies/currency.service.js';
import { CreateWalletInput, UpdateWalletInput, CreateAdjustmentInput } from './wallet.schemas.js';
import { NotFoundError } from '../../errors/AppError.js';
import { Money } from '../../utils/money.js';

export class WalletService {
  private readonly repository: WalletRepository;

  constructor(repository: WalletRepository = walletRepository) {
    this.repository = repository;
  }

  async listWallets(userId: string, status?: 'active' | 'archived') {
    return await this.repository.listByUser(userId, status);
  }

  async getWallet(id: string, userId: string) {
    const wallet = await this.repository.findById(id, userId);
    if (!wallet) {
      throw new NotFoundError(`Wallet with ID '${id}' not found.`);
    }
    return wallet;
  }

  async createWallet(userId: string, input: CreateWalletInput) {
    const initialBalanceStr = Money.toDbString(input.initialBalance);
    const wallet = await this.repository.create(userId, {
      name: input.name,
      description: input.description,
      color: input.color,
      icon: input.icon,
      type: input.type,
      currentBalance: initialBalanceStr,
      defaultCurrency: input.defaultCurrency,
      sortOrder: input.sortOrder,
    });

    // If initial balance is non-zero, record an initial balance adjustment
    if (Money.from(input.initialBalance).abs().gt(0)) {
      const today = new Date().toISOString().split('T')[0];
      const rate = await currencyService.getRateForDate(input.defaultCurrency, 'MAD', today);
      const baseAmount = Money.convert(initialBalanceStr, rate);

      await this.repository.recordAdjustment(wallet.id, userId, {
        adjustmentDate: today,
        adjustmentType: 'delta',
        amount: initialBalanceStr,
        resultingBalance: initialBalanceStr,
        currency: input.defaultCurrency,
        exchangeRateToBase: rate,
        baseAmount: Money.toDbString(baseAmount),
        notes: 'Initial starting balance',
      });
    }

    return wallet;
  }

  async updateWallet(id: string, userId: string, input: UpdateWalletInput) {
    const updated = await this.repository.update(id, userId, input);
    if (!updated) {
      throw new NotFoundError(`Wallet with ID '${id}' not found.`);
    }
    return updated;
  }

  async recordAdjustment(walletId: string, userId: string, input: CreateAdjustmentInput) {
    const wallet = await this.getWallet(walletId, userId);
    const currentBalance = Money.from(wallet.currentBalance);

    let delta: string;
    let resultingBalance: string;

    if (input.adjustmentType === 'reconcile') {
      // Amount is the new exact balance; delta is the difference
      const targetBalance = Money.from(input.amount);
      const calculatedDelta = Money.subtract(targetBalance, currentBalance);
      delta = Money.toDbString(calculatedDelta);
      resultingBalance = Money.toDbString(targetBalance);
    } else {
      // Amount is the delta (+ or -)
      const inputDelta = Money.from(input.amount);
      delta = Money.toDbString(inputDelta);
      resultingBalance = Money.toDbString(Money.add(currentBalance, inputDelta));
    }

    // Exchange rate to base currency (MAD)
    const rate = await currencyService.getRateForDate(wallet.defaultCurrency, 'MAD', input.adjustmentDate);
    const baseAmount = Money.toDbString(Money.convert(delta, rate));

    return await this.repository.recordAdjustment(walletId, userId, {
      adjustmentDate: input.adjustmentDate,
      adjustmentType: input.adjustmentType,
      amount: delta,
      resultingBalance,
      currency: wallet.defaultCurrency,
      exchangeRateToBase: rate,
      baseAmount,
      notes: input.notes,
    });
  }

  async listAdjustments(walletId: string, userId: string, from?: string, to?: string) {
    await this.getWallet(walletId, userId);
    return await this.repository.listAdjustments(walletId, userId, from, to);
  }

  async deleteAdjustment(adjustmentId: string, walletId: string, userId: string) {
    const deleted = await this.repository.deleteAdjustment(adjustmentId, walletId, userId);
    if (!deleted) {
      throw new NotFoundError(`Adjustment with ID '${adjustmentId}' not found.`);
    }
  }
}

export const walletService = new WalletService();

