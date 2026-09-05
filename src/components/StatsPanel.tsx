import { useMemo, type CSSProperties } from 'react';
import { deriveFilteredRows } from '../lib/derive';
import { deriveStats } from '../lib/stats';
import { useApp } from '../state/store';
import type { ColumnStats } from '../types';

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '–';
  const rounded = Math.round(value * 100) / 100;
  return String(rounded);
}

const styles: Record<string, CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-3)',
  },
  title: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--color-fg)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 'var(--space-3)',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-3)',
    minHeight: '88px',
  },
  columnName: {
    margin: 0,
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--color-fg)',
  },
  metrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 'var(--space-2)',
  },
  metric: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-0)',
  },
  label: {
    fontSize: '0.75rem',
    color: 'var(--color-muted)',
  },
  value: {
    fontSize: '1.375rem',
    fontWeight: 600,
    color: 'var(--color-fg)',
    fontFamily: 'var(--font-mono)',
  },
};

function StatMetric({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.metric}>
      <span style={styles.label}>{label}</span>
      <span style={styles.value}>{value}</span>
    </div>
  );
}

function ColumnCard({ stats, name }: { stats: ColumnStats; name: string }) {
  return (
    <article style={styles.card}>
      <h4 style={styles.columnName}>{name}</h4>
      <div style={styles.metrics}>
        <StatMetric label="Anzahl" value={String(stats.count)} />
        <StatMetric label="Summe" value={formatNumber(stats.sum)} />
        <StatMetric label="Mittelwert" value={formatNumber(stats.mean)} />
        <StatMetric label="Minimum" value={formatNumber(stats.min)} />
        <StatMetric label="Maximum" value={formatNumber(stats.max)} />
        <StatMetric label="Fehlend" value={String(stats.missing)} />
      </div>
    </article>
  );
}

function StatsPanel() {
  const { state } = useApp();
  const dataset = state.dataset;
  const { search, filters } = state.view;

  const stats = useMemo(() => {
    if (!dataset) return [];
    const rows = deriveFilteredRows(
      dataset.rows,
      dataset.columns,
      filters,
      search,
    );
    return deriveStats(rows, dataset.columns);
  }, [dataset, filters, search]);

  if (!dataset || stats.length === 0) {
    return null;
  }

  const nameByKey = new Map(dataset.columns.map((c) => [c.key, c.name]));

  return (
    <section
      className="stats-panel"
      style={styles.container}
      aria-label="Kennzahlen"
    >
      <h3 style={styles.title}>Kennzahlen</h3>
      <div style={styles.grid}>
        {stats.map((s) => (
          <ColumnCard
            key={s.key}
            stats={s}
            name={nameByKey.get(s.key) ?? s.key}
          />
        ))}
      </div>
    </section>
  );
}

export default StatsPanel;
