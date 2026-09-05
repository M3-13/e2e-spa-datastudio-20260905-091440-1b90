import { useApp } from '../state/store';
import { clearPersisted } from '../lib/storage';

function ClearDataButton() {
  const { actions } = useApp();

  const handleClear = () => {
    try {
      clearPersisted();
    } catch {
      // never throw out of the click handler
    }
    actions.clearAll();
  };

  return (
    <button
      type="button"
      className="clear-data-button"
      onClick={handleClear}
      style={{
        minHeight: '44px',
        padding: '0 var(--space-3)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-danger)',
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-danger)',
        cursor: 'pointer',
        fontWeight: 600,
      }}
    >
      Daten &amp; Einstellungen löschen
    </button>
  );
}

export default ClearDataButton;
