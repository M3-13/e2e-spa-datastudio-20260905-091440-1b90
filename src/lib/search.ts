import type { Column, Row } from '../types';

export function searchRows(rows: Row[], columns: Column[], query: string): Row[] {
  const q = query.trim().toLowerCase();
  if (q === '') {
    return rows;
  }

  const visibleKeys = columns.filter((c) => c.visible).map((c) => c.key);

  return rows.filter((row) =>
    visibleKeys.some((key) => {
      const value = row[key];
      if (value === null || value === undefined) {
        return false;
      }
      return String(value).toLowerCase().includes(q);
    }),
  );
}
