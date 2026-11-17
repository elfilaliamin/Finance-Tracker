# Reports & Export API

The Reports API provides multi-format data exports for external bookkeeping, tax compliance, and local backups. Supported formats include **CSV**, **Excel (XLSX)**, and **PDF**.

All endpoints require authentication (`auth_token` cookie).

---

## Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/reports/preview` | JSON preview of report dataset matching query criteria. |
| `GET` | `/api/v1/reports/export/csv` | Streams RFC-4180 compliant CSV with formula sanitization. |
| `GET` | `/api/v1/reports/export/xlsx` | Streams formatted spreadsheet with multi-tab summaries. |
| `GET` | `/api/v1/reports/export/pdf` | Streams printable summary report with tables and totals. |

---

## Security: CSV Formula Injection Sanitization

To protect users against **CSV Formula Injection** (also known as Spreadsheet Injection or DDE attacks), all string fields in CSV exports pass through a sanitization filter:

- If a text cell begins with dangerous formula triggers (`=`, `+`, `-`, `@`, `\t`, `\r`), it is prefixed with a single quotation mark (`'`).
- This neutralizes dynamic formula evaluation in spreadsheet software such as Microsoft Excel, Google Sheets, and LibreOffice Calc.
