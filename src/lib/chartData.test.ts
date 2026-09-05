import { describe, expect, it } from 'vitest';
import type { Row } from '../types';
import { deriveChartData } from './chartData';

describe('deriveChartData', () => {
  it('counts frequencies of categorical values for a bar chart', () => {
    const rows: Row[] = [
      { c: 'a' },
      { c: 'b' },
      { c: 'a' },
      { c: 'a' },
      { c: 'b' },
    ];
    expect(deriveChartData(rows, 'c', 'bar')).toEqual([
      { label: 'a', value: 3 },
      { label: 'b', value: 2 },
    ]);
  });

  it('bins numeric values for a bar chart', () => {
    const rows: Row[] = Array.from({ length: 10 }, (_, i) => ({ n: i }));
    const data = deriveChartData(rows, 'n', 'bar');
    const total = data.reduce((sum, d) => sum + d.value, 0);
    expect(total).toBe(10);
    expect(data.length).toBeGreaterThan(1);
  });

  it('produces a value progression in row order for a line chart', () => {
    const rows: Row[] = [{ n: 3 }, { n: 1 }, { n: 2 }];
    const data = deriveChartData(rows, 'n', 'line');
    expect(data.map((d) => d.value)).toEqual([3, 1, 2]);
    expect(data.map((d) => d.label)).toEqual(['1', '2', '3']);
  });

  it('aggregates categorical frequencies in first-appearance order for a line chart', () => {
    const rows: Row[] = [{ c: 'x' }, { c: 'y' }, { c: 'x' }];
    expect(deriveChartData(rows, 'c', 'line')).toEqual([
      { label: 'x', value: 2 },
      { label: 'y', value: 1 },
    ]);
  });

  it('caps categorical bars at 50 entries', () => {
    const rows: Row[] = Array.from({ length: 100 }, (_, i) => ({ c: `g${i}` }));
    expect(deriveChartData(rows, 'c', 'bar').length).toBe(50);
  });

  it('caps numeric line points at 50', () => {
    const rows: Row[] = Array.from({ length: 100 }, (_, i) => ({ n: i }));
    expect(deriveChartData(rows, 'n', 'line').length).toBeLessThanOrEqual(50);
  });

  it('treats null and empty values as the empty category', () => {
    const rows: Row[] = [{ c: null }, { c: '' }, { c: 'a' }];
    expect(deriveChartData(rows, 'c', 'bar')).toEqual([
      { label: '(leer)', value: 2 },
      { label: 'a', value: 1 },
    ]);
  });

  it('returns an empty list for no rows', () => {
    expect(deriveChartData([], 'n', 'bar')).toEqual([]);
    expect(deriveChartData([], 'n', 'line')).toEqual([]);
  });
});
