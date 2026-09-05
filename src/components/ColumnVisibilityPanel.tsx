import { useEffect, useRef, type CSSProperties } from 'react';
import { useApp } from '../state/store';

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
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-1)',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    minHeight: '44px',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: 'var(--color-accent)',
  },
  label: {
    fontSize: '0.875rem',
    color: 'var(--color-fg)',
    userSelect: 'none',
  },
  toggleAllButton: {
    padding: '6px var(--space-2)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'transparent',
    color: 'var(--color-accent)',
    cursor: 'pointer',
    minHeight: '32px',
    fontSize: '0.875rem',
  },
};

function ColumnVisibilityPanel() {
  const { state, actions } = useApp();
  const columns = state.dataset?.columns ?? [];
  const allRef = useRef<HTMLInputElement>(null);

  const visibleCount = columns.filter((c) => c.visible).length;
  const allVisible = visibleCount === columns.length;
  const noneVisible = visibleCount === 0;
  const someVisible = visibleCount > 0 && visibleCount < columns.length;

  useEffect(() => {
    if (allRef.current) {
      allRef.current.indeterminate = someVisible;
    }
  }, [someVisible]);

  if (columns.length === 0) {
    return null;
  }

  function handleToggleAll() {
    const target = !allVisible;
    for (const column of columns) {
      if (column.visible !== target) {
        actions.toggleColumn(column.key);
      }
    }
  }

  return (
    <section className="column-visibility-panel" style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Spalten</h3>
        <button
          type="button"
          style={styles.toggleAllButton}
          onClick={handleToggleAll}
        >
          {allVisible ? 'Alle aus' : 'Alle ein'}
        </button>
      </div>

      <label style={styles.item}>
        <input
          ref={allRef}
          type="checkbox"
          style={styles.checkbox}
          checked={allVisible}
          aria-label="Alle Spalten"
          disabled={noneVisible}
          onChange={handleToggleAll}
        />
        <span style={styles.label}>Alle</span>
      </label>

      <div style={styles.list}>
        {columns.map((column) => (
          <label key={column.key} style={styles.item}>
            <input
              type="checkbox"
              style={styles.checkbox}
              checked={column.visible}
              aria-label={`Spalte ${column.name}`}
              onChange={() => actions.toggleColumn(column.key)}
            />
            <span style={styles.label}>{column.name}</span>
          </label>
        ))}
      </div>
    </section>
  );
}

export default ColumnVisibilityPanel;
