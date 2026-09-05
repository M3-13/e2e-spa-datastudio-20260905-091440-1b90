import type { Column, FilterCondition, Row, SortConfig } from '../types';
import { filterRows } from './filter';
import { searchRows } from './search';
import { paginate, sortRows } from './sort';

export function deriveFilteredRows(
  rows: Row[],
  columns: Column[],
  filters: FilterCondition[],
  search: string,
): Row[] {
  const filtered = filterRows(rows, columns, filters);
  return searchRows(filtered, columns, search);
}

export function deriveSortedRows(rows: Row[], sort: SortConfig | null): Row[] {
  return sortRows(rows, sort);
}

export function derivePageRows(rows: Row[], page: number, pageSize: number): Row[] {
  return paginate(rows, page, pageSize);
}
