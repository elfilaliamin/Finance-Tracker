import { Response } from 'express';
import ExcelJS from 'exceljs';

export interface XlsxColumnDef {
  header: string;
  key: string;
  width?: number;
}

export async function streamXlsxResponse(
  res: Response,
  filename: string,
  sheetName: string,
  columns: XlsxColumnDef[],
  rows: Array<Record<string, unknown>>
): Promise<void> {
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
    stream: res,
    useStyles: true,
  });

  const worksheet = workbook.addWorksheet(sheetName);
  worksheet.columns = columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width || 20,
  }));

  for (const row of rows) {
    worksheet.addRow(row).commit();
  }

  worksheet.commit();
  await workbook.commit();
}

