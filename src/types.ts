export type CellValue = string | number | null;

export type Row = Record<string, CellValue>;

export interface Column {
  key: string;
  name: string;
  type: 'text' | 'number';
  visible: boolean;
}

export type Delimiter = ',' | ';' | '\t' | '|';

export interface Dataset {
  columns: Column[];
  rows: Row[];
  delimiter: Delimiter;
  hasHeader: boolean;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface FilterCondition {
  key: string;
  operator:
    | 'contains'
    | 'equals'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'between';
  value: string;
  value2?: string;
}

export type Status = 'idle' | 'loading' | 'ready' | 'error';

export interface ViewState {
  search: string;
  sort: SortConfig | null;
  page: number;
  pageSize: number;
  filters: FilterCondition[];
  chartKey: string | null;
  chartType: 'bar' | 'line';
  darkMode: boolean;
}

export interface AppState {
  dataset: Dataset | null;
  view: ViewState;
  status: Status;
  errorMessage: string | null;
}

export interface ColumnStats {
  key: string;
  count: number;
  sum: number;
  mean: number;
  min: number;
  max: number;
  missing: number;
}

export interface ChartDatum {
  label: string;
  value: number;
}

export interface PersistedState {
  dataset: Dataset | null;
  view: ViewState;
}
