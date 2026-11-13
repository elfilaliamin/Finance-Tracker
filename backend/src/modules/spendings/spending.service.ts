import { SpendingRepository, spendingRepository, CalculatedSpendingItem, CalculatedSpendingHeader } from './spending.repository.js';
import { walletRepository } from '../wallets/wallet.repository.js';
import { spendingCategoriesRepository } from '../categories/spendingCategories.repository.js';
import { currencyService } from '../currencies/currency.service.js';
import { CreateSpendingInput, SpendingFilterInput } from './spending.schemas.js';
import { NotFoundError } from '../../errors/AppError.js';
import { Money } from '../../utils/money.js';

export class SpendingService {
  private readonly repository: SpendingRepository;

  constructor(repository: SpendingRepository = spendingRepository) {
    this.repository = repository;
  }

  async listSpendings(userId: string, filters: SpendingFilterInput) {
    return await this.repository.listByUser(userId, filters);
  }

  async getSpending(id: string, userId: string) {
    const spending = await this.repository.findById(id, userId);
    if (!spending) {
      throw new NotFoundError(`Spending record with ID '${id}' not found.`);
    }
    return spending;
  }

  async createSpending(userId: string, input: CreateSpendingInput) {
    // 1. Verify wallet if specified
    if (input.paidFromWalletId) {
      const wallet = await walletRepository.findById(input.paidFromWalletId, userId);
      if (!wallet) {
        throw new NotFoundError(`Wallet with ID '${input.paidFromWalletId}' not found.`);
      }
    }

    // 2. Verify spending categories
    for (const item of input.items) {
      if (item.categoryId) {
        const cat = await spendingCategoriesRepository.findById(item.categoryId, userId);
        if (!cat) {
          throw new NotFoundError(`Spending category with ID '${item.categoryId}' not found.`);
        }
      }
    }

    // 3. Resolve exchange rate to base currency (MAD)
    const rate = await currencyService.getRateForDate(input.currency, 'MAD', input.date);

    // 4. Calculate line totals and grand totals with arbitrary precision
    let grandTotal = Money.from(0);
    let baseGrandTotal = Money.from(0);

    const calculatedItems: CalculatedSpendingItem[] = input.items.map((item) => {
      const unitPriceStr = Money.toDbString(item.unitPrice);
      const qtyStr = Money.from(item.quantity).toFixed(3);
      const lineTotal = Money.multiply(unitPriceStr, qtyStr);
      const baseLineTotal = Money.convert(lineTotal, rate);

      grandTotal = Money.add(grandTotal, lineTotal);
      baseGrandTotal = Money.add(baseGrandTotal, baseLineTotal);

      return {
        articleName: item.articleName,
        categoryId: item.categoryId,
        unitPrice: unitPriceStr,
        quantity: qtyStr,
        lineTotal: Money.toDbString(lineTotal),
        baseLineTotal: Money.toDbString(baseLineTotal),
      };
    });

    const header: CalculatedSpendingHeader = {
      date: input.date,
      paidFromWalletId: input.paidFromWalletId,
      store: input.store,
      currency: input.currency,
      exchangeRateToBase: rate,
      totalAmount: Money.toDbString(grandTotal),
      baseTotalAmount: Money.toDbString(baseGrandTotal),
      notes: input.notes,
    };

    return await this.repository.create(userId, header, calculatedItems);
  }

  async deleteSpending(id: string, userId: string): Promise<void> {
    const deleted = await this.repository.softDelete(id, userId);
    if (!deleted) {
      throw new NotFoundError(`Spending record with ID '${id}' not found.`);
    }
  }
}

export const spendingService = new SpendingService();

