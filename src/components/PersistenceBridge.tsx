import { useEffect } from 'react';
import { useApp } from '../state/store';
import { loadPersistedState, savePersistedState } from '../lib/storage';
import type { PersistedState, ViewState } from '../types';

const DEFAULT_PERSISTED: PersistedState = {
  dataset: null,
  view: {
    search: '',
    sort: null,
    page: 1,
    pageSize: 25,
    filters: [],
    chartKey: null,
    chartType: 'bar',
    darkMode: false,
  },
};

function isDefaultView(view: ViewState): boolean {
  return (
    view.search === '' &&
    view.sort === null &&
    view.page === 1 &&
    view.pageSize === 25 &&
    view.filters.length === 0 &&
    view.chartKey === null &&
    view.chartType === 'bar' &&
    view.darkMode === false
  );
}

function PersistenceBridge() {
  const { state, actions } = useApp();
  const { dataset, view } = state;

  useEffect(() => {
    let persisted: PersistedState | null = null;
    try {
      persisted = loadPersistedState();
    } catch {
      persisted = null;
    }
    actions.hydrate(persisted ?? DEFAULT_PERSISTED);
  }, [actions]);

  useEffect(() => {
    // Never persist the empty default state: that is what clearAll()
    // produces, and re-writing it would resurrect the just-deleted key.
    if (dataset === null && isDefaultView(view)) return;
    try {
      savePersistedState({ dataset, view });
    } catch {
      // never throw out of persistence
    }
  }, [dataset, view]);

  return null;
}

export default PersistenceBridge;
