import { useMemo, useState, type CSSProperties } from 'react';
import { deriveFilteredRows, derivePageRows, deriveSortedRows } from '../lib/derive';
import { useApp } from '../state/store';
import type { CellValue } from '../types';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const styles: Record<string, CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)',
  },
  scroll: {
    overflowX: 'auto',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: 'var(--color-bg)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  th: {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    background: 'var(--color-surface)',
    color: 'var(--color-muted)',
    fontWeight: 600,
    fontSize: '13px',
    padding: '10px 16px',
    textAlign: 'left',
    borderBottom: '1px solid var(--color-border)',
    whiteSpace: 'nowrap',
  },
  thNumeric: {
    textAlign: 'right',
  },
  headerButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    background: 'transparent',
    border: 'none',
    padding: 0,
    margin: 0,
    color: 'inherit',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    minHeight: '32px',
  },
  arrow: {
    fontSize: '14px',
    lineHeight: 1,
    color: 'var(--color-accent)',
  },
  td: {
    padding: '10px 16px',
    color: 'var(--color-fg)',
    borderBottom: '1px solid var(--color-surface-alt)',
    whiteSpace: 'nowrap',
  },
  tdNumeric: {
    textAlign: 'right',
    fontFamily: 'var(--font-mono)',
  },
  rowHover: {
    backgroundColor: 'var(--color-surface)',
  },
  empty: {
    padding: 'var(--space-4)',
    color: 'var(--color-muted)',
    textAlign: 'center',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--space-2)',
    flexWrap: 'wrap',
  },
  pageControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
  },
  pageButton: {
    minWidth: '36px',
    minHeight: '36px',
    padding: '0 var(--space-2)',
    borderRadius: 'var(--radius-md)',
    background: 'transparent',
    border: 'none',
    color: 'var(--color-fg)',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: 'inherit',
  },
  pageButtonActive: {
    background: 'var(--color-accent)',
    color: '#FFFFFF',
  },
  pageButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  pageSize: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
  },
  pageSizeLabel: {
    color: 'var(--color-muted)',
    fontSize: '13px',
  },
  pageSizeSelect: {
    minHeight: '36px',
    padding: '0 var(--space-2)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-bg)',
    color: 'var(--color-fg)',
    fontSize: '14px',
    fontFamily: 'inherit',
  },
  info: {
    color: 'var(--color-muted)',
    fontSize: '13px',
  },
};

function cellText(value: CellValue): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

function pageNumbers(current: number, total: number): number[] {
  const pages: number[] = [];
  const start = Math.max(1, current - 3);
  const end = Math.min(total, current + 3);
  for (let p = start; p <= end; p += 1) {
    pages.push(p);
  }
  return pages;
}

function DataTable() {
  const { state, actions } = useApp();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const dataset = state.dataset;
  const view = state.view;

  const columns = dataset?.columns ?? [];
  const rows = dataset?.rows ?? [];

  const visibleColumns = useMemo(
    () => columns.filter((c) => c.visible),
    [columns],
  );

  const filtered = useMemo(
    () => deriveFilteredRows(rows, columns, view.filters, view.search),
    [rows, columns, view.filters, view.search],
  );

  const sorted = useMemo(
    () => deriveSortedRows(filtered, view.sort),
    [filtered, view.sort],
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / view.pageSize));

  const pageRows = useMemo(
    () => derivePageRows(sorted, view.page, view.pageSize),
    [sorted, view.page, view.pageSize],
  );

  if (!dataset || rows.length === 0) {
    return null;
  }

  function toggleSort(key: string) {
    const current = view.sort;
    if (current && current.key === key) {
      actions.setSort({
        key,
        direction: current.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      actions.setSort({ key, direction: 'asc' });
    }
  }

  function sortAria(direction: 'asc' | 'desc' | null): 'ascending' | 'descending' | 'none' {
    if (direction === 'asc') return 'ascending';
    if (direction === 'desc') return 'descending';
    return 'none';
  }

  const start = (view.page - 1) * view.pageSize + 1;
  const end = Math.min(view.page * view.pageSize, sorted.length);

  return (
    <section className="data-table" style={styles.container}>
      {visibleColumns.length === 0 ? (
        <div style={styles.empty}>Keine sichtbaren Spalten</div>
      ) : (
        <div style={styles.scroll}>
          <table style={styles.table}>
            <thead>
              <tr>
                {visibleColumns.map((column) => {
                  const isSorted = view.sort?.key === column.key;
                  const direction = isSorted ? view.sort?.direction ?? null : null;
                  const isNumeric = column.type === 'number';
                  return (
                    <th
                      key={column.key}
                      scope="col"
                      aria-sort={sortAria(direction)}
                      style={isNumeric ? { ...styles.th, ...styles.thNumeric } : styles.th}
                    >
                      <button
                        type="button"
                        style={styles.headerButton}
                        onClick={() => toggleSort(column.key)}
                        aria-label={`Nach ${column.name} sortieren`}
                      >
                        <span>{column.name}</span>
                        {direction && (
                          <span style={styles.arrow} aria-hidden="true">
                            {direction === 'asc' ? '▲' : '▼'}
                          </span>
                        )}
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length} style={styles.empty}>
                    Keine Daten
                  </td>
                </tr>
              ) : (
                pageRows.map((row, index) => {
                  const globalIndex = (view.page - 1) * view.pageSize + index;
                  const rowStyle =
                    hoveredIndex === globalIndex ? styles.rowHover : undefined;
                  return (
                    <tr
                      key={globalIndex}
                      style={rowStyle}
                      onMouseEnter={() => setHoveredIndex(globalIndex)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {visibleColumns.map((column) => {
                        const isNumeric = column.type === 'number';
                        return (
                          <td
                            key={column.key}
                            style={isNumeric ? { ...styles.td, ...styles.tdNumeric } : styles.td}
                          >
                            {cellText(row[column.key])}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      <div style={styles.pagination}>
        <div style={styles.info}>
          {sorted.length === 0
            ? '0 Einträge'
            : `${start}–${end} von ${sorted.length}`}
        </div>

        <div style={styles.pageControls}>
          <button
            type="button"
            style={
              view.page <= 1
                ? { ...styles.pageButton, ...styles.pageButtonDisabled }
                : styles.pageButton
            }
            disabled={view.page <= 1}
            onClick={() => actions.setPage(view.page - 1)}
            aria-label="Vorherige Seite"
          >
            ‹
          </button>

          {pageNumbers(view.page, totalPages).map((p) => (
            <button
              key={p}
              type="button"
              style={
                p === view.page
                  ? { ...styles.pageButton, ...styles.pageButtonActive }
                  : styles.pageButton
              }
              aria-current={p === view.page ? 'page' : undefined}
              onClick={() => actions.setPage(p)}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            style={
              view.page >= totalPages
                ? { ...styles.pageButton, ...styles.pageButtonDisabled }
                : styles.pageButton
            }
            disabled={view.page >= totalPages}
            onClick={() => actions.setPage(view.page + 1)}
            aria-label="Nächste Seite"
          >
            ›
          </button>
        </div>

        <div style={styles.pageSize}>
          <label style={styles.pageSizeLabel} htmlFor="page-size-select">
            Zeilen pro Seite
          </label>
          <select
            id="page-size-select"
            style={styles.pageSizeSelect}
            value={view.pageSize}
            onChange={(e) => actions.setPageSize(Number(e.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}

export default DataTable;
