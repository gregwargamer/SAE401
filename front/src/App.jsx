import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LogementPage from './pages/LogementPage';
import ParcSocialPage from './pages/ParcSocialPage';
import PopulationPage from './pages/PopulationPage';
import TestPage from './pages/TestPage';

function App() {
  // Classe Tailwind réutilisable pour les liens de la navbar :
  // - texte gris par défaut, noir au survol
  // - si actif : devient noir et "font-bold" (texte en gras)
  // - plus aucun bouton à contour !
  const lienNav = ({ isActive }) =>
    `py-1 font-medium transition-colors duration-200 text-xs sm:text-sm xl:text-base ${
      isActive ? "text-[#1f2a2e] font-bold" : "text-[#4a5256] hover:text-[#1f2a2e]"
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f7f4] to-[#ecece4] overflow-x-hidden text-[#1f2a2e]">
      <header className="flex items-center justify-end px-2 sm:px-8 py-2 sm:py-4 relative z-10 pointer-events-none">
        <nav className="flex flex-row gap-2 sm:gap-4 xl:gap-6 flex-wrap justify-end items-center pointer-events-auto" aria-label="Navigation principale">
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
          <NavLink to="/test" className={lienNav}>
            Test (Brouillon)
          </NavLink>
        </nav>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 w-full h-full pb-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/test" element={<TestPage />} />
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
