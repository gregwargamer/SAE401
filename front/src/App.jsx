import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LogementPage from './pages/LogementPage';
import ParcSocialPage from './pages/ParcSocialPage';
import PopulationPage from './pages/PopulationPage';

function App() {
  // Classe Tailwind réutilisable pour les liens de la navbar :
  // - texte gris par défaut, noir au survol
  // - si actif : devient noir et "font-bold" (texte en gras)
  // - plus aucun bouton à contour !
  const lienNav = ({ isActive }) =>
    `py-1 font-medium transition-colors duration-200 ${
      isActive ? "text-[#1f2a2e] font-bold" : "text-[#4a5256] hover:text-[#1f2a2e]"
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f7f4] to-[#ecece4] overflow-x-hidden text-[#1f2a2e]">
      <header className="flex items-center justify-between px-8 pt-3 pb-2">
        <div className="text-2xl font-extrabold tracking-widest text-[#1f2a2e]">
          DATAVIZ
        </div>
        <nav className="flex gap-6 flex-wrap justify-end" aria-label="Navigation principale">
          <NavLink to="/" end className={lienNav}>
            Accueil
          </NavLink>
          <NavLink to="/parc-social" className={lienNav}>
            Parc social
          </NavLink>
          <NavLink to="/logement" className={lienNav}>
            Stat logement
          </NavLink>
          <NavLink to="/population" className={lienNav}>
            Population
          </NavLink>
        </nav>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="px-8 pb-8 pt-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/parc-social" element={<ParcSocialPage />} />
          <Route path="/logement" element={<LogementPage />} />
          <Route path="/population" element={<PopulationPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
    </div>
  );
}

export default App;
