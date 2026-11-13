import React from 'react';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';
import { SpendingRecord } from '@/api/spendingApi';
import { Store, Calendar, Wallet } from 'lucide-react';

interface MiniReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  spending: SpendingRecord | null;
}

export const MiniReceiptModal: React.FC<MiniReceiptModalProps> = ({
  isOpen,
  onClose,
  spending,
}) => {
  if (!spending) return null;

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Spending Receipt"
      description={`Receipt ID: ${spending.id.substring(0, 8)}`}
      maxWidth="md"
    >
      <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200/60 font-mono text-slate-800 space-y-4 shadow-inner">
        {/* Receipt Header */}
        <div className="text-center pb-3 border-b-2 border-dashed border-amber-300">
          <h3 className="font-extrabold text-lg text-slate-900 uppercase tracking-widest">
            {spending.storeMerchant || 'STORE RECEIPT'}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Itemized Purchase Record</p>
        </div>

        {/* Metadata */}
        <div className="text-xs space-y-1.5 py-1 border-b border-dashed border-amber-300">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1">
              <Calendar size={13} /> Date:
            </span>
            <span className="font-semibold">{spending.date}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1">
              <Wallet size={13} /> Wallet:
            </span>
            <span className="font-semibold">{spending.walletName || 'Unassigned'}</span>
          </div>

          {spending.storeMerchant && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1">
                <Store size={13} /> Merchant:
              </span>
              <span className="font-semibold">{spending.storeMerchant}</span>
            </div>
          )}
        </div>

        {/* Line Items */}
        <div className="space-y-2 py-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase pb-1 border-b border-amber-200">
            <span>Item & Quantity</span>
            <span>Total</span>
          </div>

          {spending.items && spending.items.length > 0 ? (
            spending.items.map((item, idx) => (
              <div key={idx} className="flex items-start justify-between text-xs gap-2">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-[10px] text-slate-500">
                    {item.quantity} x {Number(item.unitPrice).toFixed(2)} {spending.currency}
                    {item.categoryName ? ` • ${item.categoryName}` : ''}
                  </p>
                </div>
                <span className="font-bold text-slate-800">
                  {Number(item.lineTotal).toFixed(2)} {spending.currency}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 text-center py-2">No line items recorded</p>
          )}
        </div>

        {/* Grand Total */}
        <div className="pt-3 border-t-2 border-dashed border-amber-300 flex items-center justify-between">
          <span className="font-bold text-sm uppercase">Total Amount:</span>
          <span className="text-xl font-extrabold text-rose-700">
            {parseFloat(spending.totalAmount).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            {spending.currency}
          </span>
        </div>

        {spending.notes && (
          <div className="pt-2 border-t border-amber-200 text-[11px] text-slate-500">
            <span className="font-bold">Notes: </span>
            <span>{spending.notes}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 touch-target"
        >
          Close Receipt
        </button>
      </div>
    </ResponsiveModal>
  );
};

