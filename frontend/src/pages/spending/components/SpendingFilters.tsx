import React from 'react';
import { FilterDrawer } from '@/components/ui/FilterDrawer';
import { SpendingCategory } from '@/api/spendingApi';
import { Wallet } from '@/api/walletApi';

interface SpendingFiltersProps {
  categories: SpendingCategory[];
  wallets: Wallet[];
  selectedWalletId: string;
  onSelectWalletId: (id: string) => void;
  selectedCategoryId: string;
  onSelectCategoryId: (id: string) => void;
  selectedMerchant: string;
  onSelectMerchant: (m: string) => void;
  selectedCurrency: string;
  onSelectCurrency: (curr: string) => void;
  search: string;
  onSearchChange: (s: string) => void;
  onClear: () => void;
}

export const SpendingFilters: React.FC<SpendingFiltersProps> = ({
  categories,
  wallets,
  selectedWalletId,
  onSelectWalletId,
  selectedCategoryId,
  onSelectCategoryId,
  selectedMerchant,
  onSelectMerchant,
  selectedCurrency,
  onSelectCurrency,
  search,
  onSearchChange,
  onClear,
}) => {
  let activeCount = 0;
  if (selectedWalletId) activeCount++;
  if (selectedCategoryId) activeCount++;
  if (selectedMerchant) activeCount++;
  if (selectedCurrency) activeCount++;
  if (search) activeCount++;

  return (
    <FilterDrawer activeCount={activeCount} onClear={onClear} title="Filter Spending Ledger">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 w-full sm:w-auto">
        <input
          type="text"
          placeholder="Search items or notes..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-800 w-full sm:w-48"
        />
      </div>

      {/* Wallet */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 w-full sm:w-auto">
        <label className="text-xs text-slate-500 font-semibold sm:hidden">Wallet</label>
        <select
          value={selectedWalletId}
          onChange={(e) => onSelectWalletId(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 w-full sm:w-auto"
        >
          <option value="">All Wallets</option>
          {wallets.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 w-full sm:w-auto">
        <label className="text-xs text-slate-500 font-semibold sm:hidden">Category</label>
        <select
          value={selectedCategoryId}
          onChange={(e) => onSelectCategoryId(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 w-full sm:w-auto"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Currency */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 w-full sm:w-auto">
        <label className="text-xs text-slate-500 font-semibold sm:hidden">Currency</label>
        <select
          value={selectedCurrency}
          onChange={(e) => onSelectCurrency(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 w-full sm:w-auto"
        >
          <option value="">All Currencies</option>
          <option value="MAD">MAD</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </select>
      </div>
    </FilterDrawer>
  );
};

