import { Link } from "react-router-dom";
import logementImage from "../assets/logement.jpg";

const HomePage = () => {
  const pagesExistantes = [
    { to: "/parc-social", label: "Parc social" },
    { to: "/logement", label: "Stat logement" },
    { to: "/population", label: "Population" },
    { to: "/custom", label: "Comparateur" },
  ];

  return (
    <section className="relative w-full min-h-[100dvh] sm:min-h-0 sm:h-[calc(100dvh-4.5rem)]">
      <div className="relative min-h-[86dvh] sm:h-full w-full flex items-center justify-center overflow-hidden bg-transparent">
        <img
          src={logementImage}
          alt="Template"
          className="absolute inset-0 h-full w-full object-cover opacity-55 sm:opacity-75"
        />
        <div className="absolute inset-0 bg-black/45 sm:bg-black/40" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent via-[#EFEFE8]/70 to-[#EFEFE8]" />

        <div className="relative z-10 text-center px-6 max-w-3xl sm:-translate-y-8">
          <h1
            className="text-3xl sm:text-5xl font-black text-white mb-5 leading-tight drop-shadow-[0_2px_14px_rgba(0,0,0,0.5)] home-hero-enter"
            style={{ animationDelay: "40ms" }}
          >
            Visualisez des données officielles de logement social en France
          </h1>
          <p
            className="text-base sm:text-xl text-slate-200 sm:text-slate-100 mb-8 leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)] home-hero-enter"
            style={{ animationDelay: "120ms" }}
          >
            Faites défiler sur votre template puis lancez votre propre analyse.
          </p>

          <Link
            to="/test"
            className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-[#1f2a2e] text-white font-semibold border border-white/20 hover:bg-[#26343a] transition-colors duration-200 home-hero-enter"
            style={{ animationDelay: "190ms" }}
          >
            Créer vos propres données
          </Link>
        </div>
      </div>

      <div className="relative sm:absolute z-20 sm:bottom-4 left-0 right-0 px-4 pt-8 sm:pt-0 pb-10 sm:pb-0 flex flex-col items-center justify-start text-center">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 mb-5 sm:mb-3">
          Explorer les pages existantes
        </h2>

        <div className="w-[92%] sm:w-[95%] max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {pagesExistantes.map((page) => (
            <Link
              key={page.to}
              to={page.to}
              className="w-full inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#1f2a2e] text-white font-semibold border border-white/20 hover:bg-[#26343a] transition-colors duration-200"
            >
              {page.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomePage;
