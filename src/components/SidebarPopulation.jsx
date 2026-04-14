import React from 'react';

const SidebarPopulation = ({ 
  sansGers, setSansGers,
  sortJeunes, setSortJeunes,
  sortPauvrete, setSortPauvrete,
  selectedRadarDepts, setSelectedRadarDepts,
  selectedRadarRegion, setSelectedRadarRegion, showRadarRegionDropdown, setShowRadarRegionDropdown,
  radarSearchTerm, setRadarSearchTerm,
  depsList,
  regionsList,
  selectedRegionBubble, setSelectedRegionBubble, searchRegionBubble, setSearchRegionBubble, showRegionSuggBubble, setShowRegionSuggBubble, regionSuggestionsBubble,
  selectedRegionNatMig, setSelectedRegionNatMig, searchRegionNatMig, setSearchRegionNatMig, showRegionSuggNatMig, setShowRegionSuggNatMig, regionSuggestionsNatMig,
  selectedRegionPauvrete, setSelectedRegionPauvrete, searchRegionPauvrete, setSearchRegionPauvrete, showRegionSuggPauvrete, setShowRegionSuggPauvrete, regionSuggestionsPauvrete,
  selectedRegionAges, setSelectedRegionAges, searchRegionAges, setSearchRegionAges, showRegionSuggAges, setShowRegionSuggAges, regionSuggestionsAges,
  sortNatMig, setSortNatMig,
  densiteFilter, setDensiteFilter
}) => {
  
  // Filtrer les départements disponibles pour le radar
  const filteredRadarDepts = React.useMemo(() => {
    let filtered = [...depsList];
    
    // Si une région est sélectionnée, afficher seulement les départements de cette région
    if (selectedRadarRegion) {
      filtered = filtered.filter(d => d.nom_region === selectedRadarRegion);
    }
    
    // Filtrer par recherche (nom ou code)
    if (radarSearchTerm.trim()) {
      const searchLower = radarSearchTerm.toLowerCase();
      filtered = filtered.filter(d => 
        d.nom.toLowerCase().includes(searchLower) || 
        d.code.toString().includes(searchLower)
      );
    }
    
    return filtered.sort((a,b) => a.nom.localeCompare(b.nom));
  }, [depsList, selectedRadarRegion, radarSearchTerm]);
  
  const RegionFilter = ({ title, selected, setSelected, search, setSearch, showSugg, setShowSugg, suggestions }) => (
    <div className="relative">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => setShowSugg(true)}
        onBlur={() => setTimeout(() => setShowSugg(false), 200)}
        placeholder={selected ? selected : "Chercher une région..."}
        className="w-full text-sm border border-slate-300 rounded-md p-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
      />
      {showSugg && suggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
          <button
            type="button"
            onClick={() => {
              setSelected('');
              setSearch('');
              setShowSugg(false);
            }}
            className={`w-full text-left px-3 py-2 text-sm border-b border-slate-200 font-medium cursor-pointer ${
              !selected 
                ? 'bg-[#1f2a2e] text-white' 
                : 'text-slate-700 bg-white hover:bg-slate-100'
            }`}
          >
            Par défaut (tous)
          </button>
          {suggestions.map(region => (
            <button
              type="button"
              key={region}
              onClick={() => {
                setSelected(region);
                setSearch('');
                setShowSugg(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm border-b border-slate-200 last:border-b-0 cursor-pointer ${
                selected === region 
                  ? 'bg-[#1f2a2e] text-white' 
                  : 'text-slate-700 bg-white hover:bg-slate-100'
              }`}
            >
              {region}
            </button>
          ))}
        </div>
      )}
    </div>
  );
  return (
    <aside className="static xl:fixed top-0 left-0 w-full xl:w-[20%] h-auto xl:h-screen bg-[#fafaf8] text-[#374151] border-b xl:border-r xl:border-b-0 border-[#e5e7eb] p-5 overflow-y-auto z-20 flex flex-col">
<h1 className="text-2xl font-extrabold text-[#111827] mb-4 drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
        Social<span className="text-blue-400">Scope</span>
      </h1>

      <div className="flex-1 flex flex-col gap-3">
        
        {/* ROW 1 */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-[13px] font-bold text-slate-800 leading-snug">Chômage, Pauvreté et Parc Social</h3>
            <div className="flex-1 h-0.5 bg-black"></div>
          </div>
          <div className="flex flex-col gap-1.5">
            <RegionFilter
              selected={selectedRegionBubble}
              setSelected={setSelectedRegionBubble}
              search={searchRegionBubble}
              setSearch={setSearchRegionBubble}
              showSugg={showRegionSuggBubble}
              setShowSugg={setShowRegionSuggBubble}
              suggestions={regionSuggestionsBubble}
            />
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

        {/* SOLDE NATUREL VS MIGRATOIRE */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-[13px] font-bold text-slate-800 leading-snug">Solde naturel vs Solde migratoire</h3>
            <div className="flex-1 h-0.5 bg-black"></div>
          </div>
          <RegionFilter
            selected={selectedRegionNatMig}
            setSelected={setSelectedRegionNatMig}
            search={searchRegionNatMig}
            setSearch={setSearchRegionNatMig}
            showSugg={showRegionSuggNatMig}
            setShowSugg={setShowRegionSuggNatMig}
            suggestions={regionSuggestionsNatMig}
          />
          <div className="flex gap-1 mt-2">
            <button
              onClick={() => setSortNatMig && setSortNatMig('asc')}
              className={`flex-1 text-center px-3 py-1.5 text-xs font-medium border rounded-md transition-colors ${
                sortNatMig === 'asc' 
                  ? 'bg-[#1f2a2e] text-white border-[#1f2a2e]' 
                  : 'text-slate-600 bg-white border-slate-300 hover:bg-slate-50'
              }`}
            >
              Croissant
            </button>
            <button
              onClick={() => setSortNatMig && setSortNatMig('desc')}
              className={`flex-1 text-center px-3 py-1.5 text-xs font-medium border rounded-md transition-colors ${
                sortNatMig === 'desc' 
                  ? 'bg-[#1f2a2e] text-white border-[#1f2a2e]' 
                  : 'text-slate-600 bg-white border-slate-300 hover:bg-slate-50'
              }`}
            >
              Décroissant
            </button>
          </div>
        </div>

        {/* ROW 3 */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-[13px] font-bold text-slate-800 leading-snug">Pauvreté et Densité</h3>
            <div className="flex-1 h-0.5 bg-black"></div>
          </div>
          <div className="flex flex-col gap-1.5">
            <RegionFilter
              selected={selectedRegionPauvrete}
              setSelected={setSelectedRegionPauvrete}
              search={searchRegionPauvrete}
              setSearch={setSearchRegionPauvrete}
              showSugg={showRegionSuggPauvrete}
              setShowSugg={setShowRegionSuggPauvrete}
              suggestions={regionSuggestionsPauvrete}
            />
            <div className="flex gap-1">
              <button
                onClick={() => setSortPauvrete && setSortPauvrete('asc')}
                className={`flex-1 text-center px-3 py-1.5 text-xs font-medium border rounded-md transition-colors ${
                  sortPauvrete === 'asc' 
                    ? 'bg-[#1f2a2e] text-white border-[#1f2a2e]' 
                    : 'text-slate-600 bg-white border-slate-300 hover:bg-slate-50'
                }`}
              >
                Croissant
              </button>
              <button
                onClick={() => setSortPauvrete && setSortPauvrete('desc')}
                className={`flex-1 text-center px-3 py-1.5 text-xs font-medium border rounded-md transition-colors ${
                  sortPauvrete === 'desc' 
                    ? 'bg-[#1f2a2e] text-white border-[#1f2a2e]' 
                    : 'text-slate-600 bg-white border-slate-300 hover:bg-slate-50'
                }`}
              >
                Décroissant
              </button>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <label className="text-xs font-semibold text-slate-600 w-16">Densité min</label>
              <input 
                type="range"
                min="0" max="500" value={densiteFilter}
                onChange={(e) => setDensiteFilter(parseInt(e.target.value))}
                className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0 rounded w-12 text-center">{densiteFilter}</span>
            </div>
          </div>
        </div>

        {/* ROW 4 - GAUCHE */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-[13px] font-bold text-slate-800 leading-snug">Répartition : Jeunes vs Seniors</h3>
            <div className="flex-1 h-0.5 bg-black"></div>
          </div>
          <div className="flex flex-col gap-1.5">
            <RegionFilter
              selected={selectedRegionAges}
              setSelected={setSelectedRegionAges}
              search={searchRegionAges}
              setSearch={setSearchRegionAges}
              showSugg={showRegionSuggAges}
              setShowSugg={setShowRegionSuggAges}
              suggestions={regionSuggestionsAges}
            />
            <div className="flex gap-1">
              <button
                onClick={() => setSortJeunes && setSortJeunes('asc')}
                className={`flex-1 text-center px-3 py-1.5 text-xs font-medium border rounded-md transition-colors ${
                  sortJeunes === 'asc' 
                    ? 'bg-[#1f2a2e] text-white border-[#1f2a2e]' 
                    : 'text-slate-600 bg-white border-slate-300 hover:bg-slate-50'
                }`}
              >
                Croissant
              </button>
              <button
                onClick={() => setSortJeunes && setSortJeunes('desc')}
                className={`flex-1 text-center px-3 py-1.5 text-xs font-medium border rounded-md transition-colors ${
                  sortJeunes === 'desc' 
                    ? 'bg-[#1f2a2e] text-white border-[#1f2a2e]' 
                    : 'text-slate-600 bg-white border-slate-300 hover:bg-slate-50'
                }`}
              >
                Décroissant
              </button>
            </div>
          </div>
        </div>

        {/* ROW 4 - DROITE */}
        <div className="mb-6 text-left">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-[15px] font-bold text-slate-800 leading-snug">Profil départemental</h3>
            <div className="flex-1 h-0.5 bg-black"></div>
          </div>
          {depsList && depsList.length > 0 && regionsList ? (
            <div className="flex flex-col gap-2">
              
              {/* Dropdown pour choisir la région */}
              <div className="relative">
                <button
                  onClick={() => setShowRadarRegionDropdown(!showRadarRegionDropdown)}
                  onBlur={() => setTimeout(() => setShowRadarRegionDropdown(false), 200)}
                  className="w-full text-left px-3 py-2 text-xs font-medium border border-slate-300 rounded-md bg-white text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>{selectedRadarRegion || 'Comparer par région'}</span>
                  <span className="text-xs">▼</span>
                </button>
                
                {showRadarRegionDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRadarRegion('');
                        setShowRadarRegionDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs border-b border-slate-200 font-medium cursor-pointer transition-colors ${
                        !selectedRadarRegion 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'text-slate-700 bg-white hover:bg-slate-100'
                      }`}
                    >
                      Toutes les régions (Moyenne Nationale)
                    </button>
                    {regionsList.map(region => (
                      <button
                        type="button"
                        key={region}
                        onClick={() => {
                          setSelectedRadarRegion(region);
                          setShowRadarRegionDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs border-b border-slate-200 last:border-b-0 cursor-pointer transition-colors ${
                          selectedRadarRegion === region 
                            ? 'bg-blue-100 text-blue-900' 
                            : 'text-slate-700 bg-white hover:bg-slate-100'
                        }`}
                      >
                        {region}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Barre de recherche */}
              <input
                type="text"
                placeholder="Chercher par nom ou code (ex: Paris, 75)..."
                value={radarSearchTerm}
                onChange={(e) => setRadarSearchTerm(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-md p-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
              />
              
              {/* Liste des départements filtrés */}
              <div className="flex flex-col gap-1.5 max-h-[150px] overflow-y-auto border border-slate-200 rounded-md p-2 bg-slate-50">
                {filteredRadarDepts.length > 0 ? (
                  filteredRadarDepts.map((d, i) => (
                    <label key={`chk-${d.code}-${i}`} className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedRadarDepts.includes(d.code)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            if (selectedRadarDepts.length < 3) {
                              setSelectedRadarDepts([...selectedRadarDepts, d.code]);
                            }
                          } else {
                            setSelectedRadarDepts(selectedRadarDepts.filter(code => code !== d.code));
                          }
                        }}
                        className="w-4 h-4 rounded cursor-pointer"
                      />
                      <span className="text-slate-600">{d.nom}</span>
                      <span className="text-slate-400 text-[10px]">({d.code})</span>
                    </label>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">Aucun département trouvé</p>
                )}
              </div>
              
              <p className="text-xs text-slate-500 italic">Jusqu'à 3 départements {selectedRadarRegion && `• Région: ${selectedRadarRegion}`}</p>
              
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Chargement des données...</p>
          )}
        </div>

      </div>
    </aside>
  );
};

export default SidebarPopulation;