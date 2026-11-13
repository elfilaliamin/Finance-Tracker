import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Money } from '../../utils/money.js';

describe('Money & Exchange Utility Suite', () => {
  it('should accurately add monetary values without floating point errors', () => {
    // Standard floating point failure in JS: 0.1 + 0.2 !== 0.3
    const sum = Money.add(0.1, 0.2);
    assert.equal(Money.toDbString(sum), '0.30');
  });

  it('should accurately multiply monetary values and format', () => {
    // 12.50 * 3 = 37.50
    const total = Money.multiply('12.50', 3);
    assert.equal(Money.toDbString(total), '37.50');
    assert.equal(Money.format(total, 'MAD'), '37.50 DH');
    assert.equal(Money.format(total, 'USD'), '$37.50');
    assert.equal(Money.format(total, 'EUR'), '€37.50');
  });

  it('should strictly execute single-point ROUND_HALF_UP rounding', () => {
    // Half-up rounding checks:
    // 10.125 -> 10.13
    // 10.124 -> 10.12
    assert.equal(Money.toDbString(Money.round('10.125')), '10.13');
    assert.equal(Money.toDbString(Money.round('10.124')), '10.12');
  });

  it('should convert currency amounts with high precision before rounding', () => {
    // 100 EUR at rate 10.876543 MAD/EUR = 1087.6543 MAD -> rounded to 1087.65 DH
    const converted = Money.convert('100.00', '10.876543');
    assert.equal(Money.toDbString(converted), '1087.65');
  });

  it('should throw when dividing by zero', () => {
    assert.throws(
      () => {
        Money.divide(100, 0);
      },
      /Division by zero/
    );
  });
});

