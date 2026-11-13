import React from 'react';
import { Sliders, Edit2, Trash2 } from 'lucide-react';
import { Wallet } from '@/api/walletApi';

interface WalletCardProps {
  wallet: Wallet;
  onAdjust: (wallet: Wallet) => void;
  onEdit: (wallet: Wallet) => void;
  onDelete: (wallet: Wallet) => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  wallet,
  onAdjust,
  onEdit,
  onDelete,
}) => {
  const balance = parseFloat(wallet.currentBalance || '0');
  const isAsset = wallet.type === 'asset';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow transition-shadow flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <span
              className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
              style={{ backgroundColor: wallet.color }}
            />
            <h3 className="font-bold text-slate-900 text-base">{wallet.name}</h3>
          </div>

          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
              isAsset ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {wallet.type}
          </span>
        </div>

        {wallet.description && (
          <p className="text-xs text-slate-500 mb-4 line-clamp-2">{wallet.description}</p>
        )}

        <div className="my-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Current Balance
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span
              className={`text-2xl font-bold font-mono tracking-tight ${
                isAsset ? 'text-slate-900' : 'text-rose-600'
              }`}
            >
              {isAsset ? '' : '-'}
              {Math.abs(balance).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-xs font-semibold text-slate-500">{wallet.defaultCurrency}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onAdjust(wallet)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-colors touch-target"
        >
          <Sliders size={15} />
          <span>Adjust Balance</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(wallet)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors touch-target"
            title="Edit wallet details"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(wallet)}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors touch-target"
            title="Delete wallet"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

