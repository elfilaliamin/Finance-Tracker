import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Writable } from 'node:stream';
import { sanitizeCsvValue } from './csvStream.js';
import { streamPdfResponse } from './pdfStream.js';

class MockResponse extends Writable {
  headers: Record<string, string> = {};
  chunks: Buffer[] = [];
  setHeader(name: string, value: string) {
    this.headers[name] = value;
  }
  _write(chunk: any, _encoding: string, callback: () => void) {
    this.chunks.push(Buffer.from(chunk));
    callback();
  }
}

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

  it('should render PDF report with full columns and multiline items without throwing', async () => {
    const mockRes = new MockResponse();
    await streamPdfResponse(mockRes as any, 'test_report.pdf', {
      title: 'SPENDING STATEMENT',
      subtitle: 'Generated for testing',
      currency: 'MAD',
      columns: [
        { header: 'DATE', key: 'date', width: 55, align: 'left' },
        { header: 'ITEM / ARTICLE', key: 'articleName', width: 125, align: 'left' },
        { header: 'CATEGORY', key: 'category', width: 75, align: 'left' },
        { header: 'WALLET', key: 'wallet', width: 70, align: 'left' },
        { header: 'STORE', key: 'store', width: 65, align: 'left' },
        { header: 'QTY', key: 'quantity', width: 30, align: 'right' },
        { header: 'PRICE', key: 'unitPrice', width: 55, align: 'right' },
        { header: 'TOTAL', key: 'lineTotal', width: 60, align: 'right' },
      ],
      rows: [
        {
          date: '2026-11-24',
          articleName: 'Sweets (Mediopolo + Fekasa long name that wraps across multiple lines cleanly)',
          category: 'Food & Groceries',
          wallet: "Father's Money",
          store: 'Supermarket',
          quantity: '1',
          unitPrice: '25.00 MAD',
          lineTotal: '25.00 MAD',
        },
        {
          date: '2026-11-24',
          articleName: 'Bread',
          category: 'Food & Groceries',
          wallet: "Father's Money",
          store: 'Bakery',
          quantity: '2',
          unitPrice: '1.50 MAD',
          lineTotal: '3.00 MAD',
        },
      ],
      summaryTotals: [{ label: 'Consolidated Total (MAD)', value: '28.00 DH' }],
    });

    assert.equal(mockRes.headers['Content-Type'], 'application/pdf');
    assert.ok(mockRes.chunks.length > 0);
    const pdfBuffer = Buffer.concat(mockRes.chunks);
    // PDF signature begins with %PDF-
    assert.equal(pdfBuffer.subarray(0, 5).toString('ascii'), '%PDF-');
  });
});

