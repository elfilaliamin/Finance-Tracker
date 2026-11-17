import { IncomeRepository, incomeRepository } from './income.repository.js';
import { incomeSourcesRepository } from '../incomeSources/incomeSources.repository.js';
import { incomeCategoriesRepository } from '../categories/incomeCategories.repository.js';
import { walletRepository } from '../wallets/wallet.repository.js';
import { currencyService } from '../currencies/currency.service.js';
import { CreateIncomeInput, UpdateIncomeInput, IncomeFilterInput } from './income.schemas.js';
import { NotFoundError } from '../../errors/AppError.js';
import { Money } from '../../utils/money.js';

export class IncomeService {
  private readonly repository: IncomeRepository;

  constructor(repository: IncomeRepository = incomeRepository) {
    this.repository = repository;
  }

  async listIncomes(userId: string, filters: IncomeFilterInput) {
    return await this.repository.listByUser(userId, filters);
  }

  async getIncome(id: string, userId: string) {
    const income = await this.repository.findById(id, userId);
    if (!income) {
      throw new NotFoundError(`Income record with ID '${id}' not found.`);
    }
    return income;
  }

  async createIncome(userId: string, input: CreateIncomeInput) {
    // 1. Verify Income Source exists and belongs to user
    const source = await incomeSourcesRepository.findById(input.sourceId, userId);
    if (!source) {
      throw new NotFoundError(`Income source with ID '${input.sourceId}' does not exist.`);
    }

    // 1b. Verify Wallet exists and belongs to user if specified
    if (input.walletId) {
      const wallet = await walletRepository.findById(input.walletId, userId);
      if (!wallet) {
        throw new NotFoundError(`Wallet with ID '${input.walletId}' does not exist.`);
      }
    }

    // 2. Resolve Income Category (use provided, or fall back to user's first category / create General)
    let categoryId = input.categoryId;
    if (categoryId) {
      const category = await incomeCategoriesRepository.findById(categoryId, userId);
      if (!category) {
        throw new NotFoundError(`Income category with ID '${categoryId}' does not exist.`);
      }
    } else {
      const categories = await incomeCategoriesRepository.listByUser(userId);
      if (categories.length > 0) {
        categoryId = categories[0].id;
      } else {
        const defaultCategory = await incomeCategoriesRepository.create(
          userId,
          'General',
          '#10b981',
          'wallet'
        );
        categoryId = defaultCategory.id;
      }
    }

    // 3. Resolve exchange rate to base currency (MAD) on transaction date
    const rate = await currencyService.getRateForDate(input.currency, 'MAD', input.date);
    const amountStr = Money.toDbString(input.amount);
    const baseAmount = Money.toDbString(Money.convert(amountStr, rate));

    const finalDescription = input.description?.trim() || `${source.title || 'Income'} Revenue`;

    return await this.repository.create(userId, {
      date: input.date,
      sourceId: input.sourceId,
      categoryId,
      walletId: input.walletId,
      amount: amountStr,
      currency: input.currency,
      exchangeRateToBase: rate,
      baseAmount,
      description: finalDescription,
      notes: input.notes,
    });
  }

  async updateIncome(id: string, userId: string, input: UpdateIncomeInput) {
    const existing = await this.getIncome(id, userId);

    if (input.sourceId) {
      const source = await incomeSourcesRepository.findById(input.sourceId, userId);
      if (!source) {
        throw new NotFoundError(`Income source with ID '${input.sourceId}' does not exist.`);
      }
    }

    if (input.categoryId) {
      const category = await incomeCategoriesRepository.findById(input.categoryId, userId);
      if (!category) {
        throw new NotFoundError(`Income category with ID '${input.categoryId}' does not exist.`);
      }
    }

    if (input.walletId) {
      const wallet = await walletRepository.findById(input.walletId, userId);
      if (!wallet) {
        throw new NotFoundError(`Wallet with ID '${input.walletId}' does not exist.`);
      }
    }

    const date = input.date || existing.date;
    const currency = input.currency || existing.currency;
    const amount = input.amount !== undefined ? Money.toDbString(input.amount) : existing.amount;

    let exchangeRateToBase = existing.exchangeRateToBase;
    let baseAmount = existing.baseAmount;

    // Recalculate base amount if date, currency or amount changed
    if (input.date || input.currency || input.amount !== undefined) {
      exchangeRateToBase = await currencyService.getRateForDate(currency, 'MAD', date);
      baseAmount = Money.toDbString(Money.convert(amount, exchangeRateToBase));
    }

    const updated = await this.repository.update(id, userId, {
      date: input.date,
      sourceId: input.sourceId,
      categoryId: input.categoryId,
      walletId: input.walletId,
      amount: input.amount !== undefined ? amount : undefined,
      currency: input.currency,
      exchangeRateToBase,
      baseAmount,
      description: input.description,
      notes: input.notes,
    });

    if (!updated) {
      throw new NotFoundError(`Income record with ID '${id}' not found.`);
    }

    return updated;
  }

  async deleteIncome(id: string, userId: string): Promise<void> {
    const deleted = await this.repository.softDelete(id, userId);
    if (!deleted) {
      throw new NotFoundError(`Income record with ID '${id}' not found.`);
    }
  }

  async getAvailableYears(userId: string): Promise<number[]> {
    return await this.repository.getAvailableYears(userId);
  }
}

export const incomeService = new IncomeService();

