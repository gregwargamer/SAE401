import React from 'react';

const SidebarParcSocial = ({ regions, selectedRegion, setSelectedRegion, sortFluxOrder, setSortFluxOrder }) => {
  return (
    <aside className="fixed top-0 left-0 w-[240px] lg:w-[22%] h-screen bg-transparent text-[#374151] border-r border-[#e5e7eb] p-5 overflow-y-auto z-20 flex flex-col">
      <h2 className="text-lg font-extrabold tracking-widest text-[#111827] mb-5 border-b border-[#d1d5db] pb-2.5 uppercase">
        DATAVIZ
      </h2>

      <div className="flex-1 flex flex-col gap-4">

        {/* ROW 1 */}
        <div>
          <h3 className="text-[15px] font-bold text-slate-800 mb-0.5 leading-snug">Urgence Rénovation</h3>
          <p className="text-xs text-slate-400 italic">Score de vétusté sur 100</p>
        </div>

        {/* ROW 2 */}
        <div>
          <h3 className="text-[15px] font-bold text-slate-800 mb-0.5 leading-snug">Prix vs Qualité</h3>
          <p className="text-xs text-slate-400 italic">Paient-ils cher pour des passoires ?</p>
        </div>

        {/* ROW 3 */}
        <div>
          <h3 className="text-[15px] font-bold text-slate-800 mb-0.5 leading-snug">Mouvements du Parc</h3>
          <p className="text-xs text-slate-400 italic mb-3">Entrées vs Sorties (Top 15)</p>
          
          <select 
            value={selectedRegion} 
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full text-sm border border-slate-300 rounded-md p-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
          >
            <option value="Toutes">Par défaut</option>
            {regions && regions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => setSortFluxOrder && setSortFluxOrder('asc')}
              className={`w-full py-1.5 text-xs font-medium rounded-md transition-colors ${sortFluxOrder === 'asc' ? 'bg-[#1f2a2e] text-white' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'}`}
            >
              Croissant
            </button>
            <button
              onClick={() => setSortFluxOrder && setSortFluxOrder('desc')}
              className={`w-full py-1.5 text-xs font-medium rounded-md transition-colors ${sortFluxOrder === 'desc' ? 'bg-[#1f2a2e] text-white' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'}`}
            >
              Décroissant
            </button>
          </div>
        </div>

        {/* ROW 4 */}
        <div>
          <h3 className="text-[15px] font-bold text-slate-800 mb-0.5 leading-snug">Âge moyen × Vacance</h3>
          <p className="text-xs text-slate-400 italic">Le parc ancien peine à louer ?</p>
        </div>

        {/* ROW 5 */}
        <div>
          <h3 className="text-[15px] font-bold text-slate-800 mb-0.5 leading-snug">Loyer par Région</h3>
          <p className="text-xs text-slate-400 italic">Moyenne VS moyenne nationale</p>
        </div>

      </div>
    </aside>
  );
};

export default SidebarParcSocial;
