const HomePage = () => {
  return (
    <section className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <h1 className="text-4xl md:text-6xl font-black text-[#1a1a2e] mb-6">
        Bienvenue sur DataViz
      </h1>
      <p className="text-lg md:text-xl text-gray-500 max-w-2xl mb-10 leading-relaxed gap-2">
        Explorez les donnees en croisant densite, revenus et offre de logements.
      </p>
      
      <div className="text-gray-500 text-sm bg-white px-6 py-4 rounded-lg border border-gray-200 shadow-sm">
        Brouillon de Landing Page en preparation...
      </div>
    </section>
  );
};

export default HomePage;
