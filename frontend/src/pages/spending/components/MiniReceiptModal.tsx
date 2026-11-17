import React from 'react';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';
import { SpendingRecord } from '@/api/spendingApi';
import { formatQuantity } from '@/utils/format';
import { RiPriceTag3Line, RiCalendarLine, RiWallet3Line } from '@remixicon/react';

interface MiniReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  spending: SpendingRecord | null;
  onEdit?: () => void;
}

export const MiniReceiptModal: React.FC<MiniReceiptModalProps> = ({
  isOpen,
  onClose,
  spending,
  onEdit,
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
      <div className="bg-[var(--color-primary-bg)] p-5 rounded-[var(--radius-surface)] border border-[var(--color-border)] font-mono text-[var(--color-text)] space-y-4 shadow-inner">
        {/* Receipt Header */}
        <div className="text-center pb-3 border-b-2 border-dashed border-[var(--color-border)]">
          <h3 className="font-extrabold text-lg text-[var(--color-text)] uppercase tracking-widest font-heading">
            {spending.storeMerchant || 'STORE RECEIPT'}
          </h3>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-1">Itemized Purchase Record</p>
        </div>

        {/* Metadata */}
        <div className="text-xs space-y-1.5 py-1 border-b border-dashed border-[var(--color-border)]">
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-muted)] flex items-center gap-1">
              <RiCalendarLine className="w-3.5 h-3.5" /> Date:
            </span>
            <span className="font-semibold">{spending.date}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-muted)] flex items-center gap-1">
              <RiWallet3Line className="w-3.5 h-3.5" /> Wallet:
            </span>
            <span className="font-semibold">{spending.walletName || 'Unassigned'}</span>
          </div>

          {spending.storeMerchant && (
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-text-muted)] flex items-center gap-1">
                <RiPriceTag3Line className="w-3.5 h-3.5" /> Category:
              </span>
              <span className="font-semibold">{spending.storeMerchant}</span>
            </div>
          )}
        </div>

        {/* Line Items */}
        <div className="space-y-2 py-2">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] font-bold uppercase pb-1 border-b border-[var(--color-border)]">
            <span>Item & Quantity</span>
            <span>Total</span>
          </div>

          {spending.items && spending.items.length > 0 ? (
            spending.items.map((item, idx) => (
              <div key={idx} className="flex items-start justify-between text-xs gap-2">
                <div className="flex-1">
                  <p className="font-semibold text-[var(--color-text)]">{item.name}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">
                    {formatQuantity(item.quantity)} x {Number(item.unitPrice).toFixed(2)} {spending.currency}
                    {item.categoryName ? ` • ${item.categoryName}` : ''}
                  </p>
                </div>
                <span className="font-bold text-[var(--color-text)]">
                  {Number(item.lineTotal).toFixed(2)} {spending.currency}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-[var(--color-text-muted)] text-center py-2">No line items recorded</p>
          )}
        </div>

        {/* Grand Total */}
        <div className="pt-3 border-t-2 border-dashed border-[var(--color-border)] flex items-center justify-between">
          <span className="font-bold text-sm uppercase">Total Amount:</span>
          <span className="text-xl font-extrabold text-[var(--color-danger)] font-mono">
            {parseFloat(spending.totalAmount).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            {spending.currency}
          </span>
        </div>

        {spending.notes && (
          <div className="pt-2 border-t border-[var(--color-border)] text-[11px] text-[var(--color-text-muted)]">
            <span className="font-bold">Notes: </span>
            <span>{spending.notes}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        {onEdit && (
          <button
            onClick={() => {
              onClose();
              onEdit();
            }}
            className="px-4 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border)] text-[var(--color-text)] text-sm font-medium hover:bg-[var(--color-primary-bg)] touch-target"
          >
            Edit Bill
          </button>
        )}
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-[var(--radius-base)] bg-[var(--color-primary)] text-white text-sm font-semibold hover:bg-[var(--color-primary-hover)] touch-target"
        >
          Close Receipt
        </button>
      </div>
    </ResponsiveModal>
  );
};

