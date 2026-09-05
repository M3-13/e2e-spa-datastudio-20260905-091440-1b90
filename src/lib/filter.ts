import type { Column, FilterCondition, Row } from '../types';

export function filterRows(
  rows: Row[],
  columns: Column[],
  filters: FilterCondition[],
): Row[] {
  void columns;
  void filters;
  return rows;
}
