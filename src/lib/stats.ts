import type { CellValue, Column, ColumnStats, Row } from '../types';

function isMissing(value: CellValue | undefined): boolean {
  if (value === null || value === undefined) return true;
  return typeof value === 'string' && value.trim() === '';
}

function toNumber(value: CellValue | undefined): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string') {
    const n = Number(value.trim());
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function deriveStats(rows: Row[], columns: Column[]): ColumnStats[] {
  return columns
    .filter((column) => column.visible && column.type === 'number')
    .map((column) => {
      let count = 0;
      let sum = 0;
      let min = Number.POSITIVE_INFINITY;
      let max = Number.NEGATIVE_INFINITY;
      let missing = 0;

      for (const row of rows) {
        const value = row[column.key];
        if (isMissing(value)) {
          missing += 1;
          continue;
        }
        const n = toNumber(value);
        if (n === null) {
          missing += 1;
          continue;
        }
        count += 1;
        sum += n;
        if (n < min) min = n;
        if (n > max) max = n;
      }

      return {
        key: column.key,
        count,
        sum,
        mean: count > 0 ? sum / count : 0,
        min: count > 0 ? min : 0,
        max: count > 0 ? max : 0,
        missing,
      };
    });
}
