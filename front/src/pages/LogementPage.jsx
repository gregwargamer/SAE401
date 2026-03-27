import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../service/mainapi";
import {
  Chart as ChartJS, CategoryScale, LinearScale, LogarithmicScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend
} from "chart.js";
import { Bar, Scatter, Line } from "react-chartjs-2";
import SidebarLogement from "../components/SidebarLogement";
import MapDepartements from "../components/MapDepartements";

ChartJS.register(CategoryScale, LinearScale, LogarithmicScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const LogementPage = () => {
  const [rawData, setRawData] = useState([]);
  const [geoData, setGeoData] = useState([]);
  const [sortIndividuel, setSortIndividuel] = useState('asc');
  const [showDOM, setShowDOM] = useState(true);
  const [selectedMapVariable, setSelectedMapVariable] = useState('taux_logements_sociaux');
  const [povertyThreshold, setPovertyThreshold] = useState(0);
  
  // Filtres pour Palmarès
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [topFlopMode, setTopFlopMode] = useState('both');
  const [socialHousingThreshold, setSocialHousingThreshold] = useState(0);
  
  // Filtres pour Logements individuels
  const [showAll, setShowAll] = useState(false);
  const [searchDept, setSearchDept] = useState('');
  const [showDeptSuggestions, setShowDeptSuggestions] = useState(false);
  
  // États pour recherche régions Palmarès
  const [regionSearch, setRegionSearch] = useState('');
  const [showRegionSuggestions, setShowRegionSuggestions] = useState(false);
  
  // Filtres pour Scatter 1 (Densité) - Pattern ParcSocial simple
  const [scatter1Region, setScatter1Region] = useState('Toutes');
  const [scatter1RegionSearch, setScatter1RegionSearch] = useState('');
  
  // Filtres pour Scatter 2 (Construction) - Pattern ParcSocial simple
  const [scatter2Region, setScatter2Region] = useState('Toutes');
  const [scatter2RegionSearch, setScatter2RegionSearch] = useState('');
  
  // Filtre densité maximale
  const [maxDensity, setMaxDensity] = useState(1500);

  useEffect(() => {
    const load = async () => {
      const [geo, stats] = await Promise.all([apiClient.get("/geo"), apiClient.get("/all")]);
      setGeoData(geo.data || []);
      setRawData(stats.data || []);
    };
    load();
  }, []);

  // Filter to latest year for most graphs
  const latestData = useMemo(() => {
    if (!rawData.length) return [];
    const anneeMax = Math.max(...rawData.map(s => Number(s.annee)).filter(n => !isNaN(n)));
    return rawData.filter(s => Number(s.annee) === anneeMax)
      .map(d => ({ ...d, nom: d.nom_departement || d.nom, code: d.code_departement || d.code }));
  }, [rawData]);

  // 1. CARTE (MapData)
  const mapData = useMemo(() => {
    return geoData.map(g => {
      let geometry;
      try { geometry = typeof g.geom === "string" ? JSON.parse(g.geom) : g.geom; } catch { return null; }
      if (!geometry) return null;

      const normalizeCode = (c) => {
        if (c === undefined || c === null) return "";
        const s = String(c);
        if (s === "2A" || s === "2B") return s;
        if (s.startsWith("97") || s.startsWith("98")) return s;
        return String(Number.isNaN(Number(s)) ? s : String(Number(s)).padStart(2, "0"));
      };

      const sesChiffres = latestData.find(s => normalizeCode(s.code) === normalizeCode(g.code)) || {};

      // Appliquer le filtre de pauvreté
      if (sesChiffres.taux_pauvrete && Number(sesChiffres.taux_pauvrete) < povertyThreshold) {
        return null;
      }

      return {
        type: "Feature",
        geometry: geometry.type === "Feature" ? geometry.geometry : geometry,
        properties: { 
          nom: g.nom, 
          code: g.code, 
          taux_logements_sociaux: sesChiffres.taux_logements_sociaux,
          taux_logements_vacants: sesChiffres.taux_logements_vacants,
          taux_energivores: sesChiffres.taux_energivores,
          selectedVariable: selectedMapVariable,
          taux_chomage: sesChiffres.taux_chomage,
          taux_pauvrete: sesChiffres.taux_pauvrete
        }
      };
    }).filter(v => v !== null);
  }, [geoData, latestData, selectedMapVariable, povertyThreshold]);


  // 2. SCATTER 1 : Densité × Taux de logements sociaux
  const scatter1Data = useMemo(() => {
    let filtered = latestData.filter(d => !isNaN(Number(d.densite)) && !isNaN(Number(d.taux_logements_sociaux)));

    if (!showDOM) {
      filtered = filtered.filter(d => !String(d.code).startsWith("97"));
    }

    // Filtre densité maximale
    filtered = filtered.filter(d => Number(d.densite) <= maxDensity);
    
    // Filtre région
    if (scatter1Region !== 'Toutes') {
      filtered = filtered.filter(d => d.nom_region === scatter1Region);
    }

    const points = filtered.map(d => ({
      x: Number(d.densite),
      y: Number(d.taux_logements_sociaux),
      code: d.code,
      nom: d.nom
    }));

    return {
      datasets: [{
        label: 'Départements',
        data: points,
        backgroundColor: '#4f46e5', // Indigo-600
        pointRadius: 4,
        pointHoverRadius: 7
      }]
    };
  }, [latestData, showDOM, maxDensity, scatter1Region]);

  const scatter1Options = useMemo(() => ({
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.raw.nom}: ${ctx.raw.x} hab/km² | ${ctx.raw.y}% log. soc.`
        }
      }
    },
    scales: {
      x: {
        title: { display: true, text: 'Densité (hab/km²)', font: { size: 11, weight: '600' } },
        type: 'logarithmic',
        position: 'bottom',
        min: 10,
        max: maxDensity,
        ticks: { callback: val => [10, 100, 1000, 10000].includes(val) ? val : '' }
      },
      y: {
        title: { display: true, text: 'Taux log. sociaux (%)', font: { size: 11, weight: '600' } },
        min: 0,
        max: 40
      }
    }
  }), [maxDensity]);


  // 3. BAR EMPILÉ : Individuels vs Collectifs par Département
  const barData = useMemo(() => {
    let depsData = latestData
      .filter(d => !isNaN(Number(d.taux_logements_individuels)))
      .map(d => ({
        nom: d.nom,
        individuel: Number(d.taux_logements_individuels),
        collectif: 100 - Number(d.taux_logements_individuels)
      }));

    // Filtre de recherche
    if (searchDept.trim()) {
      depsData = depsData.filter(d => d.nom.toLowerCase().includes(searchDept.toLowerCase()));
    }

    // Tri en ordre décroissant d'individuel
    if (sortIndividuel === 'asc') {
      depsData.sort((a,b) => a.individuel - b.individuel);
    } else {
      depsData.sort((a,b) => b.individuel - a.individuel);
    }

    // Limiter à 15 ou tous
    const sliced = showAll ? depsData : depsData.slice(0, 15);

    return {
      labels: sliced.map(d => d.nom.substring(0, 12) + (d.nom.length > 12 ? '.' : '')),
      datasets: [
        {
          label: 'Individuel (%)',
          data: sliced.map(d => d.individuel),
          backgroundColor: '#38bdf8', // Blue-400
        },
        {
          label: 'Collectif (%)',
          data: sliced.map(d => d.collectif),
          backgroundColor: '#1d4ed8', // Blue-800
        }
      ]
    };
  }, [latestData, sortIndividuel, showAll, searchDept]);

  const barOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
      tooltip: { mode: 'index', intersect: false }
    },
    responsive: true,
    scales: {
      x: { stacked: true },
      y: { stacked: true, max: 100 }
    }
  };


  // 4. TOP / FLOP : Taux de logements sociaux (Graphique Barre Horizontale)
  const barTopFlopData = useMemo(() => {
    let valid = latestData
      .filter(d => !isNaN(Number(d.taux_logements_sociaux)) && String(d.code) !== "2A" && String(d.code) !== "2B" && !String(d.code).startsWith("97"))
      .map(d => ({
        nom: d.nom,
        val: Number(d.taux_logements_sociaux),
        nom_region: d.nom_region
      }));

    // Filtre région
    if (selectedRegion) {
      valid = valid.filter(d => d.nom_region === selectedRegion);
    }

    // Filtre seuil de logements sociaux
    valid = valid.filter(d => d.val >= socialHousingThreshold);

    // Trier par valeur
    valid.sort((a,b) => b.val - a.val);

    // Déterminer les listes selon le mode
    let mergedList = [];
    if (topFlopMode === 'top') {
      mergedList = valid.slice(0, 5);
    } else if (topFlopMode === 'flop') {
      mergedList = valid.slice(-5).reverse();
    } else {
      // both
      const top5 = valid.slice(0, 5);
      const flop5 = valid.slice(-5).reverse();
      mergedList = [...top5, ...flop5];
    }

    return {
      labels: mergedList.map(d => d.nom),
      datasets: [{
        label: 'Taux de logements sociaux (%)',
        data: mergedList.map(d => d.val),
        backgroundColor: topFlopMode === 'top' 
          ? Array(mergedList.length).fill('#1e3a8a')
          : topFlopMode === 'flop'
          ? Array(mergedList.length).fill('#93c5fd')
          : [...Array(5).fill('#1e3a8a'), ...Array(5).fill('#93c5fd')],
        borderRadius: 4
      }]
    };
  }, [latestData, selectedRegion, topFlopMode, socialHousingThreshold]);

  const barTopFlopOptions = {
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { font: { size: 11 } } },
      y: { ticks: { font: { size: 11 } }, grid: { display: false } }
    }
  };


  // 5. SCATTER 2 : Construction neuve × Taux de logements vacants
  const scatter2Data = useMemo(() => {
    let filtered = latestData
      .filter(d => !isNaN(Number(d.moyenne_construction_neuve || d.construction)) && !isNaN(Number(d.taux_logements_vacants)));
    
    // Filtre région
    if (scatter2Region !== 'Toutes') {
      filtered = filtered.filter(d => d.nom_region === scatter2Region);
    }

    const points = filtered.map(d => ({
      x: Number(d.taux_logements_vacants),
      y: Number(d.moyenne_construction_neuve || d.construction),
      code: d.code,
      nom: d.nom
    }));

    return {
      datasets: [{
        label: 'Départements',
        data: points,
        backgroundColor: '#f59e0b', // Emerald for contrast
        pointRadius: 4,
        pointHoverRadius: 7
      }]
    };
  }, [latestData, scatter2Region]);

  const scatter2Options = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.raw.nom}: ${ctx.raw.x}% vacants | ${ctx.raw.y} constr.`
        }
      }
    },
    scales: {
      x: {
        title: { display: true, text: 'Taux log. vacants (%)', font: { size: 11, weight: '600' } },
        min: 0,
        max: 16
      },
      y: {
        title: { display: true, text: 'Construction neuve', font: { size: 11, weight: '600' } },
        min: 0,
        max: 16000
      }
    }
  };

  // Construire la liste unique des régions et départements
  const regionsUniques = useMemo(() => {
    const regions = new Set();
    latestData.forEach(d => {
      if (d.nom_region) regions.add(d.nom_region);
    });
    return Array.from(regions).sort();
  }, [latestData]);

  const departementSuggestions = useMemo(() => {
    const allDepts = latestData
      .map(d => ({ nom: d.nom, code: d.code }))
      .filter((v, i, a) => a.findIndex(item => item.nom === v.nom) === i)
      .sort((a, b) => a.nom.localeCompare(b.nom));
    
    if (!searchDept.trim()) return allDepts;
    return allDepts.filter(d => d.nom.toLowerCase().includes(searchDept.toLowerCase()));
  }, [latestData, searchDept]);

  return (
    <div className="flex flex-col lg:flex-row w-full items-start bg-transparent min-h-screen">
      <SidebarLogement 
        sortIndividuel={sortIndividuel} 
        setSortIndividuel={setSortIndividuel} 
        showDOM={showDOM}
        setShowDOM={setShowDOM}
        selectedMapVariable={selectedMapVariable}
        setSelectedMapVariable={setSelectedMapVariable}
        povertyThreshold={povertyThreshold}
        setPovertyThreshold={setPovertyThreshold}
        latestData={latestData}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        topFlopMode={topFlopMode}
        setTopFlopMode={setTopFlopMode}
        socialHousingThreshold={socialHousingThreshold}
        setSocialHousingThreshold={setSocialHousingThreshold}
        showAll={showAll}
        setShowAll={setShowAll}
        searchDept={searchDept}
        setSearchDept={setSearchDept}
        showDeptSuggestions={showDeptSuggestions}
        setShowDeptSuggestions={setShowDeptSuggestions}
        departementSuggestions={departementSuggestions}
        regionsUniques={regionsUniques}
        regionSearch={regionSearch}
        setRegionSearch={setRegionSearch}
        showRegionSuggestions={showRegionSuggestions}
        setShowRegionSuggestions={setShowRegionSuggestions}
        scatter1Region={scatter1Region}
        setScatter1Region={setScatter1Region}
        scatter1RegionSearch={scatter1RegionSearch}
        setScatter1RegionSearch={setScatter1RegionSearch}
        scatter2Region={scatter2Region}
        setScatter2Region={setScatter2Region}
        scatter2RegionSearch={scatter2RegionSearch}
        setScatter2RegionSearch={setScatter2RegionSearch}
        maxDensity={maxDensity}
        setMaxDensity={setMaxDensity}
      />
      
      <div className="flex-1 w-full lg:ml-[240px] xl:ml-[20%] flex flex-col gap-8 p-4 lg:p-8 lg:pt-0 lg:pb-0 pb-0">
        {/* ROW 1 : CARTE FULL WIDTH */}
        <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
          <div className="w-full h-[80vh] min-h-[450px]">
            <MapDepartements features={mapData} selectedVariable={selectedMapVariable} />
          </div>
        </div>

        {/* ROW 2 : 2 GRAPHIQUES 50/50 */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col">
            <h3 className="text-md font-bold text-slate-800 mb-1 leading-snug">Palmarès : Taux de logements sociaux</h3>
            <p className="text-xs text-slate-500 mb-4 line-clamp-1">Les 5 départements les plus et les moins bien dotés.</p>
            <div className="h-[280px] w-full mt-auto">
              <Bar data={barTopFlopData} options={barTopFlopOptions} />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col">
            <h3 className="text-md font-bold text-slate-800 mb-1 leading-snug">Logements individuels vs collectifs</h3>
            <p className="text-xs text-slate-500 mb-4 line-clamp-1">Structure du parc par département, opposant l'habitat pavillonnaire et les grands ensembles.</p>
            <div className="h-[280px] w-full mt-auto">
              <Bar data={barData} options={barOptions} />
            </div>
          </div>
        </div>

        {/* ROW 3 : GRAPHIQUE (75%) / EXPLICATION (25%) */}
        <div className="w-full flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-3/4 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
             <h3 className="text-md font-bold text-slate-800 mb-1">Densité vs Taux de logements sociaux</h3>
             <p className="text-xs text-slate-500 mb-4">Montre que les zones denses concentrent le parc social, lecture structurelle du territoire.</p>
             <div className="h-[280px] w-full">
               <Scatter data={scatter1Data} options={scatter1Options} />
             </div>
          </div>
          <div className="w-full lg:w-1/4 flex flex-col justify-center px-2">
            <h4 className="text-2xl font-extrabold text-slate-800 mb-3">Concentration urbaine</h4>
            <p className="text-sm text-slate-600 mb-3 leading-relaxed">
              Le parc social est structurellement dépendant de la densité de population.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Plus un territoire est dense, plus le taux de logements sociaux grimpe pour répondre aux besoins d'une population concentrée aux revenus parfois plus précaires.
            </p>
          </div>
        </div>

        {/* ROW 4 : EXPLICATION (25%) / GRAPHIQUE (75%) */}
        <div className="w-full flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/4 flex flex-col justify-center px-2 order-2 lg:order-1">
            <h4 className="text-2xl font-extrabold text-slate-800 mb-3">La contradiction territoriale</h4>
            <p className="text-sm text-slate-600 mb-3 leading-relaxed">
              Ce graphique révèle les fractures locales les plus fortes. 
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Les zones où l'on construit abondamment absorbent mal le trop-plein de vacance des territoires ruraux périphériques, témoignant d'une inadéquation entre offre et demande.
            </p>
          </div>
          <div className="w-full lg:w-3/4 bg-white rounded-xl shadow-sm border border-slate-200 p-5 order-1 lg:order-2">
             <h3 className="text-md font-bold text-slate-800 mb-1">Construction neuve × Taux de logements vacants</h3>
             <p className="text-xs text-slate-500 mb-4">Visualisation de la déconnexion entre production et occupation</p>
             <div className="h-[280px] w-full">
               <Scatter data={scatter2Data} options={scatter2Options} />
             </div>
          </div>
        </div>

        {/* CTA - Créer son propre graphique */}
        <div className="w-full py-1 text-center border-t border-slate-200">
          <p className="text-slate-600 text-sm mb-1">Vous ne trouvez pas ce que vous cherchez ?</p>
          <Link to="/creation" className="inline-block text-slate-900 font-semibold hover:underline transition-all text-base">
            Créez votre propre graphique
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LogementPage;
