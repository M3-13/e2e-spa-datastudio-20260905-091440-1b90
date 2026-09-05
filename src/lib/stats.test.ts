import { describe, expect, it } from 'vitest';
import type { Column, Row } from '../types';
import { deriveStats } from './stats';

const columns: Column[] = [
  { key: 'name', name: 'Name', type: 'text', visible: true },
  { key: 'age', name: 'Age', type: 'number', visible: true },
  { key: 'score', name: 'Score', type: 'number', visible: true },
  { key: 'hidden', name: 'Hidden', type: 'number', visible: false },
];

describe('deriveStats', () => {
  it('computes count, sum, mean, min, max and missing for numeric columns', () => {
    const rows: Row[] = [
      { name: 'Alice', age: 30, score: 1.5, hidden: 1 },
      { name: 'Bob', age: 25, score: 2.5, hidden: 2 },
      { name: 'Carol', age: 35, score: 4, hidden: 3 },
    ];

    const stats = deriveStats(rows, columns);
    expect(stats).toHaveLength(2);

    const age = stats.find((s) => s.key === 'age');
    expect(age).toEqual({
      key: 'age',
      count: 3,
      sum: 90,
      mean: 30,
      min: 25,
      max: 35,
      missing: 0,
    });

    const score = stats.find((s) => s.key === 'score');
    expect(score).toEqual({
      key: 'score',
      count: 3,
      sum: 8,
      mean: 8 / 3,
      min: 1.5,
      max: 4,
      missing: 0,
    });
  });

  it('excludes empty and null values from the numbers but counts them as missing', () => {
    const rows: Row[] = [
      { age: 10 },
      { age: null },
      { age: '' },
      { age: 20 },
      { age: '   ' },
    ];

    const stats = deriveStats(rows, columns);
    const age = stats.find((s) => s.key === 'age');

    expect(age).toEqual({
      key: 'age',
      count: 2,
      sum: 30,
      mean: 15,
      min: 10,
      max: 20,
      missing: 3,
    });
  });

  it('treats non-numeric strings as missing', () => {
    const rows: Row[] = [
      { age: 10 },
      { age: 'abc' },
      { age: 30 },
    ];

    const stats = deriveStats(rows, columns);
    const age = stats.find((s) => s.key === 'age');

    expect(age?.count).toBe(2);
    expect(age?.missing).toBe(1);
    expect(age?.sum).toBe(40);
  });

  it('only reports visible numeric columns and skips text and hidden columns', () => {
    const rows: Row[] = [{ name: 'Alice', age: 30, score: 5, hidden: 9 }];

    const stats = deriveStats(rows, columns);
    const keys = stats.map((s) => s.key);

    expect(keys).toContain('age');
    expect(keys).toContain('score');
    expect(keys).not.toContain('name');
    expect(keys).not.toContain('hidden');
  });

  it('returns zeroed stats for a column with no numeric values', () => {
    const rows: Row[] = [{ age: null }, { age: '' }];

    const stats = deriveStats(rows, columns);
    const age = stats.find((s) => s.key === 'age');

    expect(age).toEqual({
      key: 'age',
      count: 0,
      sum: 0,
      mean: 0,
      min: 0,
      max: 0,
      missing: 2,
    });
  });

  it('returns an empty list when no numeric columns are visible', () => {
    const rows: Row[] = [{ name: 'Alice' }];
    expect(deriveStats(rows, [{ key: 'name', name: 'Name', type: 'text', visible: true }])).toEqual([]);
  });

  it('handles negative and decimal numbers', () => {
    const rows: Row[] = [
      { score: -3 },
      { score: 0 },
      { score: 2.25 },
    ];

    const stats = deriveStats(rows, columns);
    const score = stats.find((s) => s.key === 'score');

    expect(score?.min).toBe(-3);
    expect(score?.max).toBe(2.25);
    expect(score?.sum).toBeCloseTo(-0.75, 10);
    expect(score?.count).toBe(3);
  });
});
