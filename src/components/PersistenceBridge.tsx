import { useEffect, useRef } from 'react';
import { useApp } from '../state/store';
import { loadPersistedState, savePersistedState } from '../lib/storage';
import type { PersistedState } from '../types';

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

function PersistenceBridge() {
  const { state, actions } = useApp();
  const { dataset, view } = state;
  const isFirstRender = useRef(true);

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
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    try {
      savePersistedState({ dataset, view });
    } catch {
      // never throw out of persistence
    }
  }, [dataset, view]);

  return null;
}

export default PersistenceBridge;
