import type { CellValue, Row, SortConfig } from '../types';

function isEmpty(value: CellValue): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  return false;
}

function toNumber(value: CellValue): number {
  if (typeof value === 'number') return value;
  if (value === null) return NaN;
  const trimmed = value.trim();
  if (trimmed === '') return NaN;
  const parsed = Number(trimmed.replace(',', '.'));
  return Number.isNaN(parsed) ? NaN : parsed;
}

function compareValues(a: CellValue, b: CellValue): number {
  const aNum = toNumber(a);
  const bNum = toNumber(b);
  if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
    return aNum - bNum;
  }
  const aStr = a === null ? '' : String(a);
  const bStr = b === null ? '' : String(b);
  return aStr.localeCompare(bStr);
}

export function sortRows(rows: Row[], sort: SortConfig | null): Row[] {
  if (!sort) return [...rows];

  const { key, direction } = sort;
  const dir = direction === 'asc' ? 1 : -1;

  const indexed = rows.map((row, index) => ({ row, index }));

  indexed.sort((a, b) => {
    const av = a.row[key];
    const bv = b.row[key];
    const aEmpty = isEmpty(av);
    const bEmpty = isEmpty(bv);

    if (aEmpty && bEmpty) return a.index - b.index;
    if (aEmpty) return 1;
    if (bEmpty) return -1;

    const cmp = compareValues(av, bv);
    if (cmp === 0) return a.index - b.index;
    return cmp * dir;
  });

  return indexed.map((entry) => entry.row);
}

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  if (pageSize <= 0) return [];
  if (page < 1) return [];
  const start = (page - 1) * pageSize;
  if (start >= items.length) return [];
  return items.slice(start, start + pageSize);
}
