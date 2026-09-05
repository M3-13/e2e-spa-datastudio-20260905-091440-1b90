import { describe, expect, it } from 'vitest';
import type { Column, Row } from '../types';
import { exportToCSV } from './export';

const columns: Column[] = [
  { key: 'name', name: 'Name', type: 'text', visible: true },
  { key: 'age', name: 'Age', type: 'number', visible: true },
  { key: 'note', name: 'Note', type: 'text', visible: false },
];

describe('exportToCSV', () => {
  it('emits only visible columns in order, with a header row', () => {
    const rows: Row[] = [{ name: 'Alice', age: 30, note: 'secret' }];
    expect(exportToCSV(rows, columns)).toBe('Name,Age\r\nAlice,30');
  });

  it('renders null as an empty cell', () => {
    const rows: Row[] = [{ name: null, age: 30, note: null }];
    expect(exportToCSV(rows, columns)).toBe('Name,Age\r\n,30');
  });

  it('renders numbers as their string form', () => {
    const rows: Row[] = [{ name: 'Bob', age: 25.5, note: 'x' }];
    expect(exportToCSV(rows, columns)).toBe('Name,Age\r\nBob,25.5');
  });

  it('quotes fields containing the delimiter', () => {
    const rows: Row[] = [{ name: 'Doe, John', age: 40, note: 'x' }];
    expect(exportToCSV(rows, columns)).toBe('Name,Age\r\n"Doe, John",40');
  });

  it('escapes embedded double quotes', () => {
    const rows: Row[] = [{ name: 'a"b', age: 1, note: 'x' }];
    expect(exportToCSV(rows, columns)).toBe('Name,Age\r\n"a""b",1');
  });

  it('quotes fields containing newlines', () => {
    const rows: Row[] = [{ name: 'line1\nline2', age: 2, note: 'x' }];
    expect(exportToCSV(rows, columns)).toBe('Name,Age\r\n"line1\nline2",2');
  });

  it('returns only the header for an empty row set', () => {
    expect(exportToCSV([], columns)).toBe('Name,Age');
  });

  it('preserves the order of the given rows (already sorted upstream)', () => {
    const rows: Row[] = [
      { name: 'Zed', age: 60, note: 'x' },
      { name: 'Amy', age: 20, note: 'x' },
    ];
    expect(exportToCSV(rows, columns)).toBe(
      'Name,Age\r\nZed,60\r\nAmy,20',
    );
  });

  it('returns an empty string when no column is visible', () => {
    const hidden: Column[] = [
      { key: 'name', name: 'Name', type: 'text', visible: false },
    ];
    expect(exportToCSV([{ name: 'x' }], hidden)).toBe('');
  });
});
