import type { CellValue, ChartDatum, Row } from '../types';

const MAX_BUCKETS = 50;
const EMPTY_LABEL = '(leer)';

function toNumber(value: CellValue): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const parsed = Number(String(value).trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function labelOf(value: CellValue): string {
  if (value === null || value === undefined || value === '') return EMPTY_LABEL;
  return String(value);
}

function isNumericColumn(rows: Row[], key: string): boolean {
  let sawValue = false;
  for (const row of rows) {
    const value = row[key];
    if (value === null || value === undefined || value === '') continue;
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) return false;
      sawValue = true;
      continue;
    }
    const parsed = Number(String(value).trim());
    if (!Number.isFinite(parsed)) return false;
    sawValue = true;
  }
  return sawValue;
}

function formatNumber(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return String(Math.round(value * 100) / 100);
}

function frequency(rows: Row[], key: string): ChartDatum[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const label = labelOf(row[key]);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  const entries = [...counts.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  );
  return entries
    .slice(0, MAX_BUCKETS)
    .map(([label, value]) => ({ label, value }));
}

function histogram(rows: Row[], key: string): ChartDatum[] {
  const values: number[] = [];
  for (const row of rows) {
    const value = toNumber(row[key]);
    if (value !== null) values.push(value);
  }
  if (values.length === 0) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) {
    return [{ label: formatNumber(min), value: values.length }];
  }

  const binCount = Math.min(
    MAX_BUCKETS,
    Math.max(1, Math.ceil(Math.sqrt(values.length))),
  );
  const width = (max - min) / binCount;
  const counts = new Array<number>(binCount).fill(0);
  for (const value of values) {
    let index = Math.floor((value - min) / width);
    if (index >= binCount) index = binCount - 1;
    counts[index] += 1;
  }

  const result: ChartDatum[] = [];
  for (let i = 0; i < binCount; i += 1) {
    if (counts[i] === 0) continue;
    const low = min + i * width;
    const high = i === binCount - 1 ? max : low + width;
    result.push({
      label: `${formatNumber(low)}–${formatNumber(high)}`,
      value: counts[i],
    });
  }
  return result;
}

function downsample(points: ChartDatum[]): ChartDatum[] {
  if (points.length <= MAX_BUCKETS) return points;
  const bucketSize = points.length / MAX_BUCKETS;
  const result: ChartDatum[] = [];
  for (let b = 0; b < MAX_BUCKETS; b += 1) {
    const start = Math.floor(b * bucketSize);
    const end = Math.min(points.length, Math.floor((b + 1) * bucketSize));
    if (start >= end) break;
    let sum = 0;
    for (let i = start; i < end; i += 1) sum += points[i].value;
    result.push({
      label: String(start + 1),
      value: Math.round((sum / (end - start)) * 100) / 100,
    });
  }
  return result;
}

function numericLine(rows: Row[], key: string): ChartDatum[] {
  const points: ChartDatum[] = [];
  for (let i = 0; i < rows.length; i += 1) {
    const value = toNumber(rows[i][key]);
    if (value === null) continue;
    points.push({ label: String(i + 1), value });
  }
  return downsample(points);
}

function categoricalLine(rows: Row[], key: string): ChartDatum[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const label = labelOf(row[key]);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()]
    .slice(0, MAX_BUCKETS)
    .map(([label, value]) => ({ label, value }));
}

export function deriveChartData(
  rows: Row[],
  key: string,
  type: 'bar' | 'line',
): ChartDatum[] {
  if (type === 'bar') {
    return isNumericColumn(rows, key) ? histogram(rows, key) : frequency(rows, key);
  }
  return isNumericColumn(rows, key) ? numericLine(rows, key) : categoricalLine(rows, key);
}
