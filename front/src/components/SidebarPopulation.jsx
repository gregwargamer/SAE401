import React from 'react';

const SidebarPopulation = ({ showDomNatMig, setShowDomNatMig, sansGers, setSansGers }) => {
  return (
    <aside className="fixed top-0 left-0 w-[240px] lg:w-[22%] h-screen bg-transparent text-[#374151] border-r border-[#e5e7eb] p-5 overflow-y-auto z-20 flex flex-col">
      <h2 className="text-lg font-extrabold tracking-widest text-[#111827] mb-5 border-b border-[#d1d5db] pb-2.5 uppercase">
        DATAVIZ
      </h2>

      <div className="flex-1 flex flex-col gap-4">
        
        {/* ROW 1 */}
        <div>
          <h3 className="text-[15px] font-bold text-slate-800 mb-1.5 leading-snug">Chômage, Pauvreté et Parc Social</h3>
          <button
            onClick={() => setSansGers(!sansGers)}
            className={`w-full text-left px-2.5 py-1.5 text-[13px] font-medium border border-slate-300 rounded transition-colors ${
              sansGers 
                ? 'bg-black text-white border-black' 
                : 'text-black bg-slate-50'
            }`}
          >
            Sans le Gers
          </button>
        </div>

        {/* ROW 2 */}
        <div>
          <h3 className="text-[15px] font-bold text-slate-800 mb-1.5 leading-snug">Solde naturel vs Solde migratoire</h3>
          <button
            onClick={() => setShowDomNatMig(!showDomNatMig)}
            className={`w-full text-left px-2.5 py-1.5 text-[13px] font-medium border border-slate-300 rounded transition-colors ${
              showDomNatMig 
                ? 'bg-black text-white border-black' 
                : 'text-black bg-slate-50'
            }`}
          >
            Activer DOM
          </button>
        </div>

        {/* ROW 3 */}
        <div>
          <h3 className="text-[15px] font-bold text-slate-800 mb-0.5 leading-snug">Pauvreté × Variation de population</h3>
          <p className="text-xs text-slate-400 italic">Aucun filtre disponible</p>
        </div>

        {/* ROW 4 - GAUCHE */}
        <div>
          <h3 className="text-[15px] font-bold text-slate-800 mb-0.5 leading-snug">Répartition : Jeunes vs Seniors</h3>
          <p className="text-xs text-slate-400 italic">Aucun filtre disponible</p>
        </div>

        {/* ROW 4 - DROITE */}
        <div>
          <h3 className="text-[15px] font-bold text-slate-800 mb-0.5 leading-snug">Croissance et Chômage</h3>
          <p className="text-xs text-slate-400 italic">Aucun filtre disponible</p>
        </div>

      </div>
    </aside>
  );
};

export default SidebarPopulation;