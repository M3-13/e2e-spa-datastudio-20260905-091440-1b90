import { Link, Route, Routes } from 'react-router-dom';
import PersistenceBridge from './components/PersistenceBridge';
import ThemeToggle from './components/ThemeToggle';
import DataStudioPage from './pages/DataStudioPage';
import LegalPage from './pages/LegalPage';

function App() {
  return (
    <>
      <PersistenceBridge />
      <div className="app-shell">
        <header className="app-header">
          <div className="app-header__inner">
            <Link className="app-title" to="/">
              CSV DataStudio
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<DataStudioPage />} />
            <Route path="/legal" element={<LegalPage kind="legal" />} />
            <Route path="/privacy" element={<LegalPage kind="privacy" />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <div className="app-footer__inner">
            <span className="app-footer__brand">CSV DataStudio</span>
            <nav className="app-footer__links">
              <Link to="/legal">Impressum</Link>
              <Link to="/privacy">Datenschutz</Link>
            </nav>
          </div>
        </footer>
      </div>
    </>
  );
}

export default App;
