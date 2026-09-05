import { useMemo } from 'react';
import { useApp } from '../state/store';
import {
  deriveFilteredRows,
  derivePageRows,
  deriveSortedRows,
} from '../lib/derive';
import type { CellValue, Column, SortConfig } from '../types';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function formatCell(value: CellValue): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

function arrowFor(columnKey: string, sort: SortConfig | null): string {
  if (!sort || sort.key !== columnKey) return '';
  return sort.direction === 'asc' ? '\u25B2' : '\u25BC';
}

function ariaSortFor(
  columnKey: string,
  sort: SortConfig | null,
): 'ascending' | 'descending' | 'none' {
  if (!sort || sort.key !== columnKey) return 'none';
  return sort.direction === 'asc' ? 'ascending' : 'descending';
}

export default function DataTable() {
  const { state, actions } = useApp();
  const { dataset, view } = state;

  const visibleColumns = useMemo<Column[]>(
    () => (dataset ? dataset.columns.filter((c) => c.visible) : []),
    [dataset],
  );

  const pageRows = useMemo(() => {
    if (!dataset) return [];
    const filtered = deriveFilteredRows(
      dataset.rows,
      dataset.columns,
      view.filters,
      view.search,
    );
    const sorted = deriveSortedRows(filtered, view.sort);
    return derivePageRows(sorted, view.page, view.pageSize);
  }, [dataset, view.filters, view.search, view.sort, view.page, view.pageSize]);

  const totalRows = useMemo(() => {
    if (!dataset) return 0;
    const filtered = deriveFilteredRows(
      dataset.rows,
      dataset.columns,
      view.filters,
      view.search,
    );
    return filtered.length;
  }, [dataset, view.filters, view.search]);

  if (!dataset) {
    return null;
  }

  const totalPages = Math.max(1, Math.ceil(totalRows / view.pageSize));
  const currentPage = Math.min(view.page, totalPages);

  const handleSort = (key: string) => {
    const current = view.sort;
    if (current && current.key === key) {
      actions.setSort({
        key,
        direction: current.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      actions.setSort({ key, direction: 'asc' });
    }
  };

  const handlePageChange = (page: number) => {
    actions.setPage(Math.min(Math.max(1, page), totalPages));
  };

  const handlePageSizeChange = (pageSize: number) => {
    actions.setPageSize(pageSize);
  };

  return (
    <div style={styles.container}>
      <div style={styles.scroll}>
        <table style={styles.table}>
          <thead>
            <tr>
              {visibleColumns.map((column) => {
                const sort = view.sort;
                const active = sort !== null && sort.key === column.key;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={ariaSortFor(column.key, sort)}
                    style={styles.th}
                  >
                    <button
                      type="button"
                      onClick={() => handleSort(column.key)}
                      style={{
                        ...styles.headerButton,
                        ...(active ? styles.headerButtonActive : {}),
                      }}
                      aria-label={`${column.name} sortieren`}
                    >
                      <span style={styles.headerText}>{column.name}</span>
                      <span
                        style={styles.arrow}
                        aria-hidden="true"
                        data-testid={`sort-arrow-${column.key}`}
                      >
                        {arrowFor(column.key, sort)}
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={Math.max(1, visibleColumns.length)}
                  style={styles.empty}
                >
                  Keine Daten vorhanden.
                </td>
              </tr>
            ) : (
              pageRows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {visibleColumns.map((column) => (
                    <td key={column.key} style={styles.td}>
                      {formatCell(row[column.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={styles.pagination}>
        <button
          type="button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          style={styles.pageButton}
        >
          Zurück
        </button>
        <span style={styles.pageInfo}>
          Seite {currentPage} von {totalPages}
        </span>
        <button
          type="button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          style={styles.pageButton}
        >
          Weiter
        </button>
        <label style={styles.pageSizeLabel}>
          Zeilen pro Seite
          <select
            value={view.pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            style={styles.select}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)',
  },
  scroll: {
    overflowX: 'auto',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
  },
  th: {
    position: 'sticky',
    top: 0,
    backgroundColor: 'var(--color-surface)',
    borderBottom: '1px solid var(--color-border)',
    padding: 0,
    textAlign: 'left',
    zIndex: 1,
  },
  headerButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    width: '100%',
    padding: 'var(--space-2) var(--space-3)',
    border: 'none',
    background: 'transparent',
    color: 'var(--color-fg)',
    font: 'inherit',
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'left',
  },
  headerButtonActive: {
    color: 'var(--color-accent)',
  },
  headerText: {
    flex: 1,
  },
  arrow: {
    width: '1em',
    fontSize: '0.75em',
    color: 'var(--color-accent)',
  },
  td: {
    padding: 'var(--space-2) var(--space-3)',
    borderBottom: '1px solid var(--color-border)',
    color: 'var(--color-fg)',
  },
  empty: {
    padding: 'var(--space-4) var(--space-3)',
    color: 'var(--color-muted)',
    textAlign: 'center',
  },
  pagination: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'var(--space-2)',
  },
  pageButton: {
    padding: 'var(--space-1) var(--space-3)',
    minHeight: '44px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-fg)',
    cursor: 'pointer',
  },
  pageInfo: {
    color: 'var(--color-muted)',
  },
  pageSizeLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    marginLeft: 'auto',
    color: 'var(--color-muted)',
  },
  select: {
    padding: 'var(--space-1)',
    minHeight: '44px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-fg)',
  },
};
