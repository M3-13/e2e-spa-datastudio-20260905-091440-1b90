# Design — Project Identity

> This document is project-long-lived. Tokens are not changed without
> the Architect's approval. Developers MUST use these tokens
> instead of improvising their own colors/spacings.

## Style Direction

Minimalistisch, datenorientiert und professionell wie Linear/Stripe: helle, kühle Grauflächen, ein kräftiger Indigo-Akzent, klare Tabellen- und Diagrammhierarchie, konsistenter Dark Mode.

## Colors

- `--color-bg`: **#FFFFFF**
- `--color-fg`: **#1A1D23**
- `--color-accent`: **#3B5BFD**
- `--color-border`: **#D8DCE3**
- `--color-muted`: **#667085**
- `--color-surface`: **#F5F7FA**
- `--color-surface_alt`: **#EDF0F5**
- `--color-success`: **#12B76A**
- `--color-warning`: **#F79009**
- `--color-danger`: **#F04438**
- `--color-bg_dark`: **#0F1115**
- `--color-fg_dark`: **#E6E8EC**
- `--color-surface_dark`: **#161A21**
- `--color-surface_alt_dark`: **#1E232C**
- `--color-border_dark`: **#2E3440**
- `--color-muted_dark`: **#98A2B3**
- `--color-accent_dark`: **#6C82FF**

## Typography

- `font_family`: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif
- `font_mono`: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace
- `heading_weight`: 600
- `body_weight`: 400

## Spacing Scale

- `--space-0`: 4px
- `--space-1`: 8px
- `--space-2`: 12px
- `--space-3`: 16px
- `--space-4`: 24px
- `--space-5`: 32px
- `--space-6`: 48px

## Border-Radii

- `--radius-sm`: 4px
- `--radius-md`: 8px
- `--radius-lg`: 12px
- `--radius-pill`: 999px

## Components

### Button

Primär: bg=#3B5BFD, Text #FFFFFF, padding 10px 16px, radius md 8px, font-weight 500, min-height 44px (Touch). Hover: bg=#2F4BE0. Active: bg=#273FC2, leichte Verschiebung. Disabled: opacity 0.5, cursor not-allowed. Focus-visible: 2px Ring #6C82FF, offset 2px. Sekundär: bg=#F5F7FA, fg=#1A1D23, border 1px #D8DCE3, hover bg=#EDF0F5. Ghost: transparent, hover bg=#F5F7FA. Dark: sekundär bg=#161A21, border=#2E3440, hover bg=#1E232C.

### IconButton

Quadratisch 44x44 px, radius md 8px, bg transparent, fg=#667085, hover bg=#F5F7FA, fg=#1A1D23, focus-visible 2px Ring #6C82FF. Dark: hover bg=#1E232C, fg=#98A2B3, hover-fg=#E6E8EC.

### Input

bg=#FFFFFF, border 1px #D8DCE3, radius md 8px, padding 8px 12px, min-height 44px, fg=#1A1D23, font-size 14px, placeholder=#98A2B3. Focus: border=#3B5BFD + 2px Ring rgba(59,91,253,0.25). Dark: bg=#161A21, border=#2E3440, fg=#E6E8EC.

### Select

Wie Input, zusätzlich Chevron-Icon rechts in #667085, padding-right 36px, min-height 44px. Optionen: bg=#FFFFFF, dark bg=#161A21. Focus-visible wie Input.

### Toggle

Dark-Mode-Umschalter: Track 44x24 px, radius pill, bg=#D8DCE3; checked bg=#3B5BFD. Knopf 20x20 px, #FFFFFF, 1px Shadow. Wrapper min 44x44 px Touch-Target. Focus-visible: 2px Ring #6C82FF. Dark: unchecked bg=#2E3440.

### Badge

Aktiver Filter: bg=#EEF2FF, fg=#2F4BE0, border 1px #C7D2FE. Neutral: bg=#F5F7FA, fg=#667085, border 1px #D8DCE3. Radius pill, padding 2px 8px, font-size 12px, font-weight 500. Dark aktiv: bg=#1E2340, fg=#A5B4FF, border=#3A4470; neutral: bg=#1E232C, fg=#98A2B3, border=#2E3440.

### Card

bg=#FFFFFF, border 1px #D8DCE3, radius lg 12px, padding 16px, optionaler 1px Shadow rgba(16,24,40,0.06). Dark: bg=#161A21, border=#2E3440.

### Table

Kopfzeile: sticky top, bg=#F5F7FA, fg=#667085, font-weight 600, font-size 13px, padding 10px 16px, Sortier-Icon zeigt Richtung (Pfeil, 14px). Zeilen: border-bottom 1px #EDF0F5, hover bg=#F9FAFB; Zellen padding 10px 16px, fg=#1A1D23, font-size 14px. Numerische Spalten rechtsbündig in font_mono. Dark: Kopfzeile bg=#1E232C, Zeilenrand #232A35, hover bg=#1E232C.

### Dropzone

Gestrichelte Border 2px #D8DCE3, radius lg 12px, bg=#F5F7FA, padding 48px 24px, Text zentriert #667085, Icon in #3B5BFD. Drag-over: bg=#EEF2FF, border=#3B5BFD, zusätzlich 2px Ring rgba(59,91,253,0.25). Dark: bg=#161A21, border=#2E3440, drag-over bg=#1E2340.

### StatusAlert

Laden/Info: bg=#EEF2FF, border 1px #C7D2FE, fg=#2F4BE0. Fehler: bg=#FEF3F2, border 1px #FECDCA, fg=#B42318. Leer: bg=#F5F7FA, border 1px #D8DCE3, fg=#667085. Radius lg 12px, padding 16px, Icon + Text, max-width 640px. Dark: Laden bg=#1E2340, Fehler bg=#2A1518, Leer bg=#161A21.

### KpiCard

bg=#F5F7FA, radius lg 12px, padding 16px, min-height 88px. Label #667085 12px, Wert #1A1D23 22px, font-weight 600, numerisch in font_mono. Dark: bg=#161A21, Wert=#E6E8EC.

### Chart

SVG ohne externe Bibliothek. Achsen #D8DCE3, Gitterlinien #EDF0F5, Balken #3B5BFD, Hover-Balken #2F4BE0, Linie 2px #3B5BFD, Datenpunkte Radius 3px, Fläche unter Linie rgba(59,91,253,0.08), Achsenlabels #667085 12px. Tooltip als HTML-Overlay: bg=#1A1D23, fg=#FFFFFF, radius md 8px, padding 8px 10px, font-size 12px. Dark: Achsen #2E3440, Gitter #232A35, Labels #98A2B3.

### Pagination

Seitenbuttons min 36x36 px, radius md 8px, bg transparent, fg=#1A1D23, hover bg=#F5F7FA. Aktiv: bg=#3B5BFD, fg=#FFFFFF. Disabled: opacity 0.5. Seitengrößen-Select daneben, min-height 36px. Dark: fg=#E6E8EC, hover bg=#1E232C.

### Link

fg=#3B5BFD, underline offset 3px, hover fg=#2F4BE0 + underline, focus-visible 2px Ring #6C82FF. Navigationseinträge min 44px Klickfläche. Dark: fg=#6C82FF.

### AppHeader

Sticky top, bg rgba(255,255,255,0.92), backdrop-filter blur(8px), border-bottom 1px #D8DCE3, Höhe 64px, Inhalt max-width 1200px zentriert. Dark: bg rgba(15,17,21,0.92), border=#2E3440.

## Layout Principles

- Inhalte in max-width 1200px Container zentrieren, Seitenpadding 16px (Mobile) bzw. 24px (Desktop).
- Breakpoints: <640px einspaltig und Tabelle horizontal scrollbar; 640–1024px kompakt mit umbrechender Werkzeugleiste; ≥1024px volle Ansicht mit Tabelle und Diagrammen nebeneinander.
- 8px-Raster für Abstände; Sektionen mit 24px/32px Abstand, eng verwandte Steuerelemente mit 8px/12px.
- Tabelle als primäres Element: Sticky-Kopfzeile, horizontal scrollbar auf kleinen Screens, Filterzeile direkt über der Tabelle fixiert unter dem Header.
- Dark Mode über data-theme='dark' am <html>-Element; ein kleines Inline-Script vor dem Rendern verhindert Flackern beim Start.
- Alle interaktiven Elemente mit sichtbarem Fokus-Ring (2px #6C82FF, offset 2px) für vollständige Tastaturbedienbarkeit.
- Kontrast mindestens AA (4.5:1 für Text): #667085 nur für Sekundärtext, Haupttext #1A1D23 bzw. #E6E8EC im Dark Mode.
