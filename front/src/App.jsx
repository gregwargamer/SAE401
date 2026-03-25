import { useState } from "react";
import {
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import CustomPage from "./pages/CustomPage";
import HomePage from "./pages/HomePage";
import LogementPage from "./pages/LogementPage";
import ParcSocialPage from "./pages/ParcSocialPage";
import PopulationPage from "./pages/PopulationPage";
import TestPage from "./pages/TestPage";

function App() {
  const [menuMobileOuvert, setMenuMobileOuvert] = useState(false);
  const location = useLocation();

  const lienNav = ({ isActive }) =>
    `py-1 font-medium transition-colors duration-200 text-xs sm:text-sm xl:text-base ${
      isActive
        ? "text-[#1f2a2e] font-bold"
        : "text-[#4a5256] hover:text-[#1f2a2e]"
    }`;

  const lienNavMobile = ({ isActive }) =>
    `block w-full rounded-xl px-4 py-2.5 text-lg font-semibold transition-colors duration-200 ${
      isActive
        ? "bg-slate-100 text-[#1f2a2e]"
        : "text-[#2f3b40] hover:bg-slate-100"
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f7f4] to-[#ecece4] overflow-x-hidden text-[#1f2a2e]">
      <header className="flex items-center justify-end px-2 sm:px-8 py-2 sm:py-4 relative z-10 pointer-events-none">
        <nav
          className="hidden sm:flex flex-row gap-2 sm:gap-4 xl:gap-6 flex-wrap justify-end items-center pointer-events-auto"
          aria-label="Navigation principale"
        >
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
          <NavLink to="/custom" className={lienNav}>
            Comparateur
          </NavLink>
        </nav>
      </header>

      <button
        type="button"
        onClick={() => setMenuMobileOuvert((ouvert) => !ouvert)}
        className="sm:hidden fixed top-4 right-4 z-40 h-14 w-14 rounded-full bg-[#1f2a2e] text-white shadow-lg flex items-center justify-center"
        aria-label={
          menuMobileOuvert
            ? "Fermer le menu de navigation"
            : "Ouvrir le menu de navigation"
        }
        aria-expanded={menuMobileOuvert}
        aria-controls="menu-mobile"
      >
        <span className="text-2xl leading-none">
          {menuMobileOuvert ? "×" : "☰"}
        </span>
      </button>

      {menuMobileOuvert && (
        <nav
          id="menu-mobile"
          className="sm:hidden fixed top-20 right-4 z-40 bg-white/95 backdrop-blur rounded-3xl shadow-lg border border-slate-200 p-4 min-w-[240px] mobile-menu-panel"
          aria-label="Menu mobile"
        >
          <div className="flex flex-col gap-2">
            <NavLink
              to="/"
              end
              onClick={() => setMenuMobileOuvert(false)}
              className={`${lienNavMobile({ isActive: location.pathname === "/" })} mobile-menu-item`}
              style={{ animationDelay: "20ms" }}
            >
              Accueil
            </NavLink>
            <NavLink
              to="/parc-social"
              onClick={() => setMenuMobileOuvert(false)}
              className={`${lienNavMobile({ isActive: location.pathname === "/parc-social" })} mobile-menu-item`}
              style={{ animationDelay: "60ms" }}
            >
              Parc social
            </NavLink>
            <NavLink
              to="/logement"
              onClick={() => setMenuMobileOuvert(false)}
              className={`${lienNavMobile({ isActive: location.pathname === "/logement" })} mobile-menu-item`}
              style={{ animationDelay: "100ms" }}
            >
              Stat logement
            </NavLink>
            <NavLink
              to="/population"
              onClick={() => setMenuMobileOuvert(false)}
              className={`${lienNavMobile({ isActive: location.pathname === "/population" })} mobile-menu-item`}
              style={{ animationDelay: "140ms" }}
            >
              Population
            </NavLink>
            <NavLink
              to="/test"
              onClick={() => setMenuMobileOuvert(false)}
              className={`${lienNavMobile({ isActive: location.pathname === "/test" })} mobile-menu-item`}
              style={{ animationDelay: "180ms" }}
            >
              Test (Brouillon)
            </NavLink>
            <NavLink
              to="/custom"
              onClick={() => setMenuMobileOuvert(false)}
              className={`${lienNavMobile({ isActive: location.pathname === "/custom" })} mobile-menu-item`}
              style={{ animationDelay: "220ms" }}
            >
              Comparateur
            </NavLink>
          </div>
        </nav>
      )}

      <main className="flex-1 w-full h-full pb-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/parc-social" element={<ParcSocialPage />} />
          <Route path="/logement" element={<LogementPage />} />
          <Route path="/population" element={<PopulationPage />} />
          <Route path="/custom" element={<CustomPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
