import { describe, expect, it } from 'vitest';
import type { Row, SortConfig } from '../types';
import { paginate, sortRows } from './sort';

describe('sortRows', () => {
  it('returns a copy in original order when no sort is set', () => {
    const rows: Row[] = [{ v: 'b' }, { v: 'a' }];
    const result = sortRows(rows, null);
    expect(result).toEqual(rows);
    expect(result).not.toBe(rows);
  });

  it('sorts text values ascending', () => {
    const rows: Row[] = [{ v: 'banana' }, { v: 'apple' }, { v: 'cherry' }];
    const sort: SortConfig = { key: 'v', direction: 'asc' };
    expect(sortRows(rows, sort).map((r) => r.v)).toEqual([
      'apple',
      'banana',
      'cherry',
    ]);
  });

  it('sorts text values descending', () => {
    const rows: Row[] = [{ v: 'apple' }, { v: 'cherry' }, { v: 'banana' }];
    const sort: SortConfig = { key: 'v', direction: 'desc' };
    expect(sortRows(rows, sort).map((r) => r.v)).toEqual([
      'cherry',
      'banana',
      'apple',
    ]);
  });

  it('sorts numeric strings numerically, not lexically', () => {
    const rows: Row[] = [{ v: '10' }, { v: '2' }, { v: '1' }];
    const sort: SortConfig = { key: 'v', direction: 'asc' };
    expect(sortRows(rows, sort).map((r) => r.v)).toEqual(['1', '2', '10']);
  });

  it('sorts number values numerically', () => {
    const rows: Row[] = [{ v: 30 }, { v: 5 }, { v: 100 }];
    const sort: SortConfig = { key: 'v', direction: 'asc' };
    expect(sortRows(rows, sort).map((r) => r.v)).toEqual([5, 30, 100]);
  });

  it('sorts mixed numeric strings with decimal comma', () => {
    const rows: Row[] = [{ v: '1,5' }, { v: '2' }, { v: '0,5' }];
    const sort: SortConfig = { key: 'v', direction: 'asc' };
    expect(sortRows(rows, sort).map((r) => r.v)).toEqual(['0,5', '1,5', '2']);
  });

  it('places empty values at the end regardless of direction', () => {
    const rows: Row[] = [
      { v: 'a' },
      { v: null },
      { v: '' },
      { v: '  ' },
      { v: 'b' },
    ];
    const asc: SortConfig = { key: 'v', direction: 'asc' };
    expect(sortRows(rows, asc).map((r) => r.v)).toEqual(['a', 'b', null, '', '  ']);

    const desc: SortConfig = { key: 'v', direction: 'desc' };
    expect(sortRows(rows, desc).map((r) => r.v)).toEqual(['b', 'a', null, '', '  ']);
  });

  it('is stable for equal values', () => {
    const rows: Row[] = [
      { v: 'x', id: 1 },
      { v: 'x', id: 2 },
      { v: 'x', id: 3 },
    ];
    const sort: SortConfig = { key: 'v', direction: 'asc' };
    expect(sortRows(rows, sort).map((r) => r.id)).toEqual([1, 2, 3]);
  });

  it('keeps original order for equal values in descending too', () => {
    const rows: Row[] = [
      { v: 'x', id: 1 },
      { v: 'x', id: 2 },
    ];
    const sort: SortConfig = { key: 'v', direction: 'desc' };
    expect(sortRows(rows, sort).map((r) => r.id)).toEqual([1, 2]);
  });

  it('does not mutate the input array', () => {
    const rows: Row[] = [{ v: 'b' }, { v: 'a' }];
    const snapshot = [...rows];
    sortRows(rows, { key: 'v', direction: 'asc' });
    expect(rows).toEqual(snapshot);
  });
});

describe('paginate', () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  it('returns the first page', () => {
    expect(paginate(items, 1, 4)).toEqual([1, 2, 3, 4]);
  });

  it('returns a middle page', () => {
    expect(paginate(items, 2, 4)).toEqual([5, 6, 7, 8]);
  });

  it('returns a short final page', () => {
    expect(paginate(items, 3, 4)).toEqual([9, 10]);
  });

  it('returns an empty array for a page beyond the range', () => {
    expect(paginate(items, 4, 4)).toEqual([]);
    expect(paginate(items, 99, 4)).toEqual([]);
  });

  it('returns an empty array for a non-positive page', () => {
    expect(paginate(items, 0, 4)).toEqual([]);
    expect(paginate(items, -1, 4)).toEqual([]);
  });

  it('returns an empty array for a non-positive page size', () => {
    expect(paginate(items, 1, 0)).toEqual([]);
    expect(paginate(items, 1, -5)).toEqual([]);
  });

  it('returns the whole list when page size covers it', () => {
    expect(paginate(items, 1, 100)).toEqual(items);
  });

  it('returns an empty array for empty input', () => {
    expect(paginate([], 1, 10)).toEqual([]);
  });
});
