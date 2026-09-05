import { useApp } from '../state/store';
import { deriveFilteredRows, deriveSortedRows } from '../lib/derive';
import { exportToCSV } from '../lib/export';

function ExportButton() {
  const { state } = useApp();
  const dataset = state.dataset;

  function handleExport() {
    if (!dataset) return;

    const filtered = deriveFilteredRows(
      dataset.rows,
      dataset.columns,
      state.view.filters,
      state.view.search,
    );
    const sorted = deriveSortedRows(filtered, state.view.sort);
    const csv = exportToCSV(sorted, dataset.columns);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'export.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return (
    <button
      type="button"
      className="btn btn--primary"
      onClick={handleExport}
      disabled={!dataset}
    >
      CSV exportieren
    </button>
  );
}

export default ExportButton;
