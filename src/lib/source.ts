// Holds the raw CSV text of the most recently loaded source so that the
// DelimiterSwitcher can re-parse the same content with a different delimiter.
// It lives outside the store because the AppState contract (owned by the
// app shell) does not carry the raw text, and re-parsing is impossible from
// the already-parsed Dataset alone.

let currentSource: string | null = null;

export function setCurrentSource(text: string | null): void {
  currentSource = text;
}

export function getCurrentSource(): string | null {
  return currentSource;
}
