import type { CellValue, Column, Row } from '../types';

const DELIMITER = ',';

function cellToString(value: CellValue): string {
  if (value === null) return '';
  return String(value);
}

function quoteIfNeeded(field: string): string {
  if (
    field.includes(DELIMITER) ||
    field.includes('"') ||
    field.includes('\n') ||
    field.includes('\r')
  ) {
    return '"' + field.replace(/"/g, '""') + '"';
  }
  return field;
}

export function exportToCSV(rows: Row[], columns: Column[]): string {
  const visible = columns.filter((c) => c.visible);

  if (visible.length === 0) {
    return '';
  }

  const header = visible.map((c) => quoteIfNeeded(c.name)).join(DELIMITER);
  const body = rows.map((row) =>
    visible
      .map((c) => quoteIfNeeded(cellToString(row[c.key])))
      .join(DELIMITER),
  );

  return [header, ...body].join('\r\n');
}
