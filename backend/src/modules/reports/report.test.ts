import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeCsvValue } from './csvStream.js';

describe('Reports & CSV Sanitization Suite', () => {
  it('should sanitize formula injection characters by prepending single quote', () => {
    // Formula characters: =, +, -, @, tab, return
    assert.equal(sanitizeCsvValue('=SUM(A1:A10)'), "'=SUM(A1:A10)");
    assert.equal(sanitizeCsvValue('+12345'), "'+12345");
    assert.equal(sanitizeCsvValue('-cmd|calc'), "'-cmd|calc");
    assert.equal(sanitizeCsvValue('@SUM'), "'@SUM");
  });

  it('should leave normal alphanumeric values unchanged', () => {
    assert.equal(sanitizeCsvValue('Groceries'), 'Groceries');
    assert.equal(sanitizeCsvValue('150.00 DH'), '150.00 DH');
    assert.equal(sanitizeCsvValue(250), '250');
  });
});

