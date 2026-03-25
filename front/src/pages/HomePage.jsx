import { Link } from "react-router-dom";
import logementImage from "../assets/logement.jpg";

const HomePage = () => {
  const pagesExistantes = [
    { to: "/parc-social", label: "Parc social" },
    { to: "/logement", label: "Stat logement" },
    { to: "/population", label: "Population" },
    { to: "/custom", label: "Comparateur" },
    { to: "/test", label: "Test (Brouillon)" },
  ];

  return (
    <section className="relative">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden bg-transparent">
        <img
          src={logementImage}
          alt="Template"
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent via-[#EFEFE8]/70 to-[#EFEFE8]" />

        <div className="relative z-10 text-center px-6 max-w-3xl">
          <h1
            className="text-3xl sm:text-5xl font-black text-white mb-5 leading-tight home-hero-enter"
            style={{ animationDelay: "40ms" }}
          >
            Visualisez des données officielles de logement social en France
          </h1>
          <p
            className="text-base sm:text-xl text-slate-200 mb-8 leading-relaxed home-hero-enter"
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

      <div className="relative z-20 px-4 pt-8 pb-12 flex flex-col items-center justify-start text-center">
        <p className="text-5xl sm:text-7xl font-black text-[#1f2a2e] leading-none mb-4">
          OU
        </p>
        <h2 className="text-xl sm:text-3xl font-extrabold text-slate-800 mb-7">
          Explorer les pages existantes
        </h2>

        <div className="w-[92%] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {pagesExistantes.map((page) => (
            <Link
              key={page.to}
              to={page.to}
              className="w-full inline-flex items-center justify-center px-5 py-3 rounded-xl bg-[#1f2a2e] text-white font-semibold border border-white/20 hover:bg-[#26343a] transition-colors duration-200"
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
