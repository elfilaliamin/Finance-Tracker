import { Decimal } from 'decimal.js';

Decimal.set({
  precision: 28,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -14,
  toExpPos: 28,
});

export type NumericValue = Decimal | number | string;

export class Money {
  public static from(value: NumericValue): Decimal {
    if (value instanceof Decimal) return value;
    return new Decimal(value || '0');
  }

  public static add(a: NumericValue, b: NumericValue): Decimal {
    return this.from(a).add(this.from(b));
  }

  public static subtract(a: NumericValue, b: NumericValue): Decimal {
    return this.from(a).sub(this.from(b));
  }

  public static multiply(amount: NumericValue, multiplier: NumericValue): Decimal {
    return this.from(amount).mul(this.from(multiplier));
  }

  public static divide(amount: NumericValue, divisor: NumericValue): Decimal {
    const d = this.from(divisor);
    if (d.isZero()) {
      throw new Error('Division by zero is not permitted in financial calculations.');
    }
    return this.from(amount).div(d);
  }

  /**
   * Converts an original amount to base currency using the provided exchange rate.
   * rate: 1 original currency = rate base currency units
   */
  public static convert(amount: NumericValue, rate: NumericValue): Decimal {
    return this.multiply(amount, rate);
  }

  /**
   * Applies the project's single-point Half-Up rounding to 2 decimal places.
   */
  public static round(amount: NumericValue, decimals: number = 2): Decimal {
    return this.from(amount).toDecimalPlaces(decimals, Decimal.ROUND_HALF_UP);
  }

  /**
   * Converts a value to standard numeric(14,2) string representation for database storage.
   */
  public static toDbString(amount: NumericValue): string {
    return this.round(amount, 2).toFixed(2);
  }

  /**
   * Formats a monetary number for English-only display with currency symbol or code.
   */
  public static format(amount: NumericValue, currencyCode: string = 'MAD'): string {
    const rounded = this.round(amount, 2);
    const num = rounded.toNumber();

    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);

    switch (currencyCode.toUpperCase()) {
      case 'MAD':
        return `${formatted} DH`;
      case 'USD':
        return `$${formatted}`;
      case 'EUR':
        return `€${formatted}`;
      default:
        return `${formatted} ${currencyCode}`;
    }
  }
}
