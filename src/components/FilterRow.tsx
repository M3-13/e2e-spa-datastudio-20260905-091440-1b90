import type { CSSProperties } from 'react';
import { useApp } from '../state/store';
import type { Column, FilterCondition } from '../types';

const TEXT_OPERATORS: { value: FilterCondition['operator']; label: string }[] = [
  { value: 'contains', label: 'enthält' },
  { value: 'equals', label: 'ist gleich' },
];

const NUMBER_OPERATORS: { value: FilterCondition['operator']; label: string }[] = [
  { value: 'equals', label: '=' },
  { value: 'gt', label: '>' },
  { value: 'gte', label: '≥' },
  { value: 'lt', label: '<' },
  { value: 'lte', label: '≤' },
  { value: 'between', label: 'zwischen' },
];

function operatorsFor(type: Column['type']) {
  return type === 'number' ? NUMBER_OPERATORS : TEXT_OPERATORS;
}

function defaultOperator(type: Column['type']): FilterCondition['operator'] {
  return type === 'number' ? 'equals' : 'contains';
}

function isActive(filter: FilterCondition): boolean {
  if (filter.value.trim() === '') return false;
  if (filter.operator === 'between') return (filter.value2 ?? '').trim() !== '';
  return true;
}

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
    gap: 'var(--space-2)',
  },
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'var(--space-1)',
    padding: 'var(--space-2)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--color-bg)',
  },
  rowActive: {
    borderColor: 'var(--color-accent)',
    boxShadow: '0 0 0 1px var(--color-accent)',
  },
  field: {
    padding: '6px var(--space-1)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-fg)',
    fontFamily: 'inherit',
    fontSize: '0.875rem',
  },
  removeButton: {
    padding: '6px var(--space-2)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'transparent',
    color: 'var(--color-danger)',
    cursor: 'pointer',
    minHeight: '32px',
  },
  resetButton: {
    padding: '6px var(--space-2)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'transparent',
    color: 'var(--color-accent)',
    cursor: 'pointer',
    minHeight: '32px',
  },
};

function FilterRow() {
  const { state, actions } = useApp();
  const columns = state.dataset?.columns ?? [];
  const filters = state.view.filters;

  if (columns.length === 0) {
    return null;
  }

  const columnByKey = new Map(columns.map((c) => [c.key, c]));

  const availableColumns = columns.filter(
    (c) => !filters.some((f) => f.key === c.key),
  );

  function addFilter(key: string) {
    const column = columnByKey.get(key);
    if (!column) return;
    actions.addFilter({
      key,
      operator: defaultOperator(column.type),
      value: '',
    });
  }

  function updateFilter(
    index: number,
    patch: Partial<FilterCondition>,
  ) {
    const current = filters[index];
    if (!current) return;
    actions.updateFilter(index, { ...current, ...patch });
  }

  function changeColumn(index: number, key: string) {
    const current = filters[index];
    if (!current) return;
    const column = columnByKey.get(key);
    const nextType = column?.type ?? 'text';
    const operatorStillValid = operatorsFor(nextType).some(
      (o) => o.value === current.operator,
    );
    updateFilter(index, {
      key,
      operator: operatorStillValid ? current.operator : defaultOperator(nextType),
    });
  }

  const hasActive = filters.some(isActive);

  return (
    <section className="filter-row" style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Filter</h3>
        {filters.length > 0 && (
          <button
            type="button"
            style={styles.resetButton}
            onClick={actions.clearFilters}
          >
            Alle Filter zurücksetzen
          </button>
        )}
      </div>

      {filters.length > 0 && (
        <div style={styles.list}>
          {filters.map((filter, index) => {
            const column = columnByKey.get(filter.key);
            const operators = operatorsFor(column?.type ?? 'text');
            const showValue2 = filter.operator === 'between';
            const numericInput =
              column?.type === 'number' &&
              (filter.operator === 'gt' ||
                filter.operator === 'gte' ||
                filter.operator === 'lt' ||
                filter.operator === 'lte' ||
                filter.operator === 'between' ||
                filter.operator === 'equals');

            const rowStyle = isActive(filter)
              ? { ...styles.row, ...styles.rowActive }
              : styles.row;

            return (
              <div key={`${filter.key}-${index}`} style={rowStyle}>
                <select
                  aria-label="Spalte"
                  style={styles.field}
                  value={filter.key}
                  onChange={(e) => changeColumn(index, e.target.value)}
                >
                  {column ? (
                    <option value={column.key}>{column.name}</option>
                  ) : null}
                  {availableColumns
                    .filter((c) => c.key !== filter.key)
                    .map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.name}
                      </option>
                    ))}
                </select>

                <select
                  aria-label="Operator"
                  style={styles.field}
                  value={filter.operator}
                  onChange={(e) =>
                    updateFilter(index, {
                      operator: e.target.value as FilterCondition['operator'],
                    })
                  }
                >
                  {operators.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>

                <input
                  aria-label="Wert"
                  type={numericInput ? 'number' : 'text'}
                  style={styles.field}
                  value={filter.value}
                  placeholder="Wert"
                  onChange={(e) => updateFilter(index, { value: e.target.value })}
                />

                {showValue2 && (
                  <input
                    aria-label="Zweiter Wert"
                    type="number"
                    style={styles.field}
                    value={filter.value2 ?? ''}
                    placeholder="bis"
                    onChange={(e) =>
                      updateFilter(index, { value2: e.target.value })
                    }
                  />
                )}

                <button
                  type="button"
                  style={styles.removeButton}
                  aria-label="Filter entfernen"
                  onClick={() => actions.removeFilter(index)}
                >
                  Entfernen
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div>
        {availableColumns.length > 0 && (
          <select
            aria-label="Bedingung hinzufügen"
            style={styles.field}
            value=""
            onChange={(e) => {
              if (e.target.value) {
                addFilter(e.target.value);
              }
            }}
          >
            <option value="" disabled>
              Bedingung hinzufügen…
            </option>
            {availableColumns.map((c) => (
              <option key={c.key} value={c.key}>
                {c.name}
              </option>
            ))}
          </select>
        )}
        {hasActive && (
          <span style={{ marginLeft: 'var(--space-2)', color: 'var(--color-muted)', fontSize: '0.875rem' }}>
            {filters.filter(isActive).length} aktiv
          </span>
        )}
      </div>
    </section>
  );
}

export default FilterRow;
