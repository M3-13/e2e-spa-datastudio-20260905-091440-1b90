import type { CellValue, Row, SortConfig } from '../types';

function isBlank(value: CellValue): boolean {
  return value === null || value === undefined || value === '';
}

function isNumeric(value: CellValue): boolean {
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed !== '' && !Number.isNaN(Number(trimmed));
  }
  return false;
}

function toNumber(value: CellValue): number {
  return typeof value === 'number' ? value : Number(value);
}

export function sortRows(rows: Row[], sort: SortConfig | null): Row[] {
  if (!sort) return rows;

  const { key, direction } = sort;
  const factor = direction === 'asc' ? 1 : -1;

  return rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      const av = a.row[key];
      const bv = b.row[key];
      const aBlank = isBlank(av);
      const bBlank = isBlank(bv);

      if (aBlank && bBlank) return a.index - b.index;
      if (aBlank) return 1;
      if (bBlank) return -1;

      let cmp: number;
      if (isNumeric(av) && isNumeric(bv)) {
        cmp = toNumber(av) - toNumber(bv);
      } else {
        cmp = String(av).localeCompare(String(bv));
      }

      if (cmp === 0) return a.index - b.index;
      return cmp * factor;
    })
    .map(({ row }) => row);
}

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const safePage = Math.max(1, Math.floor(page));
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const start = (safePage - 1) * safePageSize;
  return items.slice(start, start + safePageSize);
}
