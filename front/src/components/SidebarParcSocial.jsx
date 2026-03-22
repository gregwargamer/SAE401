import React from 'react';

const SidebarParcSocial = ({ sansGers, setSansGers }) => {
  return (
    <aside className="fixed top-0 left-0 w-[240px] lg:w-[22%] h-screen bg-transparent text-[#374151] border-r border-[#e5e7eb] p-5 overflow-y-auto z-20 flex flex-col">
      <h2 className="text-lg font-extrabold tracking-widest text-[#111827] mb-5 border-b border-[#d1d5db] pb-2.5 uppercase">
        DATAVIZ
      </h2>

      <div className="flex-1 flex flex-col gap-4">

        <div className="flex items-center justify-between mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div>
            <h3 className="text-[13px] font-bold text-slate-800 mb-0.5">Sans le Gers</h3>
            <p className="text-[11px] text-slate-500 line-clamp-1">Masquer le Dép 32</p>
          </div>
          <button
            onClick={() => setSansGers(!sansGers)}
            className={`relative inline-flex h-5 w-9 shrink_0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${sansGers ? 'bg-indigo-600' : 'bg-slate-300'}`}
            role="switch"
            aria-checked={sansGers}
          >
            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${sansGers ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
        </div>
        
        {/* ROW 1 */}
        <div>
          <h3 className="text-[15px] font-bold text-slate-800 mb-0.5 leading-snug">Cartographie de l'Âge du Parc</h3>
          <p className="text-xs text-slate-400 italic">Couleur = Âge moyen</p>
        </div>

        {/* ROW 2 */}
        <div>
          <h3 className="text-[15px] font-bold text-slate-800 mb-0.5 leading-snug">Énergivores vs Loyer</h3>
          <p className="text-xs text-slate-400 italic">Loyers élevés = mieux isolés ?</p>
        </div>

        {/* ROW 3 */}
        <div>
          <h3 className="text-[15px] font-bold text-slate-800 mb-0.5 leading-snug">Mouvements du Parc</h3>
          <p className="text-xs text-slate-400 italic">Entrées vs Sorties</p>
        </div>

        {/* ROW 4 */}
        <div>
          <h3 className="text-[15px] font-bold text-slate-800 mb-0.5 leading-snug">Âge moyen Ô Vacance</h3>
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
