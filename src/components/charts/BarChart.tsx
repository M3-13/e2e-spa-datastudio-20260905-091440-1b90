import type { CSSProperties } from 'react';
import type { ChartDatum } from '../../types';

interface BarChartProps {
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

const barStyle: CSSProperties = {
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

function niceTicks(maxValue: number, count: number): number[] {
  if (maxValue <= 0) return [0];
  const rawStep = maxValue / count;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const residual = rawStep / magnitude;
  let step: number;
  if (residual >= 5) step = 10 * magnitude;
  else if (residual >= 2) step = 5 * magnitude;
  else if (residual >= 1) step = 2 * magnitude;
  else step = magnitude;
  const ticks: number[] = [];
  for (let v = 0; v <= maxValue + step / 2; v += step) {
    ticks.push(v);
  }
  return ticks;
}

function BarChart({ data, title }: BarChartProps) {
  if (data.length === 0) {
    return <p style={emptyStyle}>Keine Daten für die gewählte Spalte.</p>;
  }

  const maxValue = Math.max(...data.map((d) => d.value), 0);
  const plotWidth = WIDTH - MARGIN.left - MARGIN.right;
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const ticks = niceTicks(maxValue, 5);
  const maxTick = ticks[ticks.length - 1] ?? maxValue;
  const barGap = Math.min(12, plotWidth / data.length / 4);
  const barWidth = Math.max(1, plotWidth / data.length - barGap);
  const yFor = (value: number) =>
    MARGIN.top + plotHeight - (value / maxTick) * plotHeight;

  return (
    <svg
      style={svgStyle}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={`Balkendiagramm für ${title}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <title>{`Balkendiagramm für ${title}`}</title>

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

      {data.map((d, i) => {
        const barHeight = plotHeight - (yFor(d.value) - MARGIN.top);
        const x = MARGIN.left + i * (plotWidth / data.length) + barGap / 2;
        const y = MARGIN.top + plotHeight - barHeight;
        return (
          <g key={`${d.label}-${i}`}>
            <rect
              x={x}
              y={y}
              width={Math.max(barWidth, 1)}
              height={Math.max(barHeight, 0)}
              rx={2}
              style={barStyle}
            />
            <title>{`${d.label}: ${d.value}`}</title>
          </g>
        );
      })}

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

export default BarChart;
