import { SpendingCategoriesRepository, spendingCategoriesRepository } from './spendingCategories.repository.js';
import { NotFoundError } from '../../errors/AppError.js';
import { CreateCategoryInput, UpdateCategoryInput } from './incomeCategories.service.js';

export class SpendingCategoriesService {
  private readonly repository: SpendingCategoriesRepository;

  constructor(repository: SpendingCategoriesRepository = spendingCategoriesRepository) {
    this.repository = repository;
  }

  async listCategories(userId: string) {
    return await this.repository.listByUser(userId);
  }

  async getCategory(id: string, userId: string) {
    const category = await this.repository.findById(id, userId);
    if (!category) {
      throw new NotFoundError(`Spending category with ID '${id}' not found.`);
    }
    return category;
  }

  async createCategory(userId: string, input: CreateCategoryInput) {
    return await this.repository.create(userId, input.name, input.color, input.icon);
  }

  async updateCategory(id: string, userId: string, input: UpdateCategoryInput) {
    const updated = await this.repository.update(id, userId, input);
    if (!updated) {
      throw new NotFoundError(`Spending category with ID '${id}' not found.`);
    }
    return updated;
  }

  async deleteCategory(id: string, userId: string): Promise<void> {
    const success = await this.repository.softDelete(id, userId);
    if (!success) {
      throw new NotFoundError(`Spending category with ID '${id}' not found.`);
    }
  }
}

export const spendingCategoriesService = new SpendingCategoriesService();

