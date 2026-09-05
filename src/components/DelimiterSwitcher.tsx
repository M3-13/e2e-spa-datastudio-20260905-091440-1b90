import { useCallback } from 'react';
import { delimiterLabel, parseCSV } from '../lib/parse';
import { getCurrentSource } from '../lib/source';
import { useApp } from '../state/store';
import type { Delimiter } from '../types';
import './DelimiterSwitcher.css';

const OPTIONS: { delimiter: Delimiter; symbol: string }[] = [
  { delimiter: ',', symbol: ',' },
  { delimiter: ';', symbol: ';' },
  { delimiter: '\t', symbol: '⇥' },
  { delimiter: '|', symbol: '|' },
];

function DelimiterSwitcher() {
  const { state, actions } = useApp();
  const dataset = state.dataset;

  const handleChange = useCallback(
    (delimiter: Delimiter) => {
      if (!dataset || delimiter === dataset.delimiter) {
        return;
      }
      const source = getCurrentSource();
      if (source !== null) {
        const reparsed = parseCSV(source, delimiter);
        actions.setDataset(reparsed);
        actions.setStatus('ready');
        actions.setErrorMessage(null);
      } else {
        actions.setDelimiter(delimiter);
      }
    },
    [dataset, actions],
  );

  if (!dataset) {
    return null;
  }

  return (
    <div className="delimiter-switcher">
      <span className="delimiter-switcher__label">
        Trennzeichen: {delimiterLabel(dataset.delimiter)}
      </span>
      <div className="delimiter-switcher__options" role="group" aria-label="Trennzeichen wählen">
        {OPTIONS.map((option) => (
          <button
            key={option.delimiter}
            type="button"
            className="delimiter-switcher__option"
            aria-pressed={option.delimiter === dataset.delimiter}
            onClick={() => handleChange(option.delimiter)}
          >
            {option.symbol}
            <span className="delimiter-switcher__option-name">
              {delimiterLabel(option.delimiter)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default DelimiterSwitcher;
