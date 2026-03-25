import React, { useState } from 'react';

const SidebarParcSocial = ({ 
  regions, selectedRegion, setSelectedRegion, 
  sortFluxOrder, setSortFluxOrder,
  ageWeight = 33, setAgeWeight,
  energetiqueWeight = 33, setEnergetiqueWeight,
  vacanceWeight = 33, setVacanceWeight
}) => {
  const handleAgeChange = (newVal) => {
    const newAge = parseInt(newVal);
    const diff = newAge - ageWeight;
    setAgeWeight(newAge);
    
    // Distribuer la différence entre les deux autres
    const totalOther = energetiqueWeight + vacanceWeight;
    if (totalOther > 0) {
      const newEnergetique = Math.max(0, energetiqueWeight - diff / 2);
      const newVacance = 100 - newAge - newEnergetique;
      setEnergetiqueWeight(Math.round(newEnergetique));
      setVacanceWeight(Math.round(newVacance));
    }
  };

  const handleEnergetiqueChange = (newVal) => {
    const newEner = parseInt(newVal);
    const diff = newEner - energetiqueWeight;
    setEnergetiqueWeight(newEner);
    
    const totalOther = ageWeight + vacanceWeight;
    if (totalOther > 0) {
      const newAge = Math.max(0, ageWeight - diff / 2);
      const newVacance = 100 - newEner - newAge;
      setAgeWeight(Math.round(newAge));
      setVacanceWeight(Math.round(newVacance));
    }
  };

  const handleVacanceChange = (newVal) => {
    const newVac = parseInt(newVal);
    const diff = newVac - vacanceWeight;
    setVacanceWeight(newVac);
    
    const totalOther = ageWeight + energetiqueWeight;
    if (totalOther > 0) {
      const newAge = Math.max(0, ageWeight - diff / 2);
      const newEner = 100 - newVac - newAge;
      setAgeWeight(Math.round(newAge));
      setEnergetiqueWeight(Math.round(newEner));
    }
  };

  const handleReset = () => {
    setAgeWeight(33);
    setEnergetiqueWeight(33);
    setVacanceWeight(34);
  };
  return (
    <aside className="static xl:fixed top-0 left-0 w-full xl:w-[20%] h-auto xl:h-screen bg-[#fafaf8] text-[#374151] border-b xl:border-r xl:border-b-0 border-[#e5e7eb] p-5 overflow-y-auto z-20 flex flex-col">
      <h2 className="text-lg font-extrabold tracking-widest text-[#111827] mb-4 border-b border-[#d1d5db] pb-2.5 uppercase text-center xl:text-left mt-2 xl:mt-0">
        DATAVIZ
      </h2>

      <div className="flex-1 flex flex-col gap-3">

        {/* ROW 1 */}
        <div>
          <h3 className="text-[15px] font-bold text-slate-800 mb-3 leading-snug">Urgence Rénovation</h3>
          
          {/* Pondération sliders */}
          <div className="bg-white rounded-md border border-slate-200 p-1.5 mb-1">
            <div className="mb-2.5 flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-700 w-12">Âge</label>
              <input 
                type="range"
                min="0"
                max="100"
                value={ageWeight}
                onChange={(e) => handleAgeChange(e.target.value)}
                className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-700"
              />
              <span className="text-xs font-bold text-slate-800 bg-slate-100 px-1 py-0 rounded w-8 text-center">{ageWeight}%</span>
            </div>

            <div className="mb-2.5 flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-700 w-12">Énerg.</label>
              <input 
                type="range"
                min="0"
                max="100"
                value={energetiqueWeight}
                onChange={(e) => handleEnergetiqueChange(e.target.value)}
                className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-700"
              />
              <span className="text-xs font-bold text-slate-800 bg-slate-100 px-1 py-0 rounded w-8 text-center">{energetiqueWeight}%</span>
            </div>

            <div className="mb-2.5 flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-700 w-12">Vacance</label>
              <input 
                type="range"
                min="0"
                max="100"
                value={vacanceWeight}
                onChange={(e) => handleVacanceChange(e.target.value)}
                className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-700"
              />
              <span className="text-xs font-bold text-slate-800 bg-slate-100 px-1 py-0 rounded w-8 text-center">{vacanceWeight}%</span>
            </div>

            <button
              onClick={handleReset}
              className="w-full px-2 py-0.5 text-xs font-medium bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors"
            >
              Réinit.
            </button>
          </div>
        </div>

        {/* ROW 2 */}
        <div>
          <h3 className="text-[15px] font-bold text-slate-800 mb-0.5 leading-snug">Prix vs Qualité</h3>
        </div>

        {/* ROW 3 */}
        <div>
          <h3 className="text-[15px] font-bold text-slate-800 mb-3 leading-snug">Mouvements du Parc</h3>
          
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
        </div>

        {/* ROW 5 */}
        <div>
          <h3 className="text-[15px] font-bold text-slate-800 mb-0.5 leading-snug">Loyer par Région</h3>
        </div>

      </div>
    </aside>
  );
};

export default SidebarParcSocial;
