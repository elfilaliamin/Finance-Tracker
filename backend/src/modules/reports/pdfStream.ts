import { Response } from 'express';
import PDFDocument from 'pdfkit';

export interface PdfReportOptions {
  title: string;
  subtitle?: string;
  currency: string;
  headers: string[];
  rows: string[][];
  summaryTotals?: Array<{ label: string; value: string }>;
}

export function streamPdfResponse(res: Response, filename: string, options: PdfReportOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    doc.pipe(res);

    doc.on('error', (err) => reject(err));
    doc.on('end', () => resolve());

    // Header Title
    doc.fontSize(20).text('Finance-Tracker', { align: 'left' });
    doc.fontSize(14).text(options.title, { align: 'left' });
    if (options.subtitle) {
      doc.fontSize(10).fillColor('#64748b').text(options.subtitle);
    }
    doc.moveDown(1.5);

    // Summary Totals if provided
    if (options.summaryTotals && options.summaryTotals.length > 0) {
      doc.fillColor('#0f172a').fontSize(12).text('Summary Overview', { underline: true });
      doc.moveDown(0.5);
      for (const item of options.summaryTotals) {
        doc.fontSize(10).fillColor('#334155').text(`${item.label}: `, { continued: true }).fillColor('#0f172a').text(item.value);
      }
      doc.moveDown(1.5);
    }

    // Tabular Listing
    doc.fillColor('#0f172a').fontSize(12).text('Itemized Statement', { underline: true });
    doc.moveDown(0.5);

    // Simple textual table representation
    const colWidth = 500 / options.headers.length;
    let startY = doc.y;

    // Header row
    doc.fontSize(9).fillColor('#475569');
    options.headers.forEach((h, i) => {
      doc.text(h, 40 + i * colWidth, startY, { width: colWidth, align: 'left' });
    });

    doc.moveDown(0.5);
    doc.strokeColor('#cbd5e1').moveTo(40, doc.y).lineTo(540, doc.y).stroke();
    doc.moveDown(0.5);

    // Data rows
    doc.fillColor('#1e293b');
    for (const row of options.rows) {
      // Check page break
      if (doc.y > 750) {
        doc.addPage();
      }
      const currentY = doc.y;
      row.forEach((cell, i) => {
        doc.text(cell, 40 + i * colWidth, currentY, { width: colWidth, align: 'left' });
      });
      doc.moveDown(0.4);
    }

    doc.end();
  });
}

