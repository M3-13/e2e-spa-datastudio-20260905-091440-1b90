import ChartPanel from '../components/ChartPanel';
import ClearDataButton from '../components/ClearDataButton';
import ColumnVisibilityPanel from '../components/ColumnVisibilityPanel';
import DataTable from '../components/DataTable';
import DelimiterSwitcher from '../components/DelimiterSwitcher';
import ExportButton from '../components/ExportButton';
import FileLoader from '../components/FileLoader';
import FilterRow from '../components/FilterRow';
import SearchBar from '../components/SearchBar';
import StatsPanel from '../components/StatsPanel';
import StatusBanner from '../components/StatusBanner';

function DataStudioPage() {
  return (
    <div className="data-studio">
      <FileLoader />
      <StatusBanner />
      <DelimiterSwitcher />
      <div className="data-studio__toolbar">
        <SearchBar />
        <ColumnVisibilityPanel />
        <ExportButton />
        <ClearDataButton />
      </div>
      <FilterRow />
      <DataTable />
      <StatsPanel />
      <ChartPanel />
    </div>
  );
}

export default DataStudioPage;
