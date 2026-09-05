import { describe, expect, it } from 'vitest';
import type { Column, Row } from '../types';
import { deriveStats } from './stats';

const columns: Column[] = [
  { key: 'age', name: 'Age', type: 'number', visible: true },
  { key: 'name', name: 'Name', type: 'text', visible: true },
  { key: 'hidden', name: 'Hidden', type: 'number', visible: false },
];

describe('deriveStats', () => {
  it('returns stats only for visible numeric columns', () => {
    const rows: Row[] = [{ age: 10, name: 'A', hidden: 99 }];
    const stats = deriveStats(rows, columns);
    expect(stats.map((s) => s.key)).toEqual(['age']);
  });

  it('computes count, sum, mean, min and max over numeric values', () => {
    const rows: Row[] = [
      { age: 10, name: 'A' },
      { age: 20, name: 'B' },
      { age: 30, name: 'C' },
      { age: 40, name: 'D' },
    ];
    const [age] = deriveStats(rows, columns);
    expect(age.count).toBe(4);
    expect(age.sum).toBe(100);
    expect(age.mean).toBe(25);
    expect(age.min).toBe(10);
    expect(age.max).toBe(40);
    expect(age.missing).toBe(0);
  });

  it('excludes null and empty values from aggregates but counts them as missing', () => {
    const rows: Row[] = [
      { age: 10, name: 'A' },
      { age: null, name: 'B' },
      { age: '', name: 'C' },
      { age: 30, name: 'D' },
    ];
    const [age] = deriveStats(rows, columns);
    expect(age.count).toBe(2);
    expect(age.sum).toBe(40);
    expect(age.mean).toBe(20);
    expect(age.min).toBe(10);
    expect(age.max).toBe(30);
    expect(age.missing).toBe(2);
  });

  it('ignores non-numeric string values in a numeric column', () => {
    const rows: Row[] = [
      { age: 5, name: 'A' },
      { age: 'abc', name: 'B' },
      { age: 15, name: 'C' },
    ];
    const [age] = deriveStats(rows, columns);
    expect(age.count).toBe(2);
    expect(age.sum).toBe(20);
    expect(age.mean).toBe(10);
    expect(age.missing).toBe(0);
  });

  it('handles negative and decimal numbers', () => {
    const rows: Row[] = [
      { age: -2.5, name: 'A' },
      { age: 3.75, name: 'B' },
      { age: -1, name: 'C' },
    ];
    const [age] = deriveStats(rows, columns);
    expect(age.sum).toBeCloseTo(0.25);
    expect(age.min).toBeCloseTo(-2.5);
    expect(age.max).toBeCloseTo(3.75);
    expect(age.mean).toBeCloseTo(0.083333, 3);
  });

  it('parses comma decimals in numeric strings', () => {
    const rows: Row[] = [
      { age: '1,5', name: 'A' },
      { age: '2,5', name: 'B' },
    ];
    const [age] = deriveStats(rows, columns);
    expect(age.sum).toBeCloseTo(4);
    expect(age.mean).toBeCloseTo(2);
  });

  it('returns zeroed stats for empty data', () => {
    const [age] = deriveStats([], columns);
    expect(age.count).toBe(0);
    expect(age.sum).toBe(0);
    expect(age.mean).toBe(0);
    expect(age.min).toBe(0);
    expect(age.max).toBe(0);
    expect(age.missing).toBe(0);
  });

  it('returns zeroed aggregates for a column with only missing values', () => {
    const rows: Row[] = [
      { age: null, name: 'A' },
      { age: '', name: 'B' },
    ];
    const [age] = deriveStats(rows, columns);
    expect(age.count).toBe(0);
    expect(age.sum).toBe(0);
    expect(age.mean).toBe(0);
    expect(age.missing).toBe(2);
  });
});
