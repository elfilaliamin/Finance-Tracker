/**
 * Parses user input or pasted date strings in diverse formats (e.g. "1/15/2025", "01/15/2025",
 * "2025-01-15", "15/01/2025", "Jan 15 2025") into HTML date input format "YYYY-MM-DD".
 */
export function parsePastedDate(input: string): string | null {
  if (!input) return null;
  const raw = input.trim();

  // 1. Direct YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  // 2. YYYY/MM/DD or YYYY.MM.DD
  const ymd = raw.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (ymd) {
    const [, y, m, d] = ymd;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // 3. M/D/YYYY or MM/DD/YYYY or D/M/YYYY or DD/MM/YYYY
  const mdy = raw.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (mdy) {
    const [, part1, part2, year] = mdy;
    const n1 = parseInt(part1, 10);
    const n2 = parseInt(part2, 10);

    let month = n1;
    let day = n2;

    // If first number > 12 and second <= 12, it is DD/MM/YYYY
    if (n1 > 12 && n2 <= 12) {
      day = n1;
      month = n2;
    }

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  // 4. Fallback to native Date parser
  const parsed = new Date(raw);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return null;
}
