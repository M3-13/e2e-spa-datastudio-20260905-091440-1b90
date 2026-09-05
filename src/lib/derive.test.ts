import { describe, expect, it } from 'vitest';
import type { Column, Row } from '../types';
import {
  deriveFilteredRows,
  derivePageRows,
  deriveSortedRows,
} from './derive';

const columns: Column[] = [
  { key: 'name', name: 'Name', type: 'text', visible: true },
  { key: 'age', name: 'Age', type: 'number', visible: true },
];

const rows: Row[] = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
  { name: 'Carol', age: 35 },
];

describe('derive', () => {
  it('returns every row when no filter and no search are active', () => {
    expect(deriveFilteredRows(rows, columns, [], '')).toEqual(rows);
  });

  it('keeps the original order when no sort is set', () => {
    expect(deriveSortedRows(rows, null)).toEqual(rows);
  });

  it('returns the full first page when the page size covers all rows', () => {
    expect(derivePageRows(rows, 1, 25)).toEqual(rows);
  });
});
