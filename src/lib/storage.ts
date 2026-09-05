import type {
  CellValue,
  Column,
  Dataset,
  Delimiter,
  FilterCondition,
  PersistedState,
  Row,
  SortConfig,
  ViewState,
} from '../types';

export const PERSISTENCE_STORAGE_KEY = 'datastudio.persisted';

const DELIMITERS: readonly Delimiter[] = [',', ';', '\t', '|'];

const FILTER_OPERATORS: readonly FilterCondition['operator'][] = [
  'contains',
  'equals',
  'gt',
  'gte',
  'lt',
  'lte',
  'between',
];

const COLUMN_TYPES: readonly Column['type'][] = ['text', 'number'];
const SORT_DIRECTIONS: readonly SortConfig['direction'][] = ['asc', 'desc'];
const CHART_TYPES: readonly ViewState['chartType'][] = ['bar', 'line'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCellValue(value: unknown): value is CellValue {
  return value === null || typeof value === 'string' || typeof value === 'number';
}

function validateColumn(value: unknown): Column | null {
  if (!isRecord(value)) return null;
  if (typeof value.key !== 'string' || value.key.length === 0) return null;
  if (typeof value.name !== 'string') return null;
  if (!COLUMN_TYPES.includes(value.type as Column['type'])) return null;
  if (typeof value.visible !== 'boolean') return null;
  return {
    key: value.key,
    name: value.name,
    type: value.type as Column['type'],
    visible: value.visible,
  };
}

function validateRow(value: unknown): Row | null {
  if (!isRecord(value)) return null;
  const row: Row = {};
  for (const [key, cell] of Object.entries(value)) {
    if (!isCellValue(cell)) return null;
    row[key] = cell;
  }
  return row;
}

function validateDataset(value: unknown): Dataset | null {
  if (!isRecord(value)) return null;
  if (!Array.isArray(value.columns) || !Array.isArray(value.rows)) return null;

  const columns: Column[] = [];
  for (const col of value.columns) {
    const validated = validateColumn(col);
    if (!validated) return null;
    columns.push(validated);
  }

  const rows: Row[] = [];
  for (const r of value.rows) {
    const validated = validateRow(r);
    if (!validated) return null;
    rows.push(validated);
  }

  if (!DELIMITERS.includes(value.delimiter as Delimiter)) return null;
  if (typeof value.hasHeader !== 'boolean') return null;

  return {
    columns,
    rows,
    delimiter: value.delimiter as Delimiter,
    hasHeader: value.hasHeader,
  };
}

function validateSortConfig(value: unknown): SortConfig | null {
  if (!isRecord(value)) return null;
  if (typeof value.key !== 'string') return null;
  if (!SORT_DIRECTIONS.includes(value.direction as SortConfig['direction'])) {
    return null;
  }
  return {
    key: value.key,
    direction: value.direction as SortConfig['direction'],
  };
}

function validateFilterCondition(value: unknown): FilterCondition | null {
  if (!isRecord(value)) return null;
  if (typeof value.key !== 'string') return null;
  if (!FILTER_OPERATORS.includes(value.operator as FilterCondition['operator'])) {
    return null;
  }
  if (typeof value.value !== 'string') return null;
  if (value.value2 !== undefined && typeof value.value2 !== 'string') return null;

  const condition: FilterCondition = {
    key: value.key,
    operator: value.operator as FilterCondition['operator'],
    value: value.value,
  };
  if (value.value2 !== undefined) condition.value2 = value.value2;
  return condition;
}

function validateViewState(value: unknown): ViewState | null {
  if (!isRecord(value)) return null;
  if (typeof value.search !== 'string') return null;

  let sort: SortConfig | null = null;
  if (value.sort !== null && value.sort !== undefined) {
    const validated = validateSortConfig(value.sort);
    if (!validated) return null;
    sort = validated;
  }

  if (
    typeof value.page !== 'number' ||
    !Number.isInteger(value.page) ||
    value.page < 1
  ) {
    return null;
  }

  if (
    typeof value.pageSize !== 'number' ||
    !Number.isInteger(value.pageSize) ||
    value.pageSize < 1
  ) {
    return null;
  }

  if (!Array.isArray(value.filters)) return null;
  const filters: FilterCondition[] = [];
  for (const f of value.filters) {
    const validated = validateFilterCondition(f);
    if (!validated) return null;
    filters.push(validated);
  }

  if (value.chartKey !== null && typeof value.chartKey !== 'string') return null;
  if (!CHART_TYPES.includes(value.chartType as ViewState['chartType'])) {
    return null;
  }
  if (typeof value.darkMode !== 'boolean') return null;

  return {
    search: value.search,
    sort,
    page: value.page,
    pageSize: value.pageSize,
    filters,
    chartKey: value.chartKey as string | null,
    chartType: value.chartType as ViewState['chartType'],
    darkMode: value.darkMode,
  };
}

export function validatePersistedState(raw: unknown): PersistedState | null {
  if (!isRecord(raw)) return null;

  let dataset: Dataset | null = null;
  if (raw.dataset !== null) {
    const validated = validateDataset(raw.dataset);
    if (!validated) return null;
    dataset = validated;
  }

  const view = validateViewState(raw.view);
  if (!view) return null;

  return { dataset, view };
}

function getStorage(): Storage | null {
  try {
    const g = globalThis as { localStorage?: Storage };
    return g.localStorage ?? null;
  } catch {
    return null;
  }
}

export function loadPersistedState(): PersistedState | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const text = storage.getItem(PERSISTENCE_STORAGE_KEY);
    if (text === null) return null;
    return validatePersistedState(JSON.parse(text));
  } catch {
    return null;
  }
}

export function savePersistedState(state: PersistedState): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(PERSISTENCE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable — persist nothing
  }
}

export function clearPersisted(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(PERSISTENCE_STORAGE_KEY);
  } catch {
    // storage unavailable — nothing to clear
  }
}
