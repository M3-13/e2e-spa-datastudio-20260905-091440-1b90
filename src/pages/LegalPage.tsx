interface LegalPageProps {
  kind: 'legal' | 'privacy';
}

function LegalPage({ kind }: LegalPageProps) {
  const title = kind === 'legal' ? 'Impressum' : 'Datenschutz';
  return (
    <div className="legal-page">
      <h1 className="legal-page__title">{title}</h1>
      <p className="legal-page__note">
        Diese Seite wird in einem späteren Schritt bereitgestellt.
      </p>
    </div>
  );
}

export default LegalPage;
