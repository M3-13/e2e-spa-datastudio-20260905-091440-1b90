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

interface LineChartProps {
  data: ChartDatum[];
  title?: string;
}

function LineChart({ data, title }: LineChartProps) {
  const scale = makeScale(data.map((d) => d.value));
  const y = (value: number) =>
    MARGIN.top + ((scale.max - value) / (scale.max - scale.min)) * INNER_H;
  const x = (index: number) =>
    data.length <= 1
      ? MARGIN.left + INNER_W / 2
      : MARGIN.left + (index / (data.length - 1)) * INNER_W;
  const rotate = data.length > 8;
  const label = title ?? 'Liniendiagramm';

  const linePoints = data.map((d, i) => `${x(i)},${y(d.value)}`).join(' ');
  const areaPoints =
    data.length > 1
      ? `${x(0)},${INNER_H} ${linePoints} ${x(data.length - 1)},${INNER_H}`
      : '';

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
      {areaPoints ? (
        <polygon points={areaPoints} fill="var(--color-accent)" fillOpacity={0.08} />
      ) : null}
      {data.length > 1 ? (
        <polyline
          points={linePoints}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ) : null}
      {data.map((datum, index) => (
        <g key={`${datum.label}-${index}`}>
          <circle cx={x(index)} cy={y(datum.value)} r={3} fill="var(--color-accent)">
            <title>{`${datum.label}: ${datum.value}`}</title>
          </circle>
          {rotate ? (
            <text
              x={x(index)}
              y={INNER_H + 8}
              textAnchor="end"
              fontSize={10}
              fill="var(--color-muted)"
              transform={`rotate(-45 ${x(index)} ${INNER_H + 8})`}
            >
              {truncateLabel(datum.label)}
            </text>
          ) : (
            <text
              x={x(index)}
              y={INNER_H + 18}
              textAnchor="middle"
              fontSize={10}
              fill="var(--color-muted)"
            >
              {truncateLabel(datum.label)}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

export default LineChart;
