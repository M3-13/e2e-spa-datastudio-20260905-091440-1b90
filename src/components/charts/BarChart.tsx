import type { ChartDatum } from '../../types';

const WIDTH = 720;
const HEIGHT = 340;
const MARGIN = { top: 16, right: 16, bottom: 56, left: 52 };
const INNER_W = WIDTH - MARGIN.left - MARGIN.right;
const INNER_H = HEIGHT - MARGIN.top - MARGIN.bottom;

function niceStep(raw: number): number {
  if (raw <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
  const normalized = raw / magnitude;
  let nice: number;
  if (normalized <= 1) nice = 1;
  else if (normalized <= 2) nice = 2;
  else if (normalized <= 2.5) nice = 2.5;
  else if (normalized <= 5) nice = 5;
  else nice = 10;
  return nice * magnitude;
}

function formatTick(value: number): string {
  if (Number.isInteger(value)) return String(value);
  const abs = Math.abs(value);
  const decimals = abs >= 100 ? 0 : abs >= 1 ? 1 : 2;
  return value.toFixed(decimals);
}

function truncateLabel(label: string, max = 12): string {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label;
}

interface Scale {
  min: number;
  max: number;
  ticks: number[];
}

function makeScale(values: number[]): Scale {
  let min = Math.min(0, ...values);
  let max = Math.max(0, ...values);
  if (min === max) max = min + 1;
  const step = niceStep((max - min) / 4);
  const tickMin = Math.floor(min / step) * step;
  const tickMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = tickMin; v <= tickMax + step * 1e-6; v += step) {
    ticks.push(Math.abs(v) < 1e-9 ? 0 : v);
  }
  return { min: tickMin, max: tickMax, ticks };
}

interface BarChartProps {
  data: ChartDatum[];
  title?: string;
}

function BarChart({ data, title }: BarChartProps) {
  const scale = makeScale(data.map((d) => d.value));
  const y = (value: number) =>
    MARGIN.top + ((scale.max - value) / (scale.max - scale.min)) * INNER_H;
  const band = data.length > 0 ? INNER_W / data.length : 0;
  const barWidth = data.length > 0 ? Math.min(Math.max(1, band * 0.8), 48) : 1;
  const rotate = data.length > 8;
  const label = title ?? 'Balkendiagramm';

  return (
    <svg
      className="chart"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={label}
      preserveAspectRatio="xMidYMid meet"
    >
      {scale.ticks.map((tick) => (
        <g key={tick}>
          <line
            x1={MARGIN.left}
            x2={WIDTH - MARGIN.right}
            y1={y(tick)}
            y2={y(tick)}
            stroke="var(--color-border)"
            strokeOpacity={0.4}
          />
          <text
            x={MARGIN.left - 8}
            y={y(tick)}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize={11}
            fill="var(--color-muted)"
          >
            {formatTick(tick)}
          </text>
        </g>
      ))}
      <line
        x1={MARGIN.left}
        y1={INNER_H}
        x2={WIDTH - MARGIN.right}
        y2={INNER_H}
        stroke="var(--color-border)"
      />
      <line
        x1={MARGIN.left}
        y1={MARGIN.top}
        x2={MARGIN.left}
        y2={INNER_H}
        stroke="var(--color-border)"
      />
      {data.map((datum, index) => {
        const centerX = MARGIN.left + index * band + band / 2;
        const barTop = y(datum.value);
        const height = INNER_H - barTop;
        const x = centerX - barWidth / 2;
        return (
          <g key={`${datum.label}-${index}`}>
            <rect
              x={x}
              y={barTop}
              width={barWidth}
              height={height}
              fill="var(--color-accent)"
              rx={2}
            >
              <title>{`${datum.label}: ${datum.value}`}</title>
            </rect>
            {rotate ? (
              <text
                x={centerX}
                y={INNER_H + 8}
                textAnchor="end"
                fontSize={10}
                fill="var(--color-muted)"
                transform={`rotate(-45 ${centerX} ${INNER_H + 8})`}
              >
                {truncateLabel(datum.label)}
              </text>
            ) : (
              <text
                x={centerX}
                y={INNER_H + 18}
                textAnchor="middle"
                fontSize={10}
                fill="var(--color-muted)"
              >
                {truncateLabel(datum.label)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default BarChart;
