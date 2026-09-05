import { useMemo } from 'react';
import { deriveFilteredRows } from '../lib/derive';
import { deriveStats } from '../lib/stats';
import { useApp } from '../state/store';

function formatNumber(value: number): string {
  if (Number.isInteger(value)) {
    return value.toLocaleString('de-DE');
  }
  return value.toLocaleString('de-DE', { maximumFractionDigits: 4 });
}

const panelStyle: React.CSSProperties = {
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  backgroundColor: 'var(--color-surface)',
  padding: 'var(--space-3)',
};

const headingStyle: React.CSSProperties = {
  margin: 0,
  marginBottom: 'var(--space-2)',
  fontSize: '1rem',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: 'var(--space-3)',
};

const cardStyle: React.CSSProperties = {
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  backgroundColor: 'var(--color-bg)',
  padding: 'var(--space-2)',
};

const cardTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.875rem',
  fontWeight: 600,
  color: 'var(--color-accent)',
  marginBottom: 'var(--space-1)',
};

const statListStyle: React.CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 'var(--space-0) var(--space-2)',
};

const statLabelStyle: React.CSSProperties = {
  color: 'var(--color-muted)',
  fontSize: '0.8125rem',
};

const statValueStyle: React.CSSProperties = {
  textAlign: 'right',
  fontFamily: 'var(--font-mono)',
  fontSize: '0.8125rem',
};

interface StatEntry {
  label: string;
  value: string;
}

function buildEntries(count: number, sum: number, mean: number, min: number, max: number, missing: number): StatEntry[] {
  return [
    { label: 'Anzahl', value: formatNumber(count) },
    { label: 'Summe', value: formatNumber(sum) },
    { label: 'Mittelwert', value: formatNumber(mean) },
    { label: 'Minimum', value: formatNumber(min) },
    { label: 'Maximum', value: formatNumber(max) },
    { label: 'Fehlend', value: formatNumber(missing) },
  ];
}

function StatsPanel() {
  const { state } = useApp();
  const { dataset, view } = state;

  const stats = useMemo(() => {
    if (!dataset) return [];
    const filtered = deriveFilteredRows(
      dataset.rows,
      dataset.columns,
      view.filters,
      view.search,
    );
    return deriveStats(filtered, dataset.columns);
  }, [dataset, view.filters, view.search]);

  if (!dataset || stats.length === 0) {
    return null;
  }

  const nameByKey = new Map(dataset.columns.map((c) => [c.key, c.name]));

  return (
    <section style={panelStyle} aria-label="Kennzahlen">
      <h2 style={headingStyle}>Kennzahlen</h2>
      <div style={gridStyle}>
        {stats.map((s) => (
          <div key={s.key} style={cardStyle}>
            <h3 style={cardTitleStyle}>{nameByKey.get(s.key) ?? s.key}</h3>
            <ul style={statListStyle}>
              {buildEntries(s.count, s.sum, s.mean, s.min, s.max, s.missing).map((entry) => (
                <li key={entry.label} style={{ display: 'contents' }}>
                  <span style={statLabelStyle}>{entry.label}</span>
                  <span style={statValueStyle}>{entry.value}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export default StatsPanel;
