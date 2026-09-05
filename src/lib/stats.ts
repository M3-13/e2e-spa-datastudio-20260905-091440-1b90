import type { CellValue, Column, ColumnStats, Row } from '../types';

function toNumber(value: CellValue): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  if (value === null) return NaN;
  const trimmed = value.trim();
  if (trimmed === '') return NaN;
  const parsed = Number(trimmed.replace(',', '.'));
  return Number.isNaN(parsed) ? NaN : parsed;
}

function isMissing(value: CellValue): boolean {
  if (value === null) return true;
  if (typeof value === 'number') return false;
  return value.trim() === '';
}

export function deriveStats(rows: Row[], columns: Column[]): ColumnStats[] {
  const result: ColumnStats[] = [];

  for (const column of columns) {
    if (column.type !== 'number' || !column.visible) {
      continue;
    }

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
      const num = toNumber(value);
      if (Number.isNaN(num)) {
        continue;
      }
      count += 1;
      sum += num;
      if (num < min) min = num;
      if (num > max) max = num;
    }

    result.push({
      key: column.key,
      count,
      sum,
      mean: count === 0 ? 0 : sum / count,
      min: count === 0 ? 0 : min,
      max: count === 0 ? 0 : max,
      missing,
    });
  }

  return result;
}
