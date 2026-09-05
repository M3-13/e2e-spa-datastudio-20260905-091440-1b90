import { useCallback, useEffect, useRef, useState } from 'react';
import { parseCSV } from '../lib/parse';
import { SAMPLE_CSV } from '../lib/sampleData';
import { setCurrentSource } from '../lib/source';
import { useApp } from '../state/store';
import './FileLoader.css';

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

function FileLoader() {
  const { actions } = useApp();
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  const loadFile = useCallback(
    async (file: File) => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        actions.setErrorMessage(
          'Die Datei ist größer als 50 MB und kann nicht geladen werden.',
        );
        actions.setStatus('error');
        return;
      }

      actions.setErrorMessage(null);
      actions.setStatus('loading');
      try {
        const text = await file.text();
        setCurrentSource(text);
        const dataset = parseCSV(text);
        actions.setDataset(dataset);
        actions.setStatus('ready');
      } catch {
        actions.setErrorMessage(
          'Die Datei konnte nicht gelesen oder geparst werden.',
        );
        actions.setStatus('error');
      }
    },
    [actions],
  );

  const loadSample = useCallback(() => {
    actions.setErrorMessage(null);
    actions.setStatus('loading');
    setCurrentSource(SAMPLE_CSV);
    actions.setDataset(parseCSV(SAMPLE_CSV));
    actions.setStatus('ready');
  }, [actions]);

  useEffect(() => {
    const hasFiles = (event: DragEvent) =>
      Array.from(event.dataTransfer?.types ?? []).includes('Files');

    const onDragEnter = (event: DragEvent) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
      dragDepth.current += 1;
      setDragging(true);
    };

    const onDragOver = (event: DragEvent) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
    };

    const onDragLeave = (event: DragEvent) => {
      if (!hasFiles(event)) return;
      dragDepth.current -= 1;
      if (dragDepth.current <= 0) {
        dragDepth.current = 0;
        setDragging(false);
      }
    };

    const onDrop = (event: DragEvent) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
      dragDepth.current = 0;
      setDragging(false);
      const file = event.dataTransfer?.files?.[0];
      if (file) {
        void loadFile(file);
      }
    };

    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('drop', onDrop);

    return () => {
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('drop', onDrop);
    };
  }, [loadFile]);

  const openDialog = () => {
    inputRef.current?.click();
  };

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void loadFile(file);
    }
    event.target.value = '';
  };

  return (
    <>
      <div className="file-loader">
        <div className="file-loader__dropzone">
          <span className="file-loader__icon" aria-hidden="true">
            ⤓
          </span>
          <p className="file-loader__title">CSV-Datei laden</p>
          <p className="file-loader__hint">
            Datei hierher ziehen oder über die Schaltfläche auswählen.
          </p>
          <div className="file-loader__actions">
            <button
              type="button"
              className="file-loader__button file-loader__button--primary"
              onClick={openDialog}
            >
              Datei auswählen
            </button>
            <button
              type="button"
              className="file-loader__button file-loader__button--secondary"
              onClick={loadSample}
            >
              Beispieldatensatz laden
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="file-loader__input"
            onChange={onInputChange}
          />
        </div>
      </div>

      {dragging && (
        <div className="file-loader__overlay" role="presentation">
          <div className="file-loader__overlay-inner">
            <p>Datei loslassen, um sie zu laden</p>
          </div>
        </div>
      )}
    </>
  );
}

export default FileLoader;
