import React from 'react';

const SidebarLogement = ({ sortIndividuel, setSortIndividuel, showDOM, setShowDOM }) => {
  return (
    <aside className="static xl:fixed top-0 left-0 w-full xl:w-[19%] h-auto xl:h-screen bg-[#fafaf8] text-[#374151] border-b xl:border-r xl:border-b-0 border-[#e5e7eb] p-5 overflow-y-auto z-20 flex flex-col">
      <h2 className="text-lg font-extrabold tracking-widest text-[#111827] mb-4 border-b border-[#d1d5db] pb-2.5 uppercase text-center xl:text-left mt-2 xl:mt-0">
        DATAVIZ
      </h2>

      <div className="flex-1 flex flex-col gap-3">
        
        {/* ROW 1 */}
        <div>
          <h3 className="text-[15px] font-bold text-slate-800 mb-0.5 leading-snug">Palmarès : Taux de logements sociaux</h3>
          <p className="text-xs text-slate-400 italic">Aucun filtre disponible</p>
        </div>

        {/* ROW 2 */}
        <div>
          <h3 className="text-[15px] font-bold text-slate-800 mb-0.5 leading-snug">Logements individuels vs collectifs</h3>
          <div className="flex flex-col gap-2 mt-2">
            <button
              onClick={() => setSortIndividuel && setSortIndividuel('asc')}
              className={`w-full py-1.5 text-xs font-medium rounded-md transition-colors ${sortIndividuel === 'asc' ? 'bg-[#1f2a2e] text-white' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'}`}
            >
              Croissant
            </button>
            <button
              onClick={() => setSortIndividuel && setSortIndividuel('desc')}
              className={`w-full py-1.5 text-xs font-medium rounded-md transition-colors ${sortIndividuel === 'desc' ? 'bg-[#1f2a2e] text-white' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'}`}
            >
              Décroissant
            </button>
          </div>
        </div>

        {/* ROW 3 - GAUCHE */}
        <div>
          <h3 className="text-[15px] font-bold text-slate-800 mb-0.5 leading-snug">Densité vs Taux de logements sociaux</h3>
          <div className="mt-2">
            <button
              onClick={() => setShowDOM && setShowDOM(!showDOM)}
              className={`w-full py-1.5 px-3 text-xs font-medium rounded-md transition-colors ${!showDOM ? 'bg-[#1f2a2e] text-white' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'}`}
            >
              {showDOM ? 'Retirer DOM' : 'Inclure DOM'}
            </button>
          </div>
        </div>

        {/* ROW 3 - DROITE */}
        <div>
          <h3 className="text-[15px] font-bold text-slate-800 mb-0.5 leading-snug">Construction neuve × Taux de logements vacants</h3>
          <p className="text-xs text-slate-400 italic">Aucun filtre disponible</p>
        </div>

      </div>
    </aside>
  );
};

export default SidebarLogement;