import { IncomeRepository, incomeRepository } from './income.repository.js';
import { incomeSourcesRepository } from '../incomeSources/incomeSources.repository.js';
import { incomeCategoriesRepository } from '../categories/incomeCategories.repository.js';
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

    // 2. Verify Income Category exists and belongs to user
    const category = await incomeCategoriesRepository.findById(input.categoryId, userId);
    if (!category) {
      throw new NotFoundError(`Income category with ID '${input.categoryId}' does not exist.`);
    }

    // 3. Resolve exchange rate to base currency (MAD) on transaction date
    const rate = await currencyService.getRateForDate(input.currency, 'MAD', input.date);
    const amountStr = Money.toDbString(input.amount);
    const baseAmount = Money.toDbString(Money.convert(amountStr, rate));

    return await this.repository.create(userId, {
      date: input.date,
      sourceId: input.sourceId,
      categoryId: input.categoryId,
      amount: amountStr,
      currency: input.currency,
      exchangeRateToBase: rate,
      baseAmount,
      description: input.description,
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
}

export const incomeService = new IncomeService();

