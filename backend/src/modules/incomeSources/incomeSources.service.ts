import { IncomeSourcesRepository, incomeSourcesRepository } from './incomeSources.repository.js';
import { NotFoundError } from '../../errors/AppError.js';

export interface CreateIncomeSourceInput {
  title: string;
  description?: string;
  color?: string;
}

export interface UpdateIncomeSourceInput {
  title?: string;
  description?: string;
  color?: string;
  status?: 'active' | 'inactive';
}

export class IncomeSourcesService {
  private readonly repository: IncomeSourcesRepository;

  constructor(repository: IncomeSourcesRepository = incomeSourcesRepository) {
    this.repository = repository;
  }

  async listSources(userId: string, status?: 'active' | 'inactive') {
    return await this.repository.listByUser(userId, status);
  }

  async getSource(id: string, userId: string) {
    const source = await this.repository.findById(id, userId);
    if (!source) {
      throw new NotFoundError(`Income source with ID '${id}' not found.`);
    }
    return source;
  }

  async createSource(userId: string, input: CreateIncomeSourceInput) {
    return await this.repository.create(userId, input.title, input.description, input.color);
  }

  async updateSource(id: string, userId: string, input: UpdateIncomeSourceInput) {
    const updated = await this.repository.update(id, userId, input);
    if (!updated) {
      throw new NotFoundError(`Income source with ID '${id}' not found.`);
    }
    return updated;
  }

  async deleteSource(id: string, userId: string): Promise<void> {
    const success = await this.repository.softDelete(id, userId);
    if (!success) {
      throw new NotFoundError(`Income source with ID '${id}' not found.`);
    }
  }
}

export const incomeSourcesService = new IncomeSourcesService();

