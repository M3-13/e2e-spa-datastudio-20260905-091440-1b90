import type { CSSProperties } from 'react';
import { useApp } from '../state/store';

const styles: Record<string, CSSProperties> = {
  field: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    flex: '1 1 240px',
    minWidth: '200px',
  },
  label: {
    fontSize: '14px',
    color: 'var(--color-muted)',
    whiteSpace: 'nowrap',
  },
  input: {
    width: '100%',
    minHeight: '44px',
    padding: '8px 12px',
    fontSize: '14px',
    color: 'var(--color-fg)',
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    outline: 'none',
  },
};

function SearchBar() {
  const { state, actions } = useApp();

  return (
    <div style={styles.field}>
      <label htmlFor="search-input" style={styles.label}>
        Suche
      </label>
      <input
        id="search-input"
        type="search"
        value={state.view.search}
        placeholder="Volltextsuche…"
        onChange={(e) => actions.setSearch(e.target.value)}
        style={styles.input}
      />
    </div>
  );
}

export default SearchBar;
