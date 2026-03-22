import React from 'react';

const SidebarLogement = () => {
  return (
    <aside className="fixed top-0 left-0 w-[240px] lg:w-[22%] h-screen bg-transparent text-[#374151] border-r border-[#e5e7eb] p-5 overflow-y-auto z-20 flex flex-col">
      <h2 className="text-lg font-extrabold tracking-widest text-[#111827] mb-5 border-b border-[#d1d5db] pb-2.5 uppercase">
        DATAVIZ
      </h2>

      <div className="flex-1 flex flex-col gap-4">
        
        {/* ROW 1 */}
        <div>
          <h3 className="text-[15px] font-bold text-slate-800 mb-0.5 leading-snug">Palmarès : Taux de logements sociaux</h3>
          <p className="text-xs text-slate-400 italic">Aucun filtre disponible</p>
        </div>

        {/* ROW 2 */}
        <div>
          <h3 className="text-[15px] font-bold text-slate-800 mb-0.5 leading-snug">Logements individuels vs collectifs</h3>
          <p className="text-xs text-slate-400 italic">Aucun filtre disponible</p>
        </div>

        {/* ROW 3 - GAUCHE */}
        <div>
          <h3 className="text-[15px] font-bold text-slate-800 mb-0.5 leading-snug">Densité vs Taux de logements sociaux</h3>
          <p className="text-xs text-slate-400 italic">Aucun filtre disponible</p>
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