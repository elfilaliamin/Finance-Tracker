import { Response } from 'express';
import PDFDocument from 'pdfkit';

export interface PdfColumn {
  header: string;
  key: string;
  width: number;
  align?: 'left' | 'center' | 'right';
}

export interface PdfReportOptions {
  title: string;
  subtitle?: string;
  currency: string;
  columns?: PdfColumn[];
  headers?: string[];
  rows: Array<Record<string, unknown>> | string[][];
  summaryTotals?: Array<{ label: string; value: string }>;
}

export function streamPdfResponse(res: Response, filename: string, options: PdfReportOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const leftMargin = 30;
    const rightMargin = 30;
    const topMargin = 35;
    const bottomMargin = 40;

    const doc = new PDFDocument({
      margin: leftMargin,
      size: 'A4',
      bufferPages: true,
      autoFirstPage: true,
    });

    doc.pipe(res);

    doc.on('error', (err) => reject(err));
    doc.on('end', () => resolve());

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const tableWidth = pageWidth - leftMargin - rightMargin; // 535.28 pt

    // Determine and normalize columns
    let rawColumns: PdfColumn[];
    if (options.columns && options.columns.length > 0) {
      rawColumns = options.columns;
    } else if (options.headers && options.headers.length > 0) {
      const defaultColWidth = tableWidth / options.headers.length;
      rawColumns = options.headers.map((h) => ({
        header: h.toUpperCase(),
        key: h.toLowerCase(),
        width: defaultColWidth,
        align: 'left',
      }));
    } else {
      rawColumns = [{ header: 'ITEM', key: 'item', width: tableWidth, align: 'left' }];
    }

    // Scale column widths proportionally so the table fills exact tableWidth
    const totalRawWidth = rawColumns.reduce((sum, c) => sum + c.width, 0);
    const scaleFactor = tableWidth / (totalRawWidth || 1);
    const columns = rawColumns.map((c) => ({
      ...c,
      width: c.width * scaleFactor,
    }));

    // Header Title
    doc.font('Helvetica-Bold').fontSize(18).fillColor('#0f172a').text('Finance-Tracker', leftMargin, topMargin);
    doc.font('Helvetica-Bold').fontSize(13).fillColor('#047857').text(options.title);
    if (options.subtitle) {
      doc.font('Helvetica').fontSize(9).fillColor('#64748b').text(options.subtitle);
    }
    doc.moveDown(1.2);

    // Summary Totals if provided
    if (options.summaryTotals && options.summaryTotals.length > 0) {
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#0f172a').text('Summary Overview');
      doc.moveDown(0.3);
      for (const item of options.summaryTotals) {
        doc.font('Helvetica')
          .fontSize(9)
          .fillColor('#475569')
          .text(`${item.label}: `, { continued: true })
          .font('Helvetica-Bold')
          .fillColor('#0f172a')
          .text(item.value);
      }
      doc.moveDown(1.2);
    }

    // Tabular Listing Header
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#0f172a').text('Itemized Statement');
    doc.moveDown(0.5);

    // Table Header Renderer
    const renderTableHeader = (headerY: number): number => {
      const headerHeight = 20;

      // Header background
      doc.fillColor('#f1f5f9')
        .rect(leftMargin, headerY, tableWidth, headerHeight)
        .fill();

      // Header bottom border
      doc.strokeColor('#cbd5e1')
        .lineWidth(0.75)
        .moveTo(leftMargin, headerY + headerHeight)
        .lineTo(leftMargin + tableWidth, headerY + headerHeight)
        .stroke();

      let colX = leftMargin;
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#334155');

      for (const col of columns) {
        doc.text(col.header, colX + 3, headerY + 6, {
          width: col.width - 6,
          align: col.align || 'left',
        });
        colX += col.width;
      }

      return headerY + headerHeight;
    };

    let currentY = renderTableHeader(doc.y);

    // Data rows rendering with dynamic row height & collision prevention
    for (let r = 0; r < options.rows.length; r++) {
      const rawRow = options.rows[r];
      const rowObj: Record<string, unknown> = Array.isArray(rawRow)
        ? rawRow.reduce((acc, cellVal, idx) => {
            const key = columns[idx]?.key || String(idx);
            acc[key] = cellVal;
            return acc;
          }, {} as Record<string, unknown>)
        : rawRow;

      // 1. Compute maximum height among all cells in this row
      let maxCellHeight = 10;
      doc.font('Helvetica').fontSize(8);

      for (const col of columns) {
        const val = String(rowObj[col.key] ?? '-');
        const h = doc.heightOfString(val, {
          width: col.width - 6,
          align: col.align || 'left',
          lineGap: 1,
        });
        if (h > maxCellHeight) {
          maxCellHeight = h;
        }
      }

      const rowPadding = 4;
      const rowHeight = maxCellHeight + rowPadding * 2;

      // 2. Page break check (render headers anew on page break)
      if (currentY + rowHeight > pageHeight - bottomMargin) {
        doc.addPage();
        currentY = renderTableHeader(topMargin);
      }

      // 3. Alternating row background
      if (r % 2 === 1) {
        doc.fillColor('#f8fafc')
          .rect(leftMargin, currentY, tableWidth, rowHeight)
          .fill();
      }

      // 4. Render cell values
      let cellX = leftMargin;
      doc.fillColor('#1e293b').fontSize(8);

      for (const col of columns) {
        const val = String(rowObj[col.key] ?? '-');
        doc.text(val, cellX + 3, currentY + rowPadding, {
          width: col.width - 6,
          align: col.align || 'left',
          lineGap: 1,
        });
        cellX += col.width;
      }

      // 5. Light horizontal separator
      doc.strokeColor('#f1f5f9')
        .lineWidth(0.5)
        .moveTo(leftMargin, currentY + rowHeight)
        .lineTo(leftMargin + tableWidth, currentY + rowHeight)
        .stroke();

      currentY += rowHeight;
    }

    // Footers: Number all pages
    const pageRange = doc.bufferedPageRange();
    for (let i = pageRange.start; i < pageRange.start + pageRange.count; i++) {
      doc.switchToPage(i);
      doc.font('Helvetica')
        .fontSize(8)
        .fillColor('#94a3b8')
        .text(
          `Page ${i + 1} of ${pageRange.count}`,
          leftMargin,
          pageHeight - 25,
          { width: tableWidth, align: 'center' }
        );
    }

    doc.end();
  });
}
