import React, { useState, useRef, useEffect } from 'react';

const SidebarParcSocial = ({ 
  regions, selectedRegion, setSelectedRegion, regionSearch, setRegionSearch,
  sortFluxOrder, setSortFluxOrder,
  ageWeight = 33, setAgeWeight,
  energetiqueWeight = 33, setEnergetiqueWeight,
  vacanceWeight = 33, setVacanceWeight,
  priceQualityRegion, setPriceQualityRegion, priceQualityRegionSearch, setPriceQualityRegionSearch,
  passoireSeuil, setPassoireSeuil,
  loyerRange, setLoyerRange,
  attractivityRegion, setAttractivityRegion, attractivityRegionSearch, setAttractivityRegionSearch,
  marketTension, setMarketTension,
  minBubbleSize, setMinBubbleSize,
  loyerRegionFilter, setLoyerRegionFilter
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

  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [showPriceQualityRegionDropdown, setShowPriceQualityRegionDropdown] = useState(false);
  const [showAttractivityRegionDropdown, setShowAttractivityRegionDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const priceQualityDropdownRef = useRef(null);
  const attractivityDropdownRef = useRef(null);

  const filteredRegions = regions ? regions.filter(r => {
    if (!regionSearch) return true;
    return r.toLowerCase().includes(regionSearch.toLowerCase());
  }) : [];

  const filteredAttractivityRegions = regions ? regions.filter(r => {
    if (!attractivityRegionSearch) return true;
    return r.toLowerCase().includes(attractivityRegionSearch.toLowerCase());
  }) : [];

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowRegionDropdown(false);
      }
      if (priceQualityDropdownRef.current && !priceQualityDropdownRef.current.contains(e.target)) {
        setShowPriceQualityRegionDropdown(false);
      }
      if (attractivityDropdownRef.current && !attractivityDropdownRef.current.contains(e.target)) {
        setShowAttractivityRegionDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectRegion = (region) => {
    setSelectedRegion(region);
    setRegionSearch('');
    setShowRegionDropdown(false);
  };

  const handleSelectAttractivityRegion = (region) => {
    setAttractivityRegion(region);
    setAttractivityRegionSearch('');
    setShowAttractivityRegionDropdown(false);
  };

  return (
    <aside className="static xl:fixed top-0 left-0 w-full xl:w-[20%] h-auto xl:h-screen bg-[#fafaf8] text-[#374151] border-b xl:border-r xl:border-b-0 border-[#e5e7eb] p-5 overflow-y-auto z-20 flex flex-col">
      <h2 className="text-lg font-extrabold tracking-widest text-[#111827] mb-4 border-b border-[#d1d5db] pb-2.5 text-center xl:text-left mt-2 xl:mt-0">
        SocialScope
      </h2>

      <div className="flex-1 flex flex-col gap-3">

        {/* ROW 1 */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-[15px] font-bold text-slate-800 leading-snug whitespace-nowrap">Urgence Rénovation</h3>
            <div className="flex-1 h-0.5 bg-black"></div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-700 w-12">Âge</label>
              <input 
                type="range"
                min="0"
                max="100"
                value={ageWeight}
                onChange={(e) => handleAgeChange(e.target.value)}
                className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-700"
              />
              <span className="text-xs font-bold text-slate-800 bg-slate-100 px-1.5 py-0 rounded w-8 text-center">{ageWeight}%</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-700 w-12">Énerg.</label>
              <input 
                type="range"
                min="0"
                max="100"
                value={energetiqueWeight}
                onChange={(e) => handleEnergetiqueChange(e.target.value)}
                className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-700"
              />
              <span className="text-xs font-bold text-slate-800 bg-slate-100 px-1.5 py-0 rounded w-8 text-center">{energetiqueWeight}%</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-700 w-12">Vacance</label>
              <input 
                type="range"
                min="0"
                max="100"
                value={vacanceWeight}
                onChange={(e) => handleVacanceChange(e.target.value)}
                className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-700"
              />
              <span className="text-xs font-bold text-slate-800 bg-slate-100 px-1.5 py-0 rounded w-8 text-center">{vacanceWeight}%</span>
            </div>

            <button
              onClick={handleReset}
              className="w-full px-2 py-1 text-xs font-medium bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors mt-1"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {/* ROW 2 */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-[15px] font-bold text-slate-800 leading-snug whitespace-nowrap">Prix vs Qualité</h3>
            <div className="flex-1 h-0.5 bg-black"></div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <div className="relative" ref={priceQualityDropdownRef}>
              <input 
                type="text"
                placeholder={priceQualityRegion === "Toutes" ? "Chercher..." : priceQualityRegion}
                value={priceQualityRegionSearch}
                onChange={(e) => {
                  setPriceQualityRegionSearch(e.target.value);
                  setShowPriceQualityRegionDropdown(true);
                }}
                onFocus={() => setShowPriceQualityRegionDropdown(true)}
                className="w-full text-sm border border-slate-300 rounded-md p-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
              />
              
              {showPriceQualityRegionDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                  <div 
                    onClick={() => {
                      setPriceQualityRegion("Toutes");
                      setPriceQualityRegionSearch('');
                      setShowPriceQualityRegionDropdown(false);
                    }}
                    className={`px-3 py-2 text-sm cursor-pointer ${priceQualityRegion === "Toutes" ? "bg-[#1f2a2e] text-white" : "hover:bg-slate-100"}`}
                  >
                    Par défaut (tous)
                  </div>
                  {regions && regions.filter(r => !priceQualityRegionSearch || r.toLowerCase().includes(priceQualityRegionSearch.toLowerCase())).map(r => (
                    <div 
                      key={r}
                      onClick={() => {
                        setPriceQualityRegion(r);
                        setPriceQualityRegionSearch('');
                        setShowPriceQualityRegionDropdown(false);
                      }}
                      className={`px-3 py-2 text-sm cursor-pointer ${priceQualityRegion === r ? "bg-[#1f2a2e] text-white" : "hover:bg-slate-100"}`}
                    >
                      {r}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-600">Passoires</label>
              <span className="text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0 rounded">{passoireSeuil}%</span>
            </div>
            <input 
              type="range"
              min="0"
              max="100"
              value={passoireSeuil}
              onChange={(e) => setPassoireSeuil(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
            
            <label className="text-xs font-semibold text-slate-600 mt-0.5">Loyer</label>
            <div className="flex gap-1">
              {['all', '<5', '5-6', '>6'].map(range => (
                <button
                  key={range}
                  onClick={() => setLoyerRange(range)}
                  className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${
                    loyerRange === range 
                      ? 'bg-[#1f2a2e] text-white' 
                      : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {range === 'all' ? 'Tous' : range === '<5' ? '<5€' : range === '5-6' ? '5-6€' : '>6€'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ROW 3 */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-[15px] font-bold text-slate-800 leading-snug whitespace-nowrap">Mouvements du Parc</h3>
            <div className="flex-1 h-0.5 bg-black"></div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <div className="relative" ref={dropdownRef}>
              <input 
                type="text"
                placeholder={selectedRegion === "Toutes" ? "Chercher..." : selectedRegion}
                value={regionSearch}
                onChange={(e) => {
                  setRegionSearch(e.target.value);
                  setShowRegionDropdown(true);
                }}
                onFocus={() => setShowRegionDropdown(true)}
                className="w-full text-sm border border-slate-300 rounded-md p-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
              />
              
              {showRegionDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                  <div 
                    onClick={() => handleSelectRegion("Toutes")}
                    className={`px-3 py-2 text-sm cursor-pointer ${selectedRegion === "Toutes" ? "bg-[#1f2a2e] text-white" : "hover:bg-slate-100"}`}
                  >
                    Par défaut (tous)
                  </div>
                  {filteredRegions.map(r => (
                    <div 
                      key={r}
                      onClick={() => handleSelectRegion(r)}
                      className={`px-3 py-2 text-sm cursor-pointer ${selectedRegion === r ? "bg-[#1f2a2e] text-white" : "hover:bg-slate-100"}`}
                    >
                      {r}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-1">
              <button
                onClick={() => setSortFluxOrder && setSortFluxOrder('asc')}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${sortFluxOrder === 'asc' ? 'bg-[#1f2a2e] text-white' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'}`}
              >
                Croissant
              </button>
              <button
                onClick={() => setSortFluxOrder && setSortFluxOrder('desc')}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${sortFluxOrder === 'desc' ? 'bg-[#1f2a2e] text-white' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'}`}
              >
                Décroissant
              </button>
            </div>
          </div>
        </div>

        {/* ROW 4: Attractivité vs Coût */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-[15px] font-bold text-slate-800 leading-snug whitespace-nowrap">Attractivité vs Coût</h3>
            <div className="flex-1 h-0.5 bg-black"></div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <div className="relative" ref={attractivityDropdownRef}>
              <input 
                type="text"
                placeholder={attractivityRegion === "Toutes" ? "Chercher..." : attractivityRegion}
                value={attractivityRegionSearch}
                onChange={(e) => {
                  setAttractivityRegionSearch(e.target.value);
                  setShowAttractivityRegionDropdown(true);
                }}
                onFocus={() => setShowAttractivityRegionDropdown(true)}
                className="w-full text-sm border border-slate-300 rounded-md p-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
              />
              
              {showAttractivityRegionDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                  <div 
                    onClick={() => handleSelectAttractivityRegion("Toutes")}
                    className={`px-3 py-2 text-sm cursor-pointer ${attractivityRegion === "Toutes" ? "bg-[#1f2a2e] text-white" : "hover:bg-slate-100"}`}
                  >
                    Par défaut (tous)
                  </div>
                  {filteredAttractivityRegions.map(r => (
                    <div 
                      key={r}
                      onClick={() => handleSelectAttractivityRegion(r)}
                      className={`px-3 py-2 text-sm cursor-pointer ${attractivityRegion === r ? "bg-[#1f2a2e] text-white" : "hover:bg-slate-100"}`}
                    >
                      {r}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-600">Tension</label>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0 rounded">{(marketTension * 300).toFixed(0)}</span>
            </div>
            <input 
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={marketTension}
              onChange={(e) => setMarketTension(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />

            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-600">Parc</label>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0 rounded">{minBubbleSize}k</span>
            </div>
            <input 
              type="range"
              min="0"
              max="1000"
              step="10"
              value={minBubbleSize}
              onChange={(e) => setMinBubbleSize(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>

        {/* ROW 5: Loyer par Région */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-[15px] font-bold text-slate-800 leading-snug whitespace-nowrap">Loyer par Région</h3>
            <div className="flex-1 h-0.5 bg-black"></div>
          </div>
          
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setLoyerRegionFilter('all')}
              className={`w-full py-1 text-xs font-medium rounded-md transition-colors ${loyerRegionFilter === 'all' ? 'bg-[#1f2a2e] text-white' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'}`}
            >
              Toutes régions
            </button>
            <button
              onClick={() => setLoyerRegionFilter('metropole')}
              className={`w-full py-1 text-xs font-medium rounded-md transition-colors ${loyerRegionFilter === 'metropole' ? 'bg-[#1f2a2e] text-white' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'}`}
            >
              Métropole
            </button>
            <button
              onClick={() => setLoyerRegionFilter('outremer')}
              className={`w-full py-1 text-xs font-medium rounded-md transition-colors ${loyerRegionFilter === 'outremer' ? 'bg-[#1f2a2e] text-white' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'}`}
            >
              Outre-Mer
            </button>
          </div>
        </div>

      </div>
    </aside>
  );
};

export default SidebarParcSocial;
