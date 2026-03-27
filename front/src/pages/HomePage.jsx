import { Link } from "react-router-dom";
import logementImage from "../assets/logement.jpg";

const HomePage = () => {
  const pagesExistantes = [
    { 
      to: "/parc-social", 
      label: "Parc social",
      description: "Données du parc immobilier social"
    },
    { 
      to: "/logement", 
      label: "Statistiques logement",
      description: "Tendances du marché du logement"
    },
    { 
      to: "/population", 
      label: "Population",
      description: "Indicateurs socio-économiques"
    },
  ];

  return (
    <section className="relative w-full min-h-[100dvh] sm:min-h-0 sm:h-[calc(100dvh-4.5rem)]">
      {/* Logo/Titre en haut à gauche */}
      <div className="absolute top-0 left-0 z-30 p-3 sm:p-5 lg:p-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
          Social<span className="text-blue-400">Scope</span>
        </h1>
      </div>

      <div className="relative min-h-[50dvh] sm:h-full w-full flex items-center justify-center overflow-hidden bg-transparent">
        <img
          src={logementImage}
          alt="Template"
          className="absolute inset-0 h-full w-full object-cover opacity-55 sm:opacity-75"
        />
        <div className="absolute inset-0 bg-black/45 sm:bg-black/40" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent via-[#EFEFE8]/70 to-[#EFEFE8]" />

        <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl sm:-translate-y-8">
          <h1
            className="text-2xl sm:text-4xl lg:text-5xl font-black text-white mb-6 sm:mb-8 leading-snug drop-shadow-[0_2px_14px_rgba(0,0,0,0.5)] home-hero-enter"
            style={{ animationDelay: "40ms" }}
          >
            Visualisez des données officielles de logement social en France
          </h1>

          <div className="home-hero-enter" style={{ animationDelay: "190ms" }}>
            <Link
              to="/creation"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-2 sm:py-3 rounded border-2 border-white bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-colors duration-200 text-sm sm:text-base"
            >
              Créer mon propre graphique
            </Link>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-3 sm:px-4 py-4 sm:py-6 flex flex-col items-center justify-end text-center bg-gradient-to-t from-[#EFEFE8] to-transparent">
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex flex-nowrap justify-center items-center gap-0 pb-2 flex-wrap sm:flex-nowrap">
            {pagesExistantes.map((page, index) => (
              <div key={page.to} className="flex items-center gap-0 home-hero-enter" style={{ animationDelay: `${300 + index * 50}ms` }}>
                <Link
                  to={page.to}
                  className="text-slate-900 font-medium hover:underline transition-all duration-200 px-2 text-xs sm:text-base"
                >
                  {page.label}
                </Link>
                {index < pagesExistantes.length - 1 && <span className="text-slate-900 px-1 sm:px-2 text-xs sm:text-base">·</span>}
              </div>
            ))}
            <div className="flex items-center gap-0 home-hero-enter" style={{ animationDelay: "450ms" }}>
              <span className="text-slate-900 px-1 sm:px-2 text-xs sm:text-base">·</span>
              <Link
                to="/comparateur"
                className="text-slate-900 font-medium hover:underline transition-all duration-200 px-2 text-xs sm:text-base"
              >
                Comparer vos données
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomePage;
