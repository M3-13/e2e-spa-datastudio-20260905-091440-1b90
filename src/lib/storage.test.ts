import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { PersistedState } from '../types';
import {
  clearPersisted,
  loadPersistedState,
  PERSISTENCE_STORAGE_KEY,
  savePersistedState,
  validatePersistedState,
} from './storage';

class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

function installStorage(): MemoryStorage {
  const storage = new MemoryStorage();
  (globalThis as { localStorage?: Storage }).localStorage = storage;
  return storage;
}

const validPersisted: PersistedState = {
  dataset: {
    columns: [
      { key: 'name', name: 'Name', type: 'text', visible: true },
      { key: 'age', name: 'Age', type: 'number', visible: true },
    ],
    rows: [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: null },
    ],
    delimiter: ',',
    hasHeader: true,
  },
  view: {
    search: 'ali',
    sort: { key: 'age', direction: 'desc' },
    page: 2,
    pageSize: 50,
    filters: [
      { key: 'age', operator: 'gt', value: '20' },
      { key: 'age', operator: 'between', value: '20', value2: '40' },
    ],
    chartKey: 'age',
    chartType: 'line',
    darkMode: true,
  },
};

describe('validatePersistedState', () => {
  it('accepts a valid persisted state', () => {
    expect(validatePersistedState(validPersisted)).toEqual(validPersisted);
  });

  it('accepts a null dataset (empty state)', () => {
    const state = { ...validPersisted, dataset: null };
    expect(validatePersistedState(state)).toEqual(state);
  });

  it('returns null for non-object input', () => {
    expect(validatePersistedState(null)).toBeNull();
    expect(validatePersistedState('x')).toBeNull();
    expect(validatePersistedState(42)).toBeNull();
    expect(validatePersistedState([1, 2])).toBeNull();
  });

  it('returns null when the dataset has an invalid column type', () => {
    const bad = {
      ...validPersisted,
      dataset: {
        ...validPersisted.dataset!,
        columns: [{ key: 'name', name: 'Name', type: 'boolean', visible: true }],
      },
    };
    expect(validatePersistedState(bad)).toBeNull();
  });

  it('returns null when a cell value has an invalid type', () => {
    const bad = {
      ...validPersisted,
      dataset: {
        ...validPersisted.dataset!,
        rows: [{ name: { evil: true }, age: 1 }],
      },
    };
    expect(validatePersistedState(bad)).toBeNull();
  });

  it('returns null for an invalid delimiter', () => {
    const bad = {
      ...validPersisted,
      dataset: { ...validPersisted.dataset!, delimiter: ':' },
    };
    expect(validatePersistedState(bad)).toBeNull();
  });

  it('returns null for an invalid filter operator', () => {
    const bad = {
      ...validPersisted,
      view: {
        ...validPersisted.view,
        filters: [{ key: 'age', operator: 'drops', value: '20' }],
      },
    };
    expect(validatePersistedState(bad)).toBeNull();
  });

  it('returns null for a non-integer page', () => {
    const bad = {
      ...validPersisted,
      view: { ...validPersisted.view, page: 1.5 },
    };
    expect(validatePersistedState(bad)).toBeNull();
  });

  it('returns null for a zero or negative page', () => {
    expect(
      validatePersistedState({
        ...validPersisted,
        view: { ...validPersisted.view, page: 0 },
      }),
    ).toBeNull();
    expect(
      validatePersistedState({
        ...validPersisted,
        view: { ...validPersisted.view, page: -3 },
      }),
    ).toBeNull();
  });

  it('returns null for an invalid sort direction', () => {
    const bad = {
      ...validPersisted,
      view: { ...validPersisted.view, sort: { key: 'age', direction: 'up' } },
    };
    expect(validatePersistedState(bad)).toBeNull();
  });

  it('returns null for an invalid chart type', () => {
    const bad = {
      ...validPersisted,
      view: { ...validPersisted.view, chartType: 'pie' },
    };
    expect(validatePersistedState(bad)).toBeNull();
  });

  it('returns null for a non-boolean darkMode', () => {
    const bad = {
      ...validPersisted,
      view: { ...validPersisted.view, darkMode: 'yes' },
    };
    expect(validatePersistedState(bad)).toBeNull();
  });

  it('returns null when the view is missing', () => {
    const { view, ...rest } = validPersisted;
    void view;
    expect(validatePersistedState(rest)).toBeNull();
  });
});

describe('load / save / clear', () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = installStorage();
  });

  afterEach(() => {
    delete (globalThis as { localStorage?: Storage }).localStorage;
  });

  it('loadPersistedState returns null when nothing is stored', () => {
    expect(loadPersistedState()).toBeNull();
  });

  it('round-trips a valid state', () => {
    savePersistedState(validPersisted);
    expect(loadPersistedState()).toEqual(validPersisted);
  });

  it('loadPersistedState returns null for corrupted JSON', () => {
    storage.setItem(PERSISTENCE_STORAGE_KEY, '{not json');
    expect(loadPersistedState()).toBeNull();
  });

  it('loadPersistedState returns null for manipulated data', () => {
    storage.setItem(
      PERSISTENCE_STORAGE_KEY,
      JSON.stringify({
        ...validPersisted,
        view: { ...validPersisted.view, page: -5 },
      }),
    );
    expect(loadPersistedState()).toBeNull();
  });

  it('clearPersisted removes the stored state', () => {
    savePersistedState(validPersisted);
    clearPersisted();
    expect(storage.getItem(PERSISTENCE_STORAGE_KEY)).toBeNull();
    expect(loadPersistedState()).toBeNull();
  });

  it('load / save / clear do not throw when storage is unavailable', () => {
    delete (globalThis as { localStorage?: Storage }).localStorage;
    expect(() => loadPersistedState()).not.toThrow();
    expect(() => savePersistedState(validPersisted)).not.toThrow();
    expect(() => clearPersisted()).not.toThrow();
  });
});
