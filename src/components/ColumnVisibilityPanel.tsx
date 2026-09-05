import { useEffect, useRef } from 'react';
import { useApp } from '../state/store';

function ColumnVisibilityPanel() {
  const { state, actions } = useApp();
  const columns = state.dataset?.columns ?? [];

  const allRef = useRef<HTMLInputElement>(null);
  const someVisible = columns.some((c) => c.visible);
  const allVisible = columns.length > 0 && columns.every((c) => c.visible);

  useEffect(() => {
    if (allRef.current) {
      allRef.current.indeterminate = someVisible && !allVisible;
    }
  }, [someVisible, allVisible]);

  if (columns.length === 0) {
    return null;
  }

  const handleToggleAll = () => {
    const target = !allVisible;
    columns.forEach((c) => {
      if (c.visible !== target) {
        actions.toggleColumn(c.key);
      }
    });
  };

  return (
    <div className="column-visibility" role="group" aria-label="Spaltenauswahl">
      <div className="column-visibility__header">
        <span className="column-visibility__title">Spalten</span>
        <label className="column-visibility__toggle-all">
          <input
            ref={allRef}
            type="checkbox"
            checked={allVisible}
            onChange={handleToggleAll}
          />
          <span>Alle ein/aus</span>
        </label>
      </div>
      <ul className="column-visibility__list">
        {columns.map((column) => (
          <li key={column.key} className="column-visibility__item">
            <label className="column-visibility__label">
              <input
                type="checkbox"
                checked={column.visible}
                onChange={() => actions.toggleColumn(column.key)}
              />
              <span className="column-visibility__name">{column.name}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ColumnVisibilityPanel;
