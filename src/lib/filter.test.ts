import { describe, expect, it } from 'vitest';
import type { Column, FilterCondition, Row } from '../types';
import { filterRows } from './filter';

const columns: Column[] = [
  { key: 'name', name: 'Name', type: 'text', visible: true },
  { key: 'age', name: 'Age', type: 'number', visible: true },
];

const rows: Row[] = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
  { name: 'Carol', age: 35 },
  { name: 'alicia', age: 20 },
  { name: null, age: 40 },
];

describe('filterRows', () => {
  it('returns every row when no filters are set', () => {
    expect(filterRows(rows, columns, [])).toEqual(rows);
  });

  it('ignores a filter with an empty value', () => {
    const filters: FilterCondition[] = [
      { key: 'name', operator: 'contains', value: '' },
    ];
    expect(filterRows(rows, columns, filters)).toEqual(rows);
  });

  it('contains is case-insensitive on text columns', () => {
    const filters: FilterCondition[] = [
      { key: 'name', operator: 'contains', value: 'ali' },
    ];
    expect(filterRows(rows, columns, filters)).toEqual([
      { name: 'Alice', age: 30 },
      { name: 'alicia', age: 20 },
    ]);
  });

  it('equals matches text exactly (case-insensitive)', () => {
    const filters: FilterCondition[] = [
      { key: 'name', operator: 'equals', value: 'ALICE' },
    ];
    expect(filterRows(rows, columns, filters)).toEqual([{ name: 'Alice', age: 30 }]);
  });

  it('gt compares numbers numerically', () => {
    const filters: FilterCondition[] = [
      { key: 'age', operator: 'gt', value: '30' },
    ];
    expect(filterRows(rows, columns, filters)).toEqual([
      { name: 'Carol', age: 35 },
      { name: null, age: 40 },
    ]);
  });

  it('gte includes the boundary value', () => {
    const filters: FilterCondition[] = [
      { key: 'age', operator: 'gte', value: '30' },
    ];
    expect(filterRows(rows, columns, filters).map((r) => r.age).sort()).toEqual([
      30, 35, 40,
    ]);
  });

  it('lt and lte compare numerically', () => {
    const lt: FilterCondition[] = [{ key: 'age', operator: 'lt', value: '25' }];
    expect(filterRows(rows, columns, lt).map((r) => r.age)).toEqual([20]);

    const lte: FilterCondition[] = [{ key: 'age', operator: 'lte', value: '25' }];
    expect(filterRows(rows, columns, lte).map((r) => r.age).sort()).toEqual([20, 25]);
  });

  it('between is inclusive and order-independent', () => {
    const filters: FilterCondition[] = [
      { key: 'age', operator: 'between', value: '35', value2: '25' },
    ];
    expect(filterRows(rows, columns, filters).map((r) => r.age).sort()).toEqual([
      25, 30, 35,
    ]);
  });

  it('combines multiple filters with AND', () => {
    const filters: FilterCondition[] = [
      { key: 'name', operator: 'contains', value: 'a' },
      { key: 'age', operator: 'gte', value: '30' },
    ];
    expect(filterRows(rows, columns, filters)).toEqual([
      { name: 'Alice', age: 30 },
      { name: 'Carol', age: 35 },
    ]);
  });

  it('treats null and non-numeric cells as non-matching for numeric operators', () => {
    const local: Row[] = [
      { name: 'A', age: 50 },
      { name: 'B', age: null },
      { name: 'C', age: 'nicht-zahl' },
      { name: 'D', age: 10 },
    ];
    const filters: FilterCondition[] = [
      { key: 'age', operator: 'gt', value: '30' },
    ];
    const names = filterRows(local, columns, filters).map((r) => r.name);
    expect(names).toEqual(['A']);
  });
});
