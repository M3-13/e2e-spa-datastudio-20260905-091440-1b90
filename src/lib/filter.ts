import type { CellValue, Column, FilterCondition, Row } from '../types';

function columnType(columns: Column[], key: string): 'text' | 'number' {
  const column = columns.find((c) => c.key === key);
  return column?.type ?? 'text';
}

function toNumber(value: CellValue): number {
  if (typeof value === 'number') return value;
  if (value === null) return NaN;
  const trimmed = value.trim();
  if (trimmed === '') return NaN;
  const parsed = Number(trimmed.replace(',', '.'));
  return Number.isNaN(parsed) ? NaN : parsed;
}

function cellText(value: CellValue): string {
  if (value === null) return '';
  return String(value);
}

function matchesCondition(
  row: Row,
  filter: FilterCondition,
  type: 'text' | 'number',
): boolean {
  const cell = row[filter.key];
  const value = filter.value ?? '';

  switch (filter.operator) {
    case 'contains':
      return cellText(cell)
        .toLocaleLowerCase()
        .includes(value.toLocaleLowerCase());
    case 'equals':
      if (type === 'number') {
        const cellNum = toNumber(cell);
        const valueNum = toNumber(value);
        if (Number.isNaN(cellNum) || Number.isNaN(valueNum)) return false;
        return cellNum === valueNum;
      }
      return cellText(cell).toLocaleLowerCase() === value.toLocaleLowerCase();
    case 'gt':
    case 'gte':
    case 'lt':
    case 'lte': {
      const cellNum = toNumber(cell);
      const valueNum = toNumber(value);
      if (Number.isNaN(cellNum) || Number.isNaN(valueNum)) return false;
      switch (filter.operator) {
        case 'gt':
          return cellNum > valueNum;
        case 'gte':
          return cellNum >= valueNum;
        case 'lt':
          return cellNum < valueNum;
        case 'lte':
          return cellNum <= valueNum;
      }
      return false;
    }
    case 'between': {
      const cellNum = toNumber(cell);
      const lower = toNumber(value);
      const upper = toNumber(filter.value2 ?? '');
      if (Number.isNaN(cellNum) || Number.isNaN(lower) || Number.isNaN(upper)) {
        return false;
      }
      const min = Math.min(lower, upper);
      const max = Math.max(lower, upper);
      return cellNum >= min && cellNum <= max;
    }
    default:
      return true;
  }
}

export function filterRows(
  rows: Row[],
  columns: Column[],
  filters: FilterCondition[],
): Row[] {
  if (filters.length === 0) return rows;

  const active = filters.filter((f) => {
    if (f.value.trim() === '') return false;
    if (f.operator === 'between') {
      return (f.value2 ?? '').trim() !== '';
    }
    return true;
  });

  if (active.length === 0) return rows;

  return rows.filter((row) =>
    active.every((filter) =>
      matchesCondition(row, filter, columnType(columns, filter.key)),
    ),
  );
}
