# CSV DataStudio

Eine Single-Page-Web-App zum Laden, Anzeigen, Filtern, Analysieren, Visualisieren und Exportieren von CSV-Daten — vollständig im Browser, ohne Backend und ohne Diagramm-Bibliothek. Daten und Ansichtseinstellungen werden lokal im LocalStorage gemerkt, ein Beispieldatensatz ist mitgeliefert.

## Tech-Stack

- **Sprache**: TypeScript
- **Framework**: React
- **Build-Tool**: Vite
- **Styling**: globale CSS-Datei mit Design-Tokens (Light/Dark)
- **Charts**: selbst gezeichnet mit SVG, keine Bibliothek
- **Storage**: LocalStorage
- **Tests**: Vitest

## Installation

```bash
npm ci
```

## Entwicklung

```bash
npm run dev
```

Der Dev-Server startet standardmäßig unter `http://localhost:5173`.

## Build für Produktion

```bash
npm run build
```

Das gebaute Ergebnis liegt im Ordner `dist/`. Mit `npm run preview` lässt es sich lokal ansehen.

## Tests

```bash
npm test
```

## Bedienung

- **Header** mit App-Titel und Dark-Mode-Umschalter.
- **Hauptbereich** mit Dateiladen, Statusanzeige, Trennzeichen-Auswahl, Werkzeugleiste (Suche, Spaltenauswahl, Export, Daten löschen), Filterzeile, Tabelle, Kennzahlen und Diagramm.
- **Footer** mit Links zu Impressum (`/legal`) und Datenschutzerklärung (`/privacy`).

## Feature-Liste

- CSV laden per Dateiauswahl und Drag-and-drop
- Automatische Erkennung des Trennzeichens (Komma, Semikolon, Tabulator, Pipe)
- Paginierte, sortierbare Tabelle mit ein-/ausblendbaren Spalten
- Volltextsuche und pro Spalte konfigurierbare Filter
- Kennzahlen (Anzahl, Summe, Mittelwert, Min, Max, fehlende Werte) für numerische Spalten
- Selbst gezeichnete Balken- und Liniendiagramme
- CSV-Export der gefilterten, durchsuchten Ansicht
- Lokale Persistenz von Datensatz und Ansichtseinstellungen
- Dark-Mode ohne Flackern beim Start
- Impressum und Datenschutzerklärung

Hinweis: Diese App-Shell stellt das Gerüst und die Verträge bereit. Die einzelnen Funktionen werden in Folgetickets implementiert.
