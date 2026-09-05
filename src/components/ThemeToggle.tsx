import { useLayoutEffect, type CSSProperties } from 'react';
import { useApp } from '../state/store';

const THEME_STORAGE_KEY = 'datastudio.theme';

const buttonStyle: CSSProperties = {
  minWidth: 44,
  minHeight: 44,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  borderRadius: 8,
};

const trackStyle = (checked: boolean): CSSProperties => ({
  width: 44,
  height: 24,
  boxSizing: 'border-box',
  borderRadius: 999,
  padding: 2,
  display: 'flex',
  alignItems: 'center',
  backgroundColor: checked ? 'var(--color-accent)' : 'var(--color-border)',
  transition: 'background-color 150ms ease',
});

const knobStyle = (checked: boolean): CSSProperties => ({
  width: 20,
  height: 20,
  borderRadius: 999,
  backgroundColor: '#ffffff',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
  transform: checked ? 'translateX(20px)' : 'translateX(0)',
  transition: 'transform 150ms ease',
});

function ThemeToggle() {
  const { state, actions } = useApp();
  const darkMode = state.view.darkMode;

  useLayoutEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      stored = null;
    }
    if (stored === 'dark') {
      actions.setDarkMode(true);
    }
  }, [actions]);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={darkMode}
      aria-label={
        darkMode ? 'Auf hellen Modus wechseln' : 'Auf dunklen Modus wechseln'
      }
      onClick={() => actions.setDarkMode(!darkMode)}
      style={buttonStyle}
    >
      <span style={trackStyle(darkMode)}>
        <span style={knobStyle(darkMode)} />
      </span>
    </button>
  );
}

export default ThemeToggle;
