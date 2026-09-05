import { describe, expect, it } from 'vitest';
import type { Row, SortConfig } from '../types';
import { paginate, sortRows } from './sort';

const rows: Row[] = [
  { name: 'Charlie', age: 35 },
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
  { name: 'Alice', age: 20 },
];

describe('sortRows', () => {
  it('returns the original array unchanged when no sort is configured', () => {
    expect(sortRows(rows, null)).toEqual(rows);
  });

  it('sorts number columns numerically in ascending order', () => {
    const sort: SortConfig = { key: 'age', direction: 'asc' };
    const result = sortRows(rows, sort);
    expect(result.map((r) => r.age)).toEqual([20, 25, 30, 35]);
  });

  it('sorts number columns numerically in descending order', () => {
    const sort: SortConfig = { key: 'age', direction: 'desc' };
    const result = sortRows(rows, sort);
    expect(result.map((r) => r.age)).toEqual([35, 30, 25, 20]);
  });

  it('sorts text columns using string comparison', () => {
    const sort: SortConfig = { key: 'name', direction: 'asc' };
    const result = sortRows(rows, sort);
    expect(result.map((r) => r.name)).toEqual([
      'Alice',
      'Alice',
      'Bob',
      'Charlie',
    ]);
  });

  it('compares numeric strings numerically, not lexically', () => {
    const numeric: Row[] = [
      { value: '10' },
      { value: '2' },
      { value: '1' },
      { value: '20' },
    ];
    const sort: SortConfig = { key: 'value', direction: 'asc' };
    const result = sortRows(numeric, sort);
    expect(result.map((r) => r.value)).toEqual(['1', '2', '10', '20']);
  });

  it('keeps blank values at the end regardless of direction', () => {
    const withBlanks: Row[] = [
      { name: 'B', age: null },
      { name: 'A', age: 30 },
      { name: 'C', age: null },
      { name: 'D', age: 10 },
    ];
    const asc = sortRows(withBlanks, { key: 'age', direction: 'asc' });
    expect(asc.map((r) => r.name)).toEqual(['D', 'A', 'B', 'C']);

    const desc = sortRows(withBlanks, { key: 'age', direction: 'desc' });
    expect(desc.map((r) => r.name)).toEqual(['A', 'D', 'B', 'C']);
  });

  it('sorts stably, preserving original order for equal keys', () => {
    const stable: Row[] = [
      { name: 'x', age: 30 },
      { name: 'first', age: 25 },
      { name: 'y', age: 30 },
      { name: 'second', age: 25 },
    ];
    const result = sortRows(stable, { key: 'age', direction: 'asc' });
    expect(result).toEqual([
      { name: 'first', age: 25 },
      { name: 'second', age: 25 },
      { name: 'x', age: 30 },
      { name: 'y', age: 30 },
    ]);
  });
});

describe('paginate', () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  it('returns the first page slice', () => {
    expect(paginate(items, 1, 3)).toEqual([1, 2, 3]);
  });

  it('returns a middle page slice', () => {
    expect(paginate(items, 2, 3)).toEqual([4, 5, 6]);
  });

  it('returns the last, possibly short, page', () => {
    expect(paginate(items, 4, 3)).toEqual([10]);
  });

  it('returns an empty array when the page is out of range', () => {
    expect(paginate(items, 99, 3)).toEqual([]);
  });

  it('returns everything when the page size covers all items', () => {
    expect(paginate(items, 1, 25)).toEqual(items);
  });

  it('treats page 0 or negative pages as the first page', () => {
    expect(paginate(items, 0, 3)).toEqual([1, 2, 3]);
    expect(paginate(items, -2, 3)).toEqual([1, 2, 3]);
  });
});
