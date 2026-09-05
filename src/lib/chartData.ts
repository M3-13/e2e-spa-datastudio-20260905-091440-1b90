import type { CellValue, ChartDatum, Row } from '../types';

const MAX_BUCKETS = 50;

function toNumber(value: CellValue): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (value === null) return null;
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const parsed = Number(trimmed.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

function hasContent(value: CellValue): boolean {
  return value !== null && String(value).trim() !== '';
}

function isNumericColumn(values: CellValue[]): boolean {
  const present = values.filter(hasContent);
  if (present.length === 0) return false;
  return present.every((v) => toNumber(v) !== null);
}

function formatNumber(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2).replace(/\.?0+$/, '');
}

function buildFrequency(values: CellValue[]): ChartDatum[] {
  const counts = new Map<string, number>();
  for (const value of values) {
    if (!hasContent(value)) continue;
    const label = String(value);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, MAX_BUCKETS);
}

function buildHistogram(values: CellValue[]): ChartDatum[] {
  const nums = values
    .map(toNumber)
    .filter((n): n is number => n !== null);

  if (nums.length === 0) return [];

  let min = nums[0];
  let max = nums[0];
  for (const n of nums) {
    if (n < min) min = n;
    if (n > max) max = n;
  }

  if (min === max) {
    return [{ label: formatNumber(min), value: nums.length }];
  }

  const binCount = Math.min(
    MAX_BUCKETS,
    Math.max(1, Math.ceil(Math.sqrt(nums.length))),
  );
  const width = (max - min) / binCount;
  const counts = new Array<number>(binCount).fill(0);

  for (const n of nums) {
    const idx = Math.min(binCount - 1, Math.floor((n - min) / width));
    counts[idx] += 1;
  }

  return counts
    .map((value, i) => {
      const lower = min + i * width;
      const upper = lower + width;
      return {
        label: `${formatNumber(lower)}–${formatNumber(upper)}`,
        value,
      };
    })
    .filter((d) => d.value > 0);
}

function buildLineData(values: CellValue[]): ChartDatum[] {
  const points: ChartDatum[] = [];
  values.forEach((value, index) => {
    const n = toNumber(value);
    if (n !== null) {
      points.push({ label: String(index + 1), value: n });
    }
  });

  if (points.length <= MAX_BUCKETS) return points;

  const buckets: number[][] = Array.from(
    { length: MAX_BUCKETS },
    () => [],
  );
  points.forEach((point, index) => {
    const idx = Math.min(
      MAX_BUCKETS - 1,
      Math.floor((index * MAX_BUCKETS) / points.length),
    );
    buckets[idx].push(point.value);
  });

  return buckets
    .map((bucket, index) => {
      if (bucket.length === 0) return null;
      const sum = bucket.reduce((acc, v) => acc + v, 0);
      return { label: String(index + 1), value: sum / bucket.length };
    })
    .filter((d): d is ChartDatum => d !== null);
}

export function deriveChartData(
  rows: Row[],
  key: string,
  type: 'bar' | 'line',
): ChartDatum[] {
  const values = rows.map((row) => row[key] as CellValue);

  if (type === 'line') {
    return buildLineData(values);
  }

  return isNumericColumn(values)
    ? buildHistogram(values)
    : buildFrequency(values);
}
