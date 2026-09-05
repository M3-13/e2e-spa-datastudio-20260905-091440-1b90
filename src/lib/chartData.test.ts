import { describe, expect, it } from 'vitest';
import type { Row } from '../types';
import { deriveChartData } from './chartData';

describe('deriveChartData', () => {
  it('counts categorical frequencies and sorts them descending for bars', () => {
    const rows: Row[] = [
      { category: 'Apfel' },
      { category: 'Birne' },
      { category: 'Apfel' },
      { category: 'Kirsche' },
      { category: 'Apfel' },
      { category: 'Birne' },
    ];
    const data = deriveChartData(rows, 'category', 'bar');
    expect(data).toEqual([
      { label: 'Apfel', value: 3 },
      { label: 'Birne', value: 2 },
      { label: 'Kirsche', value: 1 },
    ]);
  });

  it('ignores null and empty values for categorical bars', () => {
    const rows: Row[] = [
      { category: 'A' },
      { category: null },
      { category: '' },
      { category: '   ' },
      { category: 'A' },
    ];
    const data = deriveChartData(rows, 'category', 'bar');
    expect(data).toEqual([{ label: 'A', value: 2 }]);
  });

  it('returns an empty array for a column with no values', () => {
    const rows: Row[] = [
      { x: null },
      { x: '' },
      { x: '   ' },
    ];
    expect(deriveChartData(rows, 'x', 'bar')).toEqual([]);
    expect(deriveChartData(rows, 'x', 'line')).toEqual([]);
  });

  it('bins numeric values into a histogram for bars', () => {
    const rows: Row[] = [1, 2, 3, 10, 11, 12, 20, 21, 22].map((n) => ({
      amount: n,
    }));
    const data = deriveChartData(rows, 'amount', 'bar');
    const total = data.reduce((acc, d) => acc + d.value, 0);
    expect(total).toBe(9);
    expect(data.length).toBeGreaterThan(1);
    expect(data.length).toBeLessThanOrEqual(50);
  });

  it('handles a single numeric value without error', () => {
    const rows: Row[] = [{ amount: 5 }, { amount: 5 }, { amount: 5 }];
    const data = deriveChartData(rows, 'amount', 'bar');
    expect(data).toEqual([{ label: '5', value: 3 }]);
  });

  it('produces a line of values in row order', () => {
    const rows: Row[] = [
      { year: 2019, value: 10 },
      { year: 2020, value: 20 },
      { year: 2021, value: 15 },
    ];
    const data = deriveChartData(rows, 'value', 'line');
    expect(data.map((d) => d.value)).toEqual([10, 20, 15]);
    expect(data.map((d) => d.label)).toEqual(['1', '2', '3']);
  });

  it('skips non-numeric cells in a line series but keeps row order', () => {
    const rows: Row[] = [
      { value: 10 },
      { value: null },
      { value: 'nicht-zahl' },
      { value: 30 },
    ];
    const data = deriveChartData(rows, 'value', 'line');
    expect(data.map((d) => d.value)).toEqual([10, 30]);
    expect(data.map((d) => d.label)).toEqual(['1', '4']);
  });

  it('caps categorical bars at 50 buckets', () => {
    const rows: Row[] = [];
    for (let i = 0; i < 200; i += 1) {
      rows.push({ category: `Wert ${i}` });
    }
    const data = deriveChartData(rows, 'category', 'bar');
    expect(data.length).toBe(50);
  });

  it('caps a long line series at 50 points', () => {
    const rows: Row[] = Array.from({ length: 500 }, (_, i) => ({ value: i }));
    const data = deriveChartData(rows, 'value', 'line');
    expect(data.length).toBe(50);
  });

  it('treats a text column as empty for a line chart', () => {
    const rows: Row[] = [{ name: 'A' }, { name: 'B' }];
    expect(deriveChartData(rows, 'name', 'line')).toEqual([]);
  });

  it('parses numeric strings for a line chart', () => {
    const rows: Row[] = [{ value: '10' }, { value: '20.5' }, { value: '30' }];
    const data = deriveChartData(rows, 'value', 'line');
    expect(data.map((d) => d.value)).toEqual([10, 20.5, 30]);
  });
});
