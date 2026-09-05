import { delimiterLabel } from '../lib/parse';
import { useApp } from '../state/store';
import './StatusBanner.css';

type BannerKind = 'idle' | 'loading' | 'error' | 'empty' | 'ready';

function StatusBanner() {
  const { state } = useApp();
  const { status, errorMessage, dataset } = state;

  let kind: BannerKind = 'idle';
  let message: string;

  if (status === 'loading') {
    kind = 'loading';
    message = 'Datei wird geladen …';
  } else if (status === 'error') {
    kind = 'error';
    message =
      errorMessage ?? 'Die Datei konnte nicht geladen oder geparst werden.';
  } else if (status === 'ready' && dataset) {
    if (dataset.rows.length === 0) {
      kind = 'empty';
      message = 'Der Datensatz enthält keine Zeilen.';
    } else {
      kind = 'ready';
      message = `${dataset.rows.length} Zeilen · ${dataset.columns.length} Spalten · Trennzeichen: ${delimiterLabel(dataset.delimiter)}`;
    }
  } else {
    kind = 'idle';
    message =
      'Noch keine Daten geladen – CSV-Datei laden oder Beispieldatensatz verwenden.';
  }

  return (
    <div
      className={`status-banner status-banner--${kind}`}
      role="status"
      aria-live="polite"
    >
      <p className="status-banner__text">{message}</p>
    </div>
  );
}

export default StatusBanner;
