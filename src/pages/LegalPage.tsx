import { Link } from 'react-router-dom';

interface LegalPageProps {
  kind: 'legal' | 'privacy';
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <section className="legal-page__section">
      <h2 className="legal-page__heading">{title}</h2>
      {children}
    </section>
  );
}

function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <span className="legal-page__placeholder" aria-label="Platzhalter, noch auszufüllen">
      {children}
    </span>
  );
}

function Impressum() {
  return (
    <>
      <h1 className="legal-page__title">Impressum</h1>
      <p className="legal-page__note">
        Hinweis: Die folgenden Angaben enthalten Platzhalter, die vor der
        Veröffentlichung durch die tatsächlichen Betreiberdaten zu ersetzen
        sind. Platzhalter sind entsprechend markiert.
      </p>

      <Section title="Angaben gemäß § 5 DDG">
        <p>
          <Placeholder>[Name des Anbieters / der Firma]</Placeholder>
          <br />
          <Placeholder>[Straße und Hausnummer]</Placeholder>
          <br />
          <Placeholder>[Postleitzahl und Ort]</Placeholder>
          <br />
          <Placeholder>[Land]</Placeholder>
        </p>
      </Section>

      <Section title="Vertreten durch">
        <p>
          <Placeholder>[Vorname Nachname]</Placeholder>
        </p>
      </Section>

      <Section title="Kontakt">
        <p>
          E-Mail: <Placeholder>[kontakt@beispiel.de]</Placeholder>
          <br />
          Telefon: <Placeholder>[+49 000 000000]</Placeholder>
        </p>
      </Section>

      <Section title="Umsatzsteuer-ID">
        <p>
          Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:{' '}
          <Placeholder>[DE 000 000 000]</Placeholder>
        </p>
      </Section>

      <Section title="Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV">
        <p>
          <Placeholder>[Vorname Nachname]</Placeholder>
          <br />
          <Placeholder>[Anschrift]</Placeholder>
        </p>
      </Section>

      <Section title="Haftungshinweis">
        <p>
          Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung
          für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten
          sind ausschließlich deren Betreiber verantwortlich.
        </p>
      </Section>
    </>
  );
}

function Datenschutz() {
  return (
    <>
      <h1 className="legal-page__title">Datenschutzerklärung</h1>
      <p className="legal-page__note">
        Hinweis: Diese Erklärung enthält Platzhalter, die vor der
        Veröffentlichung durch die tatsächlichen Angaben der verantwortlichen
        Stelle zu ersetzen sind. Platzhalter sind entsprechend markiert.
      </p>

      <Section title="Verantwortliche Stelle">
        <p>
          <Placeholder>[Name des Anbieters / der Firma]</Placeholder>
          <br />
          <Placeholder>[Straße und Hausnummer]</Placeholder>
          <br />
          <Placeholder>[Postleitzahl und Ort]</Placeholder>
          <br />
          E-Mail: <Placeholder>[kontakt@beispiel.de]</Placeholder>
        </p>
      </Section>

      <Section title="Allgemeines zur Datenverarbeitung">
        <p>
          Diese Anwendung verarbeitet Ihre Daten ausschließlich lokal in Ihrem
          Browser. Geladene CSV-Dateien werden nicht an einen Server
          übertragen, nicht gespeichert und nicht an Dritte weitergegeben. Es
          findet keine Verarbeitung in der Cloud statt.
        </p>
      </Section>

      <Section title="Lokale Speicherung (LocalStorage)">
        <p>
          Diese Anwendung speichert den zuletzt geladenen Datensatz sowie Ihre
          Ansichtseinstellungen im LocalStorage Ihres Browsers, damit Ihre
          Arbeit nach einem Neuladen wiederhergestellt werden kann. Diese Daten
          verbleiben auf Ihrem Gerät und werden nicht übertragen. Sie können
          die gespeicherten Daten jederzeit über die Funktion
          „Daten löschen“ in der Anwendung entfernen.
        </p>
      </Section>

      <Section title="Cookies und Tracking">
        <p>
          Diese Anwendung verwendet keine Cookies und keine Tracking- oder
          Analyse-Dienste. Es werden keine personenbezogenen Daten erhoben,
          verarbeitet oder an Dritte übermittelt.
        </p>
      </Section>

      <Section title="Ihre Rechte">
        <p>
          Sie haben das Recht auf Auskunft, Berichtigung, Löschung,
          Einschränkung der Verarbeitung, Datenübertragbarkeit sowie
          Widerspruch gegen die Verarbeitung Ihrer personenbezogenen Daten.
          Da sämtliche Daten ausschließlich lokal auf Ihrem Gerät verarbeitet
          werden, können Sie diese jederzeit selbst löschen.
        </p>
      </Section>

      <Section title="Kontakt für Datenschutzfragen">
        <p>
          Bei Fragen zum Datenschutz wenden Sie sich bitte an:{' '}
          <Placeholder>[datenschutz@beispiel.de]</Placeholder>
        </p>
      </Section>
    </>
  );
}

function LegalPage({ kind }: LegalPageProps) {
  return (
    <div className="legal-page">
      {kind === 'legal' ? <Impressum /> : <Datenschutz />}
      <p className="legal-page__back">
        <Link to="/">Zurück zur Anwendung</Link>
      </p>
    </div>
  );
}

export default LegalPage;
