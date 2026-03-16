import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LegacyPage from './pages/LegacyPage';
import LogementPage from './pages/LogementPage';
import ParcSocialPage from './pages/ParcSocialPage';
import PopulationPage from './pages/PopulationPage';
import './App.css';

function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">DATAVIZ BETA</div>
        <nav className="main-nav" aria-label="Navigation principale">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Accueil
          </NavLink>
          <NavLink to="/parc-social" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Parc social
          </NavLink>
          <NavLink to="/logement" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Stat logement
          </NavLink>
          <NavLink to="/population" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Population
          </NavLink>
          <NavLink to="/habitants" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            habitants
          </NavLink>
        </nav>
      </header>

      <main className="content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/parc-social" element={<ParcSocialPage />} />
          <Route path="/logement" element={<LogementPage />} />
          <Route path="/population" element={<PopulationPage />} />
          <Route path="/habitants" element={<LegacyPage />} />
          <Route path="/ancienne-vue" element={<LegacyPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
