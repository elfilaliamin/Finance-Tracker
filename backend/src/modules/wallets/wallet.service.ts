import { WalletRepository, walletRepository } from './wallet.repository.js';
import { currencyService } from '../currencies/currency.service.js';
import {
  CreateWalletInput,
  UpdateWalletInput,
  CreateAdjustmentInput,
  CreateTransferInput,
} from './wallet.schemas.js';
import { NotFoundError, ValidationError } from '../../errors/AppError.js';
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

  async getTransactions(
    walletId: string,
    userId: string,
    filters?: { from?: string; to?: string; type?: string }
  ) {
    await this.getWallet(walletId, userId);
    const result = await this.repository.getWalletTransactions(walletId, userId, filters);
    if (!result) {
      throw new NotFoundError(`Wallet with ID '${walletId}' not found.`);
    }
    return result;
  }

  async transferFunds(userId: string, input: CreateTransferInput) {
    if (input.fromWalletId === input.toWalletId) {
      throw new ValidationError('Source and destination wallets must be different.');
    }

    const fromWallet = await this.getWallet(input.fromWalletId, userId);
    const toWallet = await this.getWallet(input.toWalletId, userId);

    const amountMoney = Money.from(input.amount);
    if (amountMoney.lte(0)) {
      throw new ValidationError('Transfer amount must be greater than zero.');
    }

    // Check sufficient balance if asset account
    const fromBalance = Money.from(fromWallet.currentBalance);
    if (fromWallet.type === 'asset' && fromBalance.lt(amountMoney)) {
      throw new ValidationError(
        `Insufficient funds in source wallet "${fromWallet.name}". Current balance: ${fromWallet.currentBalance} ${fromWallet.defaultCurrency}`
      );
    }

    // Calculate target amount in destination wallet currency
    let exchangeRate = '1.000000';
    let targetAmount = Money.toDbString(amountMoney);

    if (fromWallet.defaultCurrency !== toWallet.defaultCurrency) {
      exchangeRate = await currencyService.getRateForDate(
        fromWallet.defaultCurrency,
        toWallet.defaultCurrency,
        input.transferDate
      );
      const converted = Money.convert(amountMoney, exchangeRate);
      targetAmount = Money.toDbString(converted);
    }

    return await this.repository.recordTransfer(userId, {
      fromWalletId: fromWallet.id,
      toWalletId: toWallet.id,
      amount: Money.toDbString(amountMoney),
      fromCurrency: fromWallet.defaultCurrency,
      targetAmount,
      toCurrency: toWallet.defaultCurrency,
      exchangeRate,
      transferDate: input.transferDate,
      notes: input.notes,
    });
  }

  async deleteTransfer(transferId: string, userId: string) {
    const deleted = await this.repository.deleteTransfer(transferId, userId);
    if (!deleted) {
      throw new NotFoundError(`Transfer with ID '${transferId}' not found.`);
    }
  }
}

export const walletService = new WalletService();

