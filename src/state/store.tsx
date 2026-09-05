import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import type {
  AppState,
  Dataset,
  Delimiter,
  FilterCondition,
  PersistedState,
  SortConfig,
  Status,
  ViewState,
} from '../types';

const THEME_STORAGE_KEY = 'datastudio.theme';

const initialView: ViewState = {
  search: '',
  sort: null,
  page: 1,
  pageSize: 25,
  filters: [],
  chartKey: null,
  chartType: 'bar',
  darkMode: false,
};

const initialState: AppState = {
  dataset: null,
  view: initialView,
  status: 'idle',
  errorMessage: null,
};

type Action =
  | { type: 'setDataset'; dataset: Dataset | null }
  | { type: 'setStatus'; status: Status }
  | { type: 'setErrorMessage'; message: string | null }
  | { type: 'setSearch'; search: string }
  | { type: 'setSort'; sort: SortConfig | null }
  | { type: 'setPage'; page: number }
  | { type: 'setPageSize'; pageSize: number }
  | { type: 'toggleColumn'; key: string }
  | { type: 'setDelimiter'; delimiter: Delimiter }
  | { type: 'addFilter'; filter: FilterCondition }
  | { type: 'updateFilter'; index: number; filter: FilterCondition }
  | { type: 'removeFilter'; index: number }
  | { type: 'clearFilters' }
  | { type: 'setChartKey'; key: string | null }
  | { type: 'setChartType'; chartType: 'bar' | 'line' }
  | { type: 'setDarkMode'; darkMode: boolean }
  | { type: 'hydrate'; state: PersistedState }
  | { type: 'clearAll' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'setDataset':
      return { ...state, dataset: action.dataset };
    case 'setStatus':
      return { ...state, status: action.status };
    case 'setErrorMessage':
      return { ...state, errorMessage: action.message };
    case 'setSearch':
      return {
        ...state,
        view: { ...state.view, search: action.search, page: 1 },
      };
    case 'setSort':
      return { ...state, view: { ...state.view, sort: action.sort } };
    case 'setPage':
      return { ...state, view: { ...state.view, page: action.page } };
    case 'setPageSize':
      return {
        ...state,
        view: { ...state.view, pageSize: action.pageSize, page: 1 },
      };
    case 'toggleColumn': {
      const columns = state.dataset?.columns ?? [];
      const updated = columns.map((c) =>
        c.key === action.key ? { ...c, visible: !c.visible } : c,
      );
      return {
        ...state,
        dataset: state.dataset
          ? { ...state.dataset, columns: updated }
          : state.dataset,
      };
    }
    case 'setDelimiter':
      return {
        ...state,
        dataset: state.dataset
          ? { ...state.dataset, delimiter: action.delimiter }
          : state.dataset,
      };
    case 'addFilter':
      return {
        ...state,
        view: {
          ...state.view,
          filters: [...state.view.filters, action.filter],
          page: 1,
        },
      };
    case 'updateFilter':
      return {
        ...state,
        view: {
          ...state.view,
          filters: state.view.filters.map((f, i) =>
            i === action.index ? action.filter : f,
          ),
        },
      };
    case 'removeFilter':
      return {
        ...state,
        view: {
          ...state.view,
          filters: state.view.filters.filter((_, i) => i !== action.index),
        },
      };
    case 'clearFilters':
      return { ...state, view: { ...state.view, filters: [] } };
    case 'setChartKey':
      return { ...state, view: { ...state.view, chartKey: action.key } };
    case 'setChartType':
      return { ...state, view: { ...state.view, chartType: action.chartType } };
    case 'setDarkMode':
      return { ...state, view: { ...state.view, darkMode: action.darkMode } };
    case 'hydrate':
      return {
        dataset: action.state.dataset,
        view: { ...initialView, ...action.state.view },
        status: action.state.dataset ? 'ready' : 'idle',
        errorMessage: null,
      };
    case 'clearAll':
      return initialState;
    default:
      return state;
  }
}

interface Actions {
  setDataset: (dataset: Dataset | null) => void;
  setStatus: (status: Status) => void;
  setErrorMessage: (message: string | null) => void;
  setSearch: (search: string) => void;
  setSort: (sort: SortConfig | null) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  toggleColumn: (key: string) => void;
  setDelimiter: (delimiter: Delimiter) => void;
  addFilter: (filter: FilterCondition) => void;
  updateFilter: (index: number, filter: FilterCondition) => void;
  removeFilter: (index: number) => void;
  clearFilters: () => void;
  setChartKey: (key: string | null) => void;
  setChartType: (chartType: 'bar' | 'line') => void;
  setDarkMode: (darkMode: boolean) => void;
  hydrate: (state: PersistedState) => void;
  clearAll: () => void;
}

interface AppContextValue {
  state: AppState;
  actions: Actions;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const theme = state.view.darkMode ? 'dark' : 'light';
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    document.documentElement.setAttribute('data-theme', theme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // storage unavailable (private mode / disabled) — theme still applies
    }
  }, [state.view.darkMode]);

  const actions = useMemo<Actions>(
    () => ({
      setDataset: (dataset) => dispatch({ type: 'setDataset', dataset }),
      setStatus: (status) => dispatch({ type: 'setStatus', status }),
      setErrorMessage: (message) =>
        dispatch({ type: 'setErrorMessage', message }),
      setSearch: (search) => dispatch({ type: 'setSearch', search }),
      setSort: (sort) => dispatch({ type: 'setSort', sort }),
      setPage: (page) => dispatch({ type: 'setPage', page }),
      setPageSize: (pageSize) => dispatch({ type: 'setPageSize', pageSize }),
      toggleColumn: (key) => dispatch({ type: 'toggleColumn', key }),
      setDelimiter: (delimiter) =>
        dispatch({ type: 'setDelimiter', delimiter }),
      addFilter: (filter) => dispatch({ type: 'addFilter', filter }),
      updateFilter: (index, filter) =>
        dispatch({ type: 'updateFilter', index, filter }),
      removeFilter: (index) => dispatch({ type: 'removeFilter', index }),
      clearFilters: () => dispatch({ type: 'clearFilters' }),
      setChartKey: (key) => dispatch({ type: 'setChartKey', key }),
      setChartType: (chartType) =>
        dispatch({ type: 'setChartType', chartType }),
      setDarkMode: (darkMode) => dispatch({ type: 'setDarkMode', darkMode }),
      hydrate: (persisted) => dispatch({ type: 'hydrate', state: persisted }),
      clearAll: () => dispatch({ type: 'clearAll' }),
    }),
    [],
  );

  const value = useMemo(() => ({ state, actions }), [state, actions]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}
