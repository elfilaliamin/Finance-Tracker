import { Response } from 'express';
import { format } from 'fast-csv';

export function sanitizeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // Neutralize CSV formula injection attacks
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

export function streamCsvResponse(
  res: Response,
  filename: string,
  headers: string[],
  rows: Array<Record<string, unknown>>
): Promise<void> {
  return new Promise((resolve, reject) => {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Write UTF-8 BOM for Windows Excel compatibility
    res.write('\uFEFF');

    const csvStream = format({ headers: true });
    csvStream.pipe(res);

    csvStream.on('error', (err) => reject(err));
    csvStream.on('end', () => resolve());

    for (const row of rows) {
      const sanitizedRow: Record<string, string> = {};
      for (const key of headers) {
        sanitizedRow[key] = sanitizeCsvValue(row[key]);
      }
      csvStream.write(sanitizedRow);
    }

    csvStream.end();
  });
}

