import { SettingsRepository, settingsRepository } from './settings.repository.js';
import { NotFoundError } from '../../errors/AppError.js';

export interface UpdateSettingsInput {
  displayCurrency?: 'MAD' | 'USD' | 'EUR';
  conversionMode?: 'historical' | 'latest';
  exchangeRateFrequency?: 'daily' | 'manual';
  theme?: 'light' | 'dark' | 'system';
  defaultSpendingWalletId?: string | null;
  dashboardLayout?: any;
}

export class SettingsService {
  private readonly repository: SettingsRepository;

  constructor(repository: SettingsRepository = settingsRepository) {
    this.repository = repository;
  }

  async getSettings(userId: string) {
    const settings = await this.repository.getByUserId(userId);
    if (!settings) {
      throw new NotFoundError('User settings not found');
    }
    return settings;
  }

  async updateSettings(userId: string, input: UpdateSettingsInput) {
    const updated = await this.repository.update(userId, input);
    if (!updated) {
      throw new NotFoundError('User settings not found');
    }
    return updated;
  }
}

export const settingsService = new SettingsService();

