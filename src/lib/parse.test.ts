import { describe, expect, it } from 'vitest';
import type { Delimiter } from '../types';
import { buildColumns, detectDelimiter, parseCSV } from './parse';

describe('detectDelimiter', () => {
  it('detects a comma delimiter', () => {
    expect(detectDelimiter('a,b,c\n1,2,3\n4,5,6')).toBe(',');
  });

  it('detects a semicolon delimiter', () => {
    expect(detectDelimiter('a;b;c\n1;2;3\n4;5;6')).toBe(';');
  });

  it('detects a tab delimiter', () => {
    expect(detectDelimiter('a\tb\tc\n1\t2\t3')).toBe('\t');
  });

  it('detects a pipe delimiter', () => {
    expect(detectDelimiter('a|b|c\n1|2|3\n4|5|6')).toBe('|');
  });

  it('prefers a semicolon over comma when semicolon is consistent', () => {
    expect(detectDelimiter('Name;Wert\nAlpha;1\nBeta;2')).toBe(';');
  });

  it('returns comma for text without a clear delimiter', () => {
    expect(detectDelimiter('just one column\nanother line')).toBe(',');
  });

  it('ignores delimiters inside quoted fields', () => {
    expect(detectDelimiter('a;b;c\n"x;y";2;3')).toBe(';');
  });

  it('returns comma for empty input', () => {
    expect(detectDelimiter('')).toBe(',');
  });
});

describe('parseCSV', () => {
  it('parses a comma-delimited file with a header', () => {
    const dataset = parseCSV('Name,Alter\nAnna,34\nBen,41');
    expect(dataset.delimiter).toBe(',');
    expect(dataset.hasHeader).toBe(true);
    expect(dataset.columns.map((c) => c.name)).toEqual(['Name', 'Alter']);
    expect(dataset.rows).toHaveLength(2);
    expect(dataset.rows[0]).toEqual({ Name: 'Anna', Alter: 34 });
  });

  it('detects numeric columns and keeps text columns as text', () => {
    const dataset = parseCSV('Name,Alter,Stadt\nAnna,34,Berlin\nBen,41,München');
    const types = dataset.columns.map((c) => c.type);
    expect(types).toEqual(['text', 'number', 'text']);
  });

  it('assigns generic column names when there is no header', () => {
    const dataset = parseCSV('Anna,34\nBen,41');
    expect(dataset.hasHeader).toBe(false);
    expect(dataset.columns.map((c) => c.name)).toEqual(['Spalte A', 'Spalte B']);
  });

  it('treats empty cells as missing (null) values', () => {
    const dataset = parseCSV('Name,Gehalt\nAnna,64000\nBen,\nClara,54500');
    expect(dataset.rows[1]).toEqual({ Name: 'Ben', Gehalt: null });
  });

  it('handles quoted fields containing the delimiter', () => {
    const dataset = parseCSV('Name,Beschreibung\nAnna,"Leitung, West"\nBen,Support');
    expect(dataset.rows[0]).toEqual({
      Name: 'Anna',
      Beschreibung: 'Leitung, West',
    });
  });

  it('handles escaped quotes inside a quoted field', () => {
    const dataset = parseCSV('Name,Zitat\nAnna,"Sie sagte ""Hallo"""\n');
    expect(dataset.rows[0].Zitat).toBe('Sie sagte "Hallo"');
  });

  it('parses a semicolon-delimited file with decimal comma as text', () => {
    const dataset = parseCSV('Name;Wert\nAlpha;12,5\nBeta;20');
    expect(dataset.delimiter).toBe(';');
    expect(dataset.columns.find((c) => c.name === 'Wert')?.type).toBe('text');
  });

  it('respects an explicitly provided delimiter', () => {
    const dataset = parseCSV('Name|Alter\nAnna|34', '|');
    expect(dataset.delimiter).toBe('|');
    expect(dataset.rows[0]).toEqual({ Name: 'Anna', Alter: 34 });
  });

  it('returns an empty dataset for empty input', () => {
    const dataset = parseCSV('');
    expect(dataset.columns).toHaveLength(0);
    expect(dataset.rows).toHaveLength(0);
    expect(dataset.hasHeader).toBe(false);
  });
});

describe('buildColumns', () => {
  it('infers number type only when numeric values dominate', () => {
    const columns = buildColumns(
      ['A', 'B', 'C'],
      [
        ['1', 'x', '2'],
        ['2', 'y', '3'],
        ['3', 'z', '4'],
      ],
    );
    expect(columns.map((c) => c.type)).toEqual(['number', 'text', 'number']);
  });

  it('deduplicates duplicate column keys', () => {
    const columns = buildColumns(['Wert', 'Wert'], [['1', '2']]);
    const keys = columns.map((c) => c.key);
    expect(keys).toEqual(['Wert', 'Wert (2)']);
  });
});

describe('delimiter round-trip', () => {
  const delimiters: Delimiter[] = [',', ';', '\t', '|'];
  it.each(delimiters)('round-trips %j', (delimiter) => {
    const text = `Name${delimiter}Wert\nA${delimiter}1\nB${delimiter}2`;
    const dataset = parseCSV(text);
    expect(dataset.delimiter).toBe(delimiter);
    expect(dataset.rows).toEqual([
      { Name: 'A', Wert: 1 },
      { Name: 'B', Wert: 2 },
    ]);
  });
});
