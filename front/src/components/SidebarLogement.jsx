import React, { useState, useRef, useEffect } from 'react';

const SidebarLogement = ({ 
  sortIndividuel, setSortIndividuel, 
  showDOM, setShowDOM,
  selectedMapVariable, setSelectedMapVariable,
  povertyThreshold, setPovertyThreshold,
  latestData = [],
  selectedRegion, setSelectedRegion,
  topFlopMode, setTopFlopMode,
  socialHousingThreshold, setSocialHousingThreshold,
  showAll, setShowAll,
  searchDept, setSearchDept,
  showDeptSuggestions, setShowDeptSuggestions,
  departementSuggestions = [],
  regionsUniques = [],
  regionSearch, setRegionSearch,
  showRegionSuggestions, setShowRegionSuggestions,
  scatter1Region, setScatter1Region,
  scatter1RegionSearch, setScatter1RegionSearch,
  scatter2Region, setScatter2Region,
  scatter2RegionSearch, setScatter2RegionSearch,
  maxDensity, setMaxDensity
}) => {
  const regionDropdownRef = useRef(null);
  const deptDropdownRef = useRef(null);
  const scatter1DropdownRef = useRef(null);
  const scatter2DropdownRef = useRef(null);
  const [showScatter1Dropdown, setShowScatter1Dropdown] = useState(false);
  const [showScatter2Dropdown, setShowScatter2Dropdown] = useState(false);

  const handleSelectDepartement = (dept) => {
    setSearchDept(typeof dept === 'string' ? dept : dept.nom);
    setShowDeptSuggestions(false);
  };

  const handleSelectRegion = (region) => {
    setSelectedRegion(region);
    setRegionSearch('');
    setShowRegionSuggestions(false);
  };

  // Fermer les dropdowns quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (regionDropdownRef.current && !regionDropdownRef.current.contains(e.target)) {
        setShowRegionSuggestions(false);
      }
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(e.target)) {
        setShowDeptSuggestions(false);
      }
      if (scatter1DropdownRef.current && !scatter1DropdownRef.current.contains(e.target)) {
        setShowScatter1Dropdown(false);
      }
      if (scatter2DropdownRef.current && !scatter2DropdownRef.current.contains(e.target)) {
        setShowScatter2Dropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowDeptSuggestions, setShowRegionSuggestions]);
  return (
    <aside className="static xl:fixed top-0 left-0 w-full xl:w-[20%] h-auto xl:h-screen bg-[#fafaf8] text-[#374151] border-b xl:border-r xl:border-b-0 border-[#e5e7eb] p-5 overflow-y-auto z-20 flex flex-col">
      <h1 className="text-2xl font-extrabold text-[#111827] mb-4 drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
        Social<span className="text-blue-400">Scope</span>
      </h1>

      <div className="flex-1 flex flex-col gap-3">
        
        {/* ROW 1 - CARTE: Variable Selector + Poverty Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-[15px] font-bold text-slate-800 leading-snug">Carte</h3>
            <div className="flex-1 h-0.5 bg-black"></div>
          </div>
          
          {/* Variable Selector */}
          <div className="flex flex-col gap-1.5 mb-3">
            <button
              onClick={() => setSelectedMapVariable('taux_logements_sociaux')}
              className={`w-full text-left px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-md transition-colors ${
                selectedMapVariable === 'taux_logements_sociaux'
                  ? 'bg-[#1f2a2e] text-white border-[#1f2a2e]' 
                  : 'text-slate-600 bg-white hover:bg-slate-50'
              }`}
            >
              Taux de logements sociaux
            </button>
            <button
              onClick={() => setSelectedMapVariable('taux_logements_vacants')}
              className={`w-full text-left px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-md transition-colors ${
                selectedMapVariable === 'taux_logements_vacants'
                  ? 'bg-[#1f2a2e] text-white border-[#1f2a2e]' 
                  : 'text-slate-600 bg-white hover:bg-slate-50'
              }`}
            >
              Taux de vacance
            </button>
            <button
              onClick={() => setSelectedMapVariable('taux_energivores')}
              className={`w-full text-left px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-md transition-colors ${
                selectedMapVariable === 'taux_energivores'
                  ? 'bg-[#1f2a2e] text-white border-[#1f2a2e]' 
                  : 'text-slate-600 bg-white hover:bg-slate-50'
              }`}
            >
              Taux de passoires
            </button>
          </div>

          {/* Poverty Slider */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-600">Pauvreté {`>`}</label>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0 rounded">{povertyThreshold}%</span>
          </div>
          <input 
            type="range"
            min="0"
            max="30"
            value={povertyThreshold}
            onChange={(e) => setPovertyThreshold(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        {/* ROW 2 - Palmarès */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-[15px] font-bold text-slate-800 leading-snug">Palmarès : Taux de logements sociaux</h3>
            <div className="flex-1 h-0.5 bg-black"></div>
          </div>

          {/* Zoom Régional */}
          <div className="flex flex-col gap-1.5 mb-3 relative" ref={regionDropdownRef}>
            <input 
              type="text"
              placeholder={selectedRegion ? selectedRegion : "Chercher une région..."}
              value={regionSearch}
              onChange={(e) => {
                setRegionSearch(e.target.value);
                setShowRegionSuggestions(true);
              }}
              onFocus={() => setShowRegionSuggestions(true)}
              className="w-full text-sm border border-slate-300 rounded-md p-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
            />
            {showRegionSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                <div 
                  onClick={() => handleSelectRegion(null)}
                  className={`px-3 py-2 text-sm cursor-pointer ${!selectedRegion ? 'bg-[#1f2a2e] text-white' : 'hover:bg-slate-100'}`}
                >
                  Par défaut (tous)
                </div>
                {regionsUniques && regionsUniques.filter(r => !regionSearch || r.toLowerCase().includes(regionSearch.toLowerCase())).map(region => (
                  <div 
                    key={region}
                    onClick={() => handleSelectRegion(region)}
                    className={`px-3 py-2 text-sm cursor-pointer ${selectedRegion === region ? 'bg-[#1f2a2e] text-white' : 'hover:bg-slate-100'}`}
                  >
                    {region}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tri Top/Flop */}
          <div className="mb-3">
            <label className="text-xs font-semibold text-slate-700 block mb-1">Tri</label>
            <div className="flex gap-1">
              <button
                onClick={() => setTopFlopMode('top')}
                className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  topFlopMode === 'top'
                    ? 'bg-[#1f2a2e] text-white'
                    : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
                }`}
              >
                Top 5
              </button>
              <button
                onClick={() => setTopFlopMode('flop')}
                className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  topFlopMode === 'flop'
                    ? 'bg-[#1f2a2e] text-white'
                    : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
                }`}
              >
                Flop 5
              </button>
              <button
                onClick={() => setTopFlopMode('both')}
                className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  topFlopMode === 'both'
                    ? 'bg-[#1f2a2e] text-white'
                    : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
                }`}
              >
                T&F
              </button>
            </div>
          </div>

          {/* Seuil Logements Sociaux */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-600">Seuil {`>`}</label>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0 rounded">{socialHousingThreshold}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            value={socialHousingThreshold}
            onChange={(e) => setSocialHousingThreshold(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
        </div>

        {/* ROW 3 */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-[15px] font-bold text-slate-800 leading-snug">Logements individuels vs collectifs</h3>
            <div className="flex-1 h-0.5 bg-black"></div>
          </div>

          {/* Top 15 / Tous */}
          <div className="mb-3">
            <button
              onClick={() => setShowAll(!showAll)}
              className={`w-full py-1.5 text-xs font-medium rounded-md transition-colors ${
                showAll
                  ? 'bg-[#1f2a2e] text-white'
                  : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              {showAll ? 'Afficher Tous' : 'Top 15'}
            </button>
          </div>

          {/* Recherche avec suggestions */}
          <div className="relative" ref={deptDropdownRef}>
            <input
              type="text"
              placeholder={searchDept ? searchDept : "Chercher un département..."}
              value={searchDept}
              onChange={(e) => {
                setSearchDept(e.target.value);
                setShowDeptSuggestions(true);
              }}
              onFocus={() => setShowDeptSuggestions(true)}
              className="w-full text-sm border border-slate-300 rounded-md p-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
            />
            {showDeptSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                {departementSuggestions && departementSuggestions.length > 0 ? (
                  departementSuggestions.map(dept => (
                    <div 
                      key={dept.nom}
                      onClick={() => handleSelectDepartement(dept)}
                      className="px-3 py-2 text-sm cursor-pointer hover:bg-slate-100"
                    >
                      {dept.code} - {dept.nom}
                    </div>
                  ))
                ) : searchDept.trim() ? (
                  <div className="px-3 py-2 text-sm text-slate-500">Aucun département trouvé</div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* ROW 3 - GAUCHE */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-[15px] font-bold text-slate-800 leading-snug">Densité vs Taux de logements sociaux</h3>
            <div className="flex-1 h-0.5 bg-black"></div>
          </div>
          <div className="flex flex-col gap-2.5">
            {/* Région Dropdown for Scatter 1 - FIRST */}
            <div className="flex flex-col gap-1.5 relative" ref={scatter1DropdownRef}>
              <input 
                type="text"
                placeholder={scatter1Region === "Toutes" ? "Chercher..." : scatter1Region}
                value={scatter1RegionSearch}
                onChange={(e) => {
                  setScatter1RegionSearch(e.target.value);
                  setShowScatter1Dropdown(true);
                }}
                onFocus={() => setShowScatter1Dropdown(true)}
                className="w-full text-sm border border-slate-300 rounded-md p-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
              />
              
              {showScatter1Dropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                  <div 
                    onClick={() => {
                      setScatter1Region("Toutes");
                      setScatter1RegionSearch('');
                      setShowScatter1Dropdown(false);
                    }}
                    className={`px-3 py-2 text-sm cursor-pointer ${scatter1Region === "Toutes" ? 'bg-[#1f2a2e] text-white' : 'hover:bg-slate-100'}`}
                  >
                    Toutes les régions
                  </div>
                  {regionsUniques && regionsUniques.filter(r => !scatter1RegionSearch || r.toLowerCase().includes(scatter1RegionSearch.toLowerCase())).map(region => (
                    <div 
                      key={region}
                      onClick={() => {
                        setScatter1Region(region);
                        setScatter1RegionSearch('');
                        setShowScatter1Dropdown(false);
                      }}
                      className={`px-3 py-2 text-sm cursor-pointer ${scatter1Region === region ? 'bg-[#1f2a2e] text-white' : 'hover:bg-slate-100'}`}
                    >
                      {region}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={() => setShowDOM && setShowDOM(!showDOM)}
              className={`w-full py-1.5 px-3 text-xs font-medium rounded-md transition-colors ${!showDOM ? 'bg-[#1f2a2e] text-white' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'}`}
            >
              {showDOM ? 'Retirer DOM' : 'Inclure DOM'}
            </button>
            
            {/* Max Density Slider */}
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-600">Max densité</label>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0 rounded">{maxDensity}</span>
            </div>
            <input
              type="range"
              min="100"
              max="21000"
              step="100"
              value={maxDensity}
              onChange={(e) => setMaxDensity(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        {/* ROW 4 - DROITE */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-[15px] font-bold text-slate-800 leading-snug">Construction neuve × Taux de logements vacants</h3>
            <div className="flex-1 h-0.5 bg-black"></div>
          </div>
          
          {/* Région Dropdown for Scatter 2 - ParcSocial Pattern */}
          <div className="flex flex-col gap-1.5 relative" ref={scatter2DropdownRef}>
            <input 
              type="text"
              placeholder={scatter2Region === "Toutes" ? "Chercher..." : scatter2Region}
              value={scatter2RegionSearch}
              onChange={(e) => {
                setScatter2RegionSearch(e.target.value);
                setShowScatter2Dropdown(true);
              }}
              onFocus={() => setShowScatter2Dropdown(true)}
              className="w-full text-sm border border-slate-300 rounded-md p-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
            />
            
            {showScatter2Dropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                <div 
                  onClick={() => {
                    setScatter2Region("Toutes");
                    setScatter2RegionSearch('');
                    setShowScatter2Dropdown(false);
                  }}
                  className={`px-3 py-2 text-sm cursor-pointer ${scatter2Region === "Toutes" ? 'bg-[#1f2a2e] text-white' : 'hover:bg-slate-100'}`}
                >
                  Toutes les régions
                </div>
                {regionsUniques && regionsUniques.filter(r => !scatter2RegionSearch || r.toLowerCase().includes(scatter2RegionSearch.toLowerCase())).map(region => (
                  <div 
                    key={region}
                    onClick={() => {
                      setScatter2Region(region);
                      setScatter2RegionSearch('');
                      setShowScatter2Dropdown(false);
                    }}
                    className={`px-3 py-2 text-sm cursor-pointer ${scatter2Region === region ? 'bg-[#1f2a2e] text-white' : 'hover:bg-slate-100'}`}
                  >
                    {region}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </aside>
  );
};

export default SidebarLogement;