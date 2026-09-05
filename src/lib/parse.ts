import type { CellValue, Column, Dataset, Delimiter, Row } from '../types';

const DELIMITERS: Delimiter[] = [',', ';', '\t', '|'];

// Order used to prefer a non-comma delimiter over comma when both are
// plausible: the ticket asks for semicolon/tab/pipe to win over comma when
// they are unambiguous.
const PREFERRED_ORDER: Delimiter[] = [';', '\t', '|', ','];

const NUMERIC_RE = /^[-+]?(\d+(\.\d*)?|\.\d+)([eE][-+]?\d+)?$/;

function isNumericValue(raw: string): boolean {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return false;
  }
  return NUMERIC_RE.test(trimmed);
}

function countDelimiterInLine(line: string, delimiter: string): number {
  let count = 0;
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        i += 1;
        continue;
      }
      inQuotes = !inQuotes;
    } else if (!inQuotes && ch === delimiter) {
      count += 1;
    }
  }
  return count;
}

function splitLines(text: string): string[] {
  return text.split(/\r\n|\n|\r/);
}

export function detectDelimiter(text: string): Delimiter {
  const lines = splitLines(text).filter((line) => line.length > 0);
  if (lines.length === 0) {
    return ',';
  }

  const sample = lines.slice(0, 20);

  interface Candidate {
    delimiter: Delimiter;
    count: number;
    consistency: number;
  }

  const candidates: Candidate[] = [];
  for (const delimiter of DELIMITERS) {
    const counts = sample.map((line) => countDelimiterInLine(line, delimiter));
    const positive = counts.filter((count) => count > 0);
    if (positive.length === 0) {
      candidates.push({ delimiter, count: 0, consistency: 0 });
      continue;
    }
    const maxCount = Math.max(...positive);
    const atMax = counts.filter((count) => count === maxCount).length;
    candidates.push({
      delimiter,
      count: maxCount,
      consistency: atMax / counts.length,
    });
  }

  // A delimiter is usable when it actually occurs and appears on most lines
  // with the same (maximum) count.
  const usable = candidates.filter(
    (candidate) => candidate.count > 0 && candidate.consistency >= 0.8,
  );
  if (usable.length === 0) {
    return ',';
  }

  // Prefer the delimiter that produces the most columns; on a tie, prefer the
  // non-comma delimiters (semicolon, tab, pipe) over comma.
  const maxCount = Math.max(...usable.map((candidate) => candidate.count));
  const top = usable.filter((candidate) => candidate.count === maxCount);
  for (const delimiter of PREFERRED_ORDER) {
    if (top.some((candidate) => candidate.delimiter === delimiter)) {
      return delimiter;
    }
  }
  return top[0].delimiter;
}

function parseRows(text: string, delimiter: Delimiter): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  // Skip a leading byte-order mark.
  if (text.charCodeAt(0) === 0xfeff) {
    i = 1;
  }

  const pushRow = () => {
    rows.push(row);
    row = [];
    field = '';
  };

  for (; i < text.length; i++) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
          continue;
        }
        inQuotes = false;
        continue;
      }
      field += ch;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }

    if (ch === delimiter) {
      row.push(field);
      field = '';
      continue;
    }

    if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') {
        i += 1;
      }
      row.push(field);
      pushRow();
      continue;
    }

    field += ch;
  }

  row.push(field);
  pushRow();

  // Drop blank lines (a common artifact of trailing newlines and empty lines).
  return rows.filter((r) => r.some((cell) => cell !== ''));
}

function columnLabel(index: number): string {
  let n = index;
  let label = '';
  while (n >= 0) {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  }
  return label;
}

export function delimiterLabel(delimiter: Delimiter): string {
  switch (delimiter) {
    case ',':
      return 'Komma';
    case ';':
      return 'Semikolon';
    case '\t':
      return 'Tabulator';
    case '|':
      return 'Pipe';
  }
}

export function buildColumns(names: string[], rows: string[][]): Column[] {
  const columns: Column[] = [];
  const usedKeys = new Set<string>();

  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    let key = name;
    let suffix = 2;
    while (usedKeys.has(key)) {
      key = `${name} (${suffix})`;
      suffix += 1;
    }
    usedKeys.add(key);

    let numeric = 0;
    let text = 0;
    for (const r of rows) {
      const cell = r[i];
      if (cell === undefined) {
        continue;
      }
      const trimmed = cell.trim();
      if (trimmed === '') {
        continue;
      }
      if (isNumericValue(trimmed)) {
        numeric += 1;
      } else {
        text += 1;
      }
    }

    columns.push({
      key,
      name,
      type: numeric > text ? 'number' : 'text',
      visible: true,
    });
  }

  return columns;
}

function toCellValue(
  raw: string | undefined,
  type: Column['type'],
): CellValue {
  if (raw === undefined) {
    return null;
  }
  const trimmed = raw.trim();
  if (trimmed === '') {
    return null;
  }
  if (type === 'number' && isNumericValue(trimmed)) {
    return Number(trimmed);
  }
  return raw;
}

export function parseCSV(text: string, delimiter?: Delimiter): Dataset {
  const delim = delimiter ?? detectDelimiter(text);
  const parsed = parseRows(text, delim);

  let headerCells: string[] = [];
  let hasHeader = false;
  let dataRows = parsed;

  if (parsed.length > 0) {
    const first = parsed[0];
    const nonNumeric = first.filter((cell) => !isNumericValue(cell)).length;
    const hasContent = first.some((cell) => cell.trim() !== '');
    hasHeader = hasContent && nonNumeric > first.length / 2;
    if (hasHeader) {
      headerCells = first;
      dataRows = parsed.slice(1);
    }
  }

  const maxDataWidth = dataRows.reduce(
    (max, r) => Math.max(max, r.length),
    0,
  );
  const columnCount = hasHeader
    ? Math.max(headerCells.length, maxDataWidth)
    : maxDataWidth;

  const names: string[] = [];
  for (let i = 0; i < columnCount; i++) {
    if (hasHeader && i < headerCells.length) {
      const trimmed = headerCells[i].trim();
      names.push(trimmed !== '' ? trimmed : `Spalte ${columnLabel(i)}`);
    } else {
      names.push(`Spalte ${columnLabel(i)}`);
    }
  }

  const columns = buildColumns(names, dataRows);

  const rows: Row[] = dataRows.map((r) => {
    const result: Row = {};
    columns.forEach((column, i) => {
      result[column.key] = toCellValue(r[i], column.type);
    });
    return result;
  });

  return { columns, rows, delimiter: delim, hasHeader };
}
