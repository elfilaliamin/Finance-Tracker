/**
 * Formats a quantity value for clean display in receipts and bill views.
 * Integer values display without decimals (e.g. 1 -> "1", 1.000 -> "1").
 * Fractional values display with up to 2 decimals (e.g. 1.500 -> "1.50", 0.75 -> "0.75").
 */
export function formatQuantity(qty: number | string | undefined | null): string {
  if (qty === undefined || qty === null || qty === '') return '1';
  const num = typeof qty === 'number' ? qty : parseFloat(String(qty));
  if (isNaN(num)) return '1';
  return Number.isInteger(num) ? num.toString() : num.toFixed(2);
}
