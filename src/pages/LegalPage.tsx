import type { ReactNode } from 'react';

interface LegalPageProps {
  kind: 'legal' | 'privacy';
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="legal-section">
      <h2 className="legal-section__title">{title}</h2>
      <div className="legal-section__body">{children}</div>
    </section>
  );
}

function Placeholder({ children }: { children: ReactNode }) {
  return <span className="legal-placeholder">{children}</span>;
}

function Impressum() {
  return (
    <>
      <h1 className="legal-page__title">Impressum</h1>
      <p className="legal-page__lead">
        Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz).
      </p>

      <Section title="Anbieter">
        <p>
          CSV DataStudio
          <br />
          <Placeholder>[Vorname Nachname]</Placeholder>
          <br />
          <Placeholder>[Straße Hausnummer]</Placeholder>
          <br />
          <Placeholder>[PLZ Ort]</Placeholder>
          <br />
          <Placeholder>[Land]</Placeholder>
        </p>
      </Section>

      <Section title="Kontakt">
        <p>
          Telefon: <Placeholder>[Telefonnummer]</Placeholder>
          <br />
          E-Mail: <Placeholder>[E-Mail-Adresse]</Placeholder>
        </p>
      </Section>

      <Section title="Vertretungsberechtigte Person">
        <p>
          <Placeholder>[Name der vertretungsberechtigten Person]</Placeholder>
        </p>
      </Section>

      <Section title="Registereintrag">
        <p>
          <Placeholder>
            [Handelsregister, Vereinsregister o. Ä. mit Registernummer, falls
            vorhanden]
          </Placeholder>
        </p>
      </Section>

      <Section title="Umsatzsteuer-ID">
        <p>
          <Placeholder>[Umsatzsteuer-Identifikationsnummer, falls vorhanden]</Placeholder>
        </p>
      </Section>

      <Section title="Verantwortlich für den Inhalt (§ 18 Abs. 2 MStV)">
        <p>
          <Placeholder>[Name und Anschrift der verantwortlichen Person]</Placeholder>
        </p>
      </Section>

      <Section title="Haftungshinweis">
        <p>
          Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung
          für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten
          sind ausschließlich deren Betreiber verantwortlich.
        </p>
      </Section>

      <p className="legal-page__hint">
        Diese Seite enthält Platzhalter (grau hervorgehoben), die vor der
        Veröffentlichung durch Ihre tatsächlichen Angaben ersetzt werden müssen.
      </p>
    </>
  );
}

function Privacy() {
  return (
    <>
      <h1 className="legal-page__title">Datenschutzerklärung</h1>
      <p className="legal-page__lead">
        Diese Datenschutzerklärung informiert über die Verarbeitung
        personenbezogener Daten im Rahmen dieser Anwendung.
      </p>

      <Section title="1. Verantwortlicher">
        <p>
          <Placeholder>[Vorname Nachname]</Placeholder>
          <br />
          <Placeholder>[Straße Hausnummer]</Placeholder>
          <br />
          <Placeholder>[PLZ Ort]</Placeholder>
          <br />
          E-Mail: <Placeholder>[E-Mail-Adresse]</Placeholder>
        </p>
      </Section>

      <Section title="2. Grundsatz der Datenverarbeitung">
        <p>
          Diese Anwendung verarbeitet CSV-Daten ausschließlich lokal in Ihrem
          Browser. Ihre Daten werden weder an einen Server übertragen noch an
          Dritte weitergegeben. Es findet keine Datenübermittlung in
          Drittländer statt.
        </p>
      </Section>

      <Section title="3. Lokale Speicherung (LocalStorage)">
        <p>
          Zur Wiederherstellung Ihrer letzten Ansicht speichert die Anwendung
          den zuletzt geladenen Datensatz und Ihre Ansichtseinstellungen lokal
          im Speicher Ihres Browsers (LocalStorage). Diese Daten verbleiben auf
          Ihrem Gerät und können jederzeit über die Löschfunktion der
          Anwendung entfernt werden.
        </p>
      </Section>

      <Section title="4. Rechtsgrundlagen der Verarbeitung">
        <p>
          Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO
          (berechtigtes Interesse am Betrieb und an der Verbesserung der
          Anwendung). Es werden keine Verarbeitungen vorgenommen, die eine
          Einwilligung erfordern.
        </p>
      </Section>

      <Section title="5. Speicherdauer">
        <p>
          Daten werden ausschließlich im lokalen Speicher Ihres Browsers
          gehalten, bis Sie diese selbst löschen oder den Browserspeicher
          leeren. Es erfolgt keine automatische Löschung durch die Anwendung.
        </p>
      </Section>

      <Section title="6. Ihre Rechte">
        <p>
          Ihnen stehen nach Maßgabe der gesetzlichen Bestimmungen folgende
          Rechte zu: Recht auf Auskunft, Berichtigung, Löschung,
          Einschränkung der Verarbeitung, Datenübertragbarkeit sowie das Recht
          auf Widerspruch. Da sämtliche Daten ausschließlich lokal auf Ihrem
          Gerät verarbeitet werden, können Sie diese Rechte selbst durch die
          Bedienung der Anwendung sowie durch Löschen der Browserdaten ausüben.
        </p>
      </Section>

      <Section title="7. Beschwerderecht">
        <p>
          Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über
          die Verarbeitung Ihrer personenbezogenen Daten zu beschweren.
        </p>
      </Section>

      <Section title="8. Hosting und externe Dienste">
        <p>
          Diese Anwendung lädt keine externen Dienste, Schriften oder
          Analyse-Werkzeuge nach. Es werden keine Cookies gesetzt und keine
          Tracking-Technologien eingesetzt.
        </p>
      </Section>

      <p className="legal-page__hint">
        Diese Seite enthält Platzhalter (grau hervorgehoben), die vor der
        Veröffentlichung durch Ihre tatsächlichen Angaben ersetzt werden müssen.
      </p>
    </>
  );
}

function LegalPage({ kind }: LegalPageProps) {
  return (
    <div className="legal-page">
      {kind === 'legal' ? <Impressum /> : <Privacy />}
    </div>
  );
}

export default LegalPage;
