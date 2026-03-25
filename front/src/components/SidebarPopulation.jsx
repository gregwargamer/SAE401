import React from 'react';

const SidebarPopulation = ({ 
  sansGers, setSansGers,
  sortJeunes, setSortJeunes,
  sortPauvrete, setSortPauvrete,
  selectedRadarDept, setSelectedRadarDept, depsList 
}) => {
  return (
    <aside className="static xl:fixed top-0 left-0 w-full xl:w-[20%] h-auto xl:h-screen bg-[#fafaf8] text-[#374151] border-b xl:border-r xl:border-b-0 border-[#e5e7eb] p-5 overflow-y-auto z-20 flex flex-col">
      <h2 className="text-lg font-extrabold tracking-widest text-[#111827] mb-4 border-b border-[#d1d5db] pb-2.5 uppercase text-center xl:text-left mt-2 xl:mt-0">
        DATAVIZ
      </h2>

      <div className="flex-1 flex flex-col gap-3">
        
        {/* ROW 1 */}
        <div>
          <h3 className="text-[15px] font-bold text-slate-800 mb-1.5 leading-snug">Chômage, Pauvreté et Parc Social</h3>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setSansGers(!sansGers)}
              className={`w-full text-left px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-md transition-colors ${
                sansGers 
                  ? 'bg-[#1f2a2e] text-white border-[#1f2a2e]' 
                  : 'text-slate-600 bg-white hover:bg-slate-50'
              }`}
            >
              {sansGers ? 'Inclure le Gers (Valeur extrême)' : 'Retirer le Gers'}
            </button>
          </div>
        </div>

        {/* ROW 3 */}
        <div className="mt-2">
          <h3 className="text-[15px] font-bold text-slate-800 mb-1.5 leading-snug">Pauvreté et Densité</h3>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setSortPauvrete && setSortPauvrete('asc')}
              className={`w-full text-left px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-md transition-colors ${
                sortPauvrete === 'asc' 
                  ? 'bg-[#1f2a2e] text-white border-[#1f2a2e]' 
                  : 'text-slate-600 bg-white hover:bg-slate-50'
              }`}
            >
              Croissant (Du moins au plus pauvre)
            </button>
            <button
              onClick={() => setSortPauvrete && setSortPauvrete('desc')}
              className={`w-full text-left px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-md transition-colors ${
                sortPauvrete === 'desc' 
                  ? 'bg-[#1f2a2e] text-white border-[#1f2a2e]' 
                  : 'text-slate-600 bg-white hover:bg-slate-50'
              }`}
            >
              Décroissant (Du plus au moins pauvre)
            </button>
          </div>
        </div>

        {/* ROW 4 - GAUCHE */}
        <div className="mt-2">
          <h3 className="text-[15px] font-bold text-slate-800 mb-1.5 leading-snug">Répartition : Jeunes vs Seniors</h3>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setSortJeunes && setSortJeunes('asc')}
              className={`w-full text-left px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-md transition-colors ${
                sortJeunes === 'asc' 
                  ? 'bg-[#1f2a2e] text-white border-[#1f2a2e]' 
                  : 'text-slate-600 bg-white hover:bg-slate-50'
              }`}
            >
              Croissant (Plus vieux en premier)
            </button>
            <button
              onClick={() => setSortJeunes && setSortJeunes('desc')}
              className={`w-full text-left px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-md transition-colors ${
                sortJeunes === 'desc' 
                  ? 'bg-[#1f2a2e] text-white border-[#1f2a2e]' 
                  : 'text-slate-600 bg-white hover:bg-slate-50'
              }`}
            >
              Décroissant (Plus jeunes en premier)
            </button>
          </div>
        </div>

        {/* ROW 4 - DROITE */}
        <div className="mt-2 text-left">
          <h3 className="text-[15px] font-bold text-slate-800 mb-1.5 leading-snug">Profil départemental</h3>
          {depsList && depsList.length > 0 ? (
            <select
              value={selectedRadarDept || '01'}
              onChange={(e) => setSelectedRadarDept && setSelectedRadarDept(e.target.value)}
              className="w-full text-left px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-md bg-white text-slate-600 focus:ring-[#1f2a2e] focus:border-[#1f2a2e]"
            >
              {depsList.map((d, i) => (
                <option key={`opt-${d.code}-${i}`} value={d.code}>{d.nom} ({d.code})</option>
              ))}
            </select>
          ) : (
            <p className="text-xs text-slate-400 italic">Chargement des départements...</p>
          )}
        </div>

      </div>
    </aside>
  );
};

export default SidebarPopulation;