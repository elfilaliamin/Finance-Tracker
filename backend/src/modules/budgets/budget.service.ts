import { BudgetRepository, budgetRepository } from './budget.repository.js';
import { walletRepository } from '../wallets/wallet.repository.js';
import { spendingCategoriesRepository } from '../categories/spendingCategories.repository.js';
import { CreateBudgetInput, UpdateBudgetInput, BudgetFilterInput } from './budget.schemas.js';
import { NotFoundError, ValidationError } from '../../errors/AppError.js';
import { Money } from '../../utils/money.js';

export interface BudgetProgressDto {
  id: string;
  name: string;
  type: 'spending_limit' | 'saving_goal';
  period: string;
  startDate: string;
  endDate?: string | null;
  targetAmount: string;
  currency: string;
  isActive: boolean;
  currentAmount: string; // spent so far (for limit) OR current balance (for goal)
  remainingAmount: string;
  percentage: number;
  status: 'normal' | 'warning' | 'exceeded';
  requiredMonthlySavings?: string | null;
  wallet?: {
    id: string;
    name: string;
    currentBalance: string;
  } | null;
  category?: {
    id: string;
    name: string;
    color: string;
  } | null;
}

export class BudgetService {
  private readonly repository: BudgetRepository;

  constructor(repository: BudgetRepository = budgetRepository) {
    this.repository = repository;
  }

  async listBudgetsWithProgress(userId: string, filters?: BudgetFilterInput): Promise<BudgetProgressDto[]> {
    const records = await this.repository.listByUser(userId, filters);
    const progressList: BudgetProgressDto[] = [];

    for (const budget of records) {
      if (budget.type === 'spending_limit') {
        const spentStr = await this.repository.getSpentInPeriod(userId, {
          categoryId: budget.categoryId,
          walletId: budget.walletId,
          startDate: budget.startDate,
          endDate: budget.endDate,
        });

        const spent = Money.from(spentStr);
        const target = Money.from(budget.targetAmount);
        const remaining = Money.subtract(target, spent);

        let percentage = 0;
        if (!target.isZero()) {
          percentage = Money.divide(spent, target).mul(100).toDecimalPlaces(1).toNumber();
        }

        const status = percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'normal';

        progressList.push({
          id: budget.id,
          name: budget.name,
          type: 'spending_limit',
          period: budget.period,
          startDate: budget.startDate,
          endDate: budget.endDate,
          targetAmount: Money.toDbString(target),
          currency: budget.currency,
          isActive: budget.isActive,
          currentAmount: Money.toDbString(spent),
          remainingAmount: Money.toDbString(remaining),
          percentage,
          status,
          wallet: budget.wallet,
          category: budget.category,
        });
      } else {
        // Saving Goal
        const currentBalanceStr = budget.wallet?.currentBalance || '0.00';
        const currentBalance = Money.from(currentBalanceStr);
        const target = Money.from(budget.targetAmount);
        const remaining = Money.subtract(target, currentBalance);

        let percentage = 0;
        if (!target.isZero()) {
          percentage = Money.divide(currentBalance, target).mul(100).toDecimalPlaces(1).toNumber();
        }

        // Calculate required monthly savings if endDate is set
        let requiredMonthlySavings: string | null = null;
        if (budget.endDate && remaining.gt(0)) {
          const now = new Date();
          const targetDate = new Date(budget.endDate);
          const diffMonths =
            (targetDate.getFullYear() - now.getFullYear()) * 12 +
            (targetDate.getMonth() - now.getMonth());

          const remainingMonths = Math.max(1, diffMonths);
          const monthlyTarget = Money.divide(remaining, remainingMonths);
          requiredMonthlySavings = Money.toDbString(monthlyTarget);
        }

        const status = percentage >= 100 ? 'normal' : 'normal';

        progressList.push({
          id: budget.id,
          name: budget.name,
          type: 'saving_goal',
          period: budget.period,
          startDate: budget.startDate,
          endDate: budget.endDate,
          targetAmount: Money.toDbString(target),
          currency: budget.currency,
          isActive: budget.isActive,
          currentAmount: Money.toDbString(currentBalance),
          remainingAmount: Money.toDbString(remaining.gt(0) ? remaining : 0),
          percentage,
          status,
          requiredMonthlySavings,
          wallet: budget.wallet,
        });
      }
    }

    return progressList;
  }

  async createBudget(userId: string, input: CreateBudgetInput) {
    if (input.type === 'saving_goal' && !input.walletId) {
      throw new ValidationError('A saving goal must be attached to a specific wallet.');
    }

    if (input.walletId) {
      const wallet = await walletRepository.findById(input.walletId, userId);
      if (!wallet) {
        throw new NotFoundError(`Wallet with ID '${input.walletId}' not found.`);
      }
    }

    if (input.categoryId) {
      const cat = await spendingCategoriesRepository.findById(input.categoryId, userId);
      if (!cat) {
        throw new NotFoundError(`Spending category with ID '${input.categoryId}' not found.`);
      }
    }

    const targetAmountStr = Money.toDbString(input.targetAmount);

    return await this.repository.create(userId, {
      name: input.name,
      type: input.type,
      walletId: input.walletId,
      categoryId: input.categoryId,
      period: input.period,
      startDate: input.startDate,
      endDate: input.endDate,
      targetAmount: targetAmountStr,
      currency: input.currency,
    });
  }

  async updateBudget(id: string, userId: string, input: UpdateBudgetInput) {
    const updated = await this.repository.update(id, userId, {
      name: input.name,
      targetAmount: input.targetAmount !== undefined ? Money.toDbString(input.targetAmount) : undefined,
      currency: input.currency,
      endDate: input.endDate,
      isActive: input.isActive,
    });

    if (!updated) {
      throw new NotFoundError(`Budget with ID '${id}' not found.`);
    }

    return updated;
  }

  async deleteBudget(id: string, userId: string): Promise<void> {
    const deleted = await this.repository.softDelete(id, userId);
    if (!deleted) {
      throw new NotFoundError(`Budget with ID '${id}' not found.`);
    }
  }
}

export const budgetService = new BudgetService();

