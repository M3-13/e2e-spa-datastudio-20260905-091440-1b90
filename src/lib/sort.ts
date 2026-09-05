import type { Row, SortConfig } from '../types';

export function sortRows(rows: Row[], sort: SortConfig | null): Row[] {
  void sort;
  return rows;
}

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  void page;
  void pageSize;
  return items;
}
