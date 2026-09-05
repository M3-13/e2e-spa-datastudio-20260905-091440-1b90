import type { CSSProperties } from 'react';
import type { ChartDatum } from '../../types';

interface LineChartProps {
  data: ChartDatum[];
  title: string;
}

const WIDTH = 600;
const HEIGHT = 320;
const MARGIN = { top: 16, right: 16, bottom: 56, left: 56 };

const svgStyle: CSSProperties = {
  width: '100%',
  height: 'auto',
  display: 'block',
};

const axisStyle: CSSProperties = {
  stroke: 'var(--color-border)',
  strokeWidth: 1,
};

const gridStyle: CSSProperties = {
  stroke: 'var(--color-surface-alt)',
  strokeWidth: 1,
};

const axisLabelStyle: CSSProperties = {
  fill: 'var(--color-muted)',
  fontSize: 12,
};

const lineStyle: CSSProperties = {
  fill: 'none',
  stroke: 'var(--color-accent)',
  strokeWidth: 2,
};

const areaStyle: CSSProperties = {
  fill: 'var(--color-accent)',
  fillOpacity: 0.08,
};

const pointStyle: CSSProperties = {
  fill: 'var(--color-accent)',
};

const emptyStyle: CSSProperties = {
  margin: 0,
  color: 'var(--color-muted)',
  fontSize: '0.875rem',
};

function formatTick(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(1).replace(/\.0$/, '');
}

function niceTicks(minValue: number, maxValue: number, count: number): number[] {
  const range = maxValue - minValue;
  if (range <= 0) return [minValue];
  const rawStep = range / count;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const residual = rawStep / magnitude;
  let step: number;
  if (residual >= 5) step = 10 * magnitude;
  else if (residual >= 2) step = 5 * magnitude;
  else if (residual >= 1) step = 2 * magnitude;
  else step = magnitude;
  const start = Math.floor(minValue / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= maxValue + step / 2; v += step) {
    ticks.push(v);
  }
  return ticks;
}

function LineChart({ data, title }: LineChartProps) {
  if (data.length === 0) {
    return <p style={emptyStyle}>Keine Daten für die gewählte Spalte.</p>;
  }

  const values = data.map((d) => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const plotWidth = WIDTH - MARGIN.left - MARGIN.right;
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const ticks = niceTicks(minValue, maxValue, 5);
  const minTick = ticks[0] ?? minValue;
  const maxTick = ticks[ticks.length - 1] ?? maxValue;
  const tickRange = maxTick - minTick || 1;

  const xFor = (index: number) =>
    data.length === 1
      ? MARGIN.left + plotWidth / 2
      : MARGIN.left + (index / (data.length - 1)) * plotWidth;
  const yFor = (value: number) =>
    MARGIN.top + plotHeight - ((value - minTick) / tickRange) * plotHeight;

  const points = data.map((d, i) => `${xFor(i)},${yFor(d.value)}`).join(' ');
  const areaPath =
    data.length > 1
      ? `M ${xFor(0)} ${MARGIN.top + plotHeight} L ${data
          .map((_, i) => `${xFor(i)} ${yFor(data[i].value)}`)
          .join(' L ')} L ${xFor(data.length - 1)} ${
          MARGIN.top + plotHeight
        } Z`
      : '';

  return (
    <svg
      style={svgStyle}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={`Liniendiagramm für ${title}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <title>{`Liniendiagramm für ${title}`}</title>

      {ticks.map((tick) => {
        const y = yFor(tick);
        return (
          <g key={tick}>
            <line
              x1={MARGIN.left}
              y1={y}
              x2={WIDTH - MARGIN.right}
              y2={y}
              style={gridStyle}
            />
            <text
              x={MARGIN.left - 8}
              y={y + 4}
              textAnchor="end"
              style={axisLabelStyle}
            >
              {formatTick(tick)}
            </text>
          </g>
        );
      })}

      <line
        x1={MARGIN.left}
        y1={MARGIN.top + plotHeight}
        x2={WIDTH - MARGIN.right}
        y2={MARGIN.top + plotHeight}
        style={axisStyle}
      />

      {areaPath && <path d={areaPath} style={areaStyle} />}
      <polyline points={points} style={lineStyle} />

      {data.map((d, i) => (
        <g key={`${d.label}-${i}`}>
          <circle
            cx={xFor(i)}
            cy={yFor(d.value)}
            r={3}
            style={pointStyle}
          />
          <title>{`${d.label}: ${d.value}`}</title>
        </g>
      ))}

      <text
        x={WIDTH / 2}
        y={HEIGHT - 12}
        textAnchor="middle"
        style={axisLabelStyle}
      >
        {title}
      </text>
    </svg>
  );
}

export default LineChart;
