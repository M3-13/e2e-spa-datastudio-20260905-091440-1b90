import { describe, expect, it } from 'vitest';
import type { Column, Row } from '../types';
import { searchRows } from './search';

const columns: Column[] = [
  { key: 'name', name: 'Name', type: 'text', visible: true },
  { key: 'age', name: 'Age', type: 'number', visible: true },
  { key: 'city', name: 'City', type: 'text', visible: true },
  { key: 'secret', name: 'Secret', type: 'text', visible: false },
];

const rows: Row[] = [
  { name: 'Alice', age: 30, city: 'Berlin', secret: 'hidden-token' },
  { name: 'Bob', age: 25, city: 'Hamburg', secret: 'another-token' },
  { name: 'Carol', age: 35, city: 'München', secret: 'alice-mention' },
];

describe('searchRows', () => {
  it('returns every row for an empty query', () => {
    expect(searchRows(rows, columns, '')).toEqual(rows);
  });

  it('returns every row for a whitespace-only query', () => {
    expect(searchRows(rows, columns, '   ')).toEqual(rows);
  });

  it('matches case-insensitively as a substring', () => {
    expect(searchRows(rows, columns, 'alice')).toEqual([rows[0]]);
    expect(searchRows(rows, columns, 'ALICE')).toEqual([rows[0]]);
  });

  it('searches across all visible columns', () => {
    expect(searchRows(rows, columns, 'berlin')).toEqual([rows[0]]);
    expect(searchRows(rows, columns, 'hamburg')).toEqual([rows[1]]);
  });

  it('matches numeric cell values', () => {
    expect(searchRows(rows, columns, '25')).toEqual([rows[1]]);
  });

  it('ignores hidden columns', () => {
    expect(searchRows(rows, columns, 'hidden-token')).toEqual([]);
  });

  it('ignores null cell values without throwing', () => {
    const withNull: Row[] = [{ name: null, age: 1, city: 'X', secret: null }];
    expect(searchRows(withNull, columns, 'X')).toEqual(withNull);
    expect(searchRows(withNull, columns, 'unfindable')).toEqual([]);
  });

  it('returns no rows when nothing matches', () => {
    expect(searchRows(rows, columns, 'zzz')).toEqual([]);
  });
});
