import type { CSSProperties } from 'react';
import { useApp } from '../state/store';
import { deriveFilteredRows } from '../lib/derive';
import { deriveChartData } from '../lib/chartData';
import type { Column } from '../types';
import BarChart from './charts/BarChart';
import LineChart from './charts/LineChart';

const styles: Record<string, CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)',
    padding: 'var(--space-3)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: 'var(--color-surface)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--space-2)',
    flexWrap: 'wrap',
  },
  title: {
    margin: 0,
    fontSize: '1rem',
  },
  controls: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'var(--space-1)',
  },
  field: {
    padding: '6px var(--space-1)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-fg)',
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    minHeight: '36px',
  },
  toggleGroup: {
    display: 'inline-flex',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
  },
  toggleButton: {
    padding: '6px var(--space-2)',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--color-muted)',
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    cursor: 'pointer',
    minHeight: '36px',
  },
  toggleButtonActive: {
    backgroundColor: 'var(--color-accent)',
    color: '#ffffff',
  },
  hint: {
    margin: 0,
    color: 'var(--color-muted)',
    fontSize: '0.875rem',
  },
};

function ChartPanel() {
  const { state, actions } = useApp();
  const dataset = state.dataset;

  if (!dataset) {
    return null;
  }

  const visibleColumns = dataset.columns.filter((c) => c.visible);
  const selectableColumns: Column[] =
    visibleColumns.length > 0 ? visibleColumns : dataset.columns;

  const rawKey = state.view.chartKey;
  const chartKey =
    rawKey && selectableColumns.some((c) => c.key === rawKey)
      ? rawKey
      : selectableColumns[0]?.key ?? null;

  const selectedColumn = selectableColumns.find((c) => c.key === chartKey) ?? null;

  const filteredRows = deriveFilteredRows(
    dataset.rows,
    dataset.columns,
    state.view.filters,
    state.view.search,
  );

  const data = chartKey
    ? deriveChartData(filteredRows, chartKey, state.view.chartType)
    : [];

  const chartType = state.view.chartType;

  function toggleType(next: 'bar' | 'line') {
    actions.setChartType(next);
  }

  return (
    <section className="chart-panel" style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Diagramm</h3>
        <div style={styles.controls}>
          <label style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>
            Spalte
            <select
              aria-label="Spalte für Diagramm"
              style={{ ...styles.field, marginLeft: 'var(--space-1)' }}
              value={chartKey ?? ''}
              onChange={(e) => actions.setChartKey(e.target.value || null)}
            >
              {selectableColumns.length === 0 && (
                <option value="">Keine Spalte</option>
              )}
              {selectableColumns.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <div style={styles.toggleGroup} role="group" aria-label="Diagrammtyp">
            <button
              type="button"
              style={
                chartType === 'bar'
                  ? { ...styles.toggleButton, ...styles.toggleButtonActive }
                  : styles.toggleButton
              }
              aria-pressed={chartType === 'bar'}
              onClick={() => toggleType('bar')}
            >
              Balken
            </button>
            <button
              type="button"
              style={
                chartType === 'line'
                  ? { ...styles.toggleButton, ...styles.toggleButtonActive }
                  : styles.toggleButton
              }
              aria-pressed={chartType === 'line'}
              onClick={() => toggleType('line')}
            >
              Linie
            </button>
          </div>
        </div>
      </div>

      {selectedColumn === null ? (
        <p style={styles.hint}>Keine Spalte zum Zeichnen verfügbar.</p>
      ) : chartType === 'bar' ? (
        <BarChart data={data} title={selectedColumn.name} />
      ) : (
        <LineChart data={data} title={selectedColumn.name} />
      )}
    </section>
  );
}

export default ChartPanel;
