import { useApp } from '../state/store';
import { deriveChartData } from '../lib/chartData';
import { deriveFilteredRows } from '../lib/derive';
import BarChart from './charts/BarChart';
import LineChart from './charts/LineChart';

function ChartPanel() {
  const { state, actions } = useApp();
  const { dataset, view } = state;
  const { chartKey, chartType, filters, search } = view;

  const columns = dataset?.columns ?? [];
  const activeKey = chartKey ?? columns[0]?.key ?? null;

  if (!dataset || columns.length === 0) {
    return (
      <section className="chart-panel" aria-label="Diagramm">
        <h2 className="chart-panel__title">Diagramm</h2>
        <p className="chart-panel__empty">Noch keine Daten geladen.</p>
      </section>
    );
  }

  const filteredRows = deriveFilteredRows(dataset.rows, columns, filters, search);
  const data = activeKey ? deriveChartData(filteredRows, activeKey, chartType) : [];
  const activeColumn = columns.find((c) => c.key === activeKey);
  const chartTitle = activeColumn ? `${activeColumn.name} (${chartType === 'bar' ? 'Balken' : 'Linie'})` : undefined;

  return (
    <section className="chart-panel" aria-label="Diagramm">
      <div className="chart-panel__header">
        <h2 className="chart-panel__title">Diagramm</h2>
        <div className="chart-panel__controls">
          <label className="chart-panel__field">
            <span>Spalte</span>
            <select
              value={activeKey ?? ''}
              onChange={(e) => actions.setChartKey(e.target.value)}
            >
              {columns.map((column) => (
                <option key={column.key} value={column.key}>
                  {column.name}
                  {column.type === 'number' ? ' (numerisch)' : ''}
                </option>
              ))}
            </select>
          </label>
          <div className="chart-panel__toggle" role="group" aria-label="Diagrammtyp">
            <button
              type="button"
              className={chartType === 'bar' ? 'is-active' : ''}
              aria-pressed={chartType === 'bar'}
              onClick={() => actions.setChartType('bar')}
            >
              Balken
            </button>
            <button
              type="button"
              className={chartType === 'line' ? 'is-active' : ''}
              aria-pressed={chartType === 'line'}
              onClick={() => actions.setChartType('line')}
            >
              Linie
            </button>
          </div>
        </div>
      </div>
      {data.length === 0 ? (
        <p className="chart-panel__empty">
          Keine Daten für die gewählte Spalte vorhanden.
        </p>
      ) : chartType === 'bar' ? (
        <BarChart data={data} title={chartTitle} />
      ) : (
        <LineChart data={data} title={chartTitle} />
      )}
    </section>
  );
}

export default ChartPanel;
