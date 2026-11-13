import { api } from './client';

export interface ExchangeRate {
  id: string;
  sourceCurrency: string;
  targetCurrency: string;
  rate: string;
  rateDate: string;
  source: string;
}

export interface UserSettings {
  displayCurrency: string;
  conversionMode: string;
  theme: string;
  dashboardLayout: any;
}

export const settingsApi = {
  getSettings: () =>
    api.get<UserSettings>('/settings'),

  updateSettings: (data: Partial<UserSettings>) =>
    api.put<UserSettings>('/settings', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<{ success: boolean }>('/auth/password', data),

  getExchangeRates: () =>
    api.get<ExchangeRate[]>('/exchange-rates/latest'),

  refreshExchangeRates: () =>
    api.post<{ success: boolean }>('/exchange-rates/refresh'),

  exportData: () =>
    api.download('/danger-zone/export', 'finance-tracker-backup.json'),

  dryRunImport: (jsonData: any) =>
    api.post<any>('/danger-zone/import/dry-run', jsonData),

  executeImport: (jsonData: any) =>
    api.post<any>('/danger-zone/import', jsonData),

  purgeData: (confirmation: string) =>
    api.post<any>('/danger-zone/purge', { confirmation }),
};

