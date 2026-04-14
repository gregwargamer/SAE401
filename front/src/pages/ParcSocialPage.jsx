import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchGeoData } from "../service/mainapi";
import { getAll } from "../service/regiondepartement";
import {
  Chart as ChartJS, CategoryScale, LinearScale, LogarithmicScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend
} from "chart.js";
import { Bar, Scatter } from "react-chartjs-2";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import SidebarParcSocial from "../components/SidebarParcSocial";

ChartJS.register(CategoryScale, LinearScale, LogarithmicScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const isMetropole = (code) => {
  if (!code) return false;
  const strCode = String(code);
  return !strCode.startsWith("97") && !strCode.startsWith("98");
};

const ParcSocialPage = () => {
  const [rawData, setRawData] = useState([]);
  const [geoData, setGeoData] = useState([]);
  const [hoveredDep, setHoveredDep] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedRegion, setSelectedRegion] = useState("Toutes");
  const [regionSearch, setRegionSearch] = useState("");
  const [sortFluxOrder, setSortFluxOrder] = useState('asc');
  const [ageWeight, setAgeWeight] = useState(33);
  const [energetiqueWeight, setEnergetiqueWeight] = useState(33);
  const [vacanceWeight, setVacanceWeight] = useState(34);
  const [priceQualityRegion, setPriceQualityRegion] = useState("Toutes");
  const [priceQualityRegionSearch, setPriceQualityRegionSearch] = useState("");
  const [passoireSeuil, setPassoireSeuil] = useState(0);
  const [loyerRange, setLoyerRange] = useState('all');
  const [attractivityRegion, setAttractivityRegion] = useState("Toutes");
  const [attractivityRegionSearch, setAttractivityRegionSearch] = useState("");
  const [marketTension, setMarketTension] = useState(0);
  const [minBubbleSize, setMinBubbleSize] = useState(0);
  const [loyerRegionFilter, setLoyerRegionFilter] = useState('all'); // 'all', 'metropole', 'outremer'

  useEffect(() => {
    const load = async () => {
      const [stats, geoResult] = await Promise.all([getAll(), fetchGeoData()]);
      setRawData(stats || []);
      setGeoData(geoResult);
    };
    load();
  }, []);

  const latestDataAll = useMemo(() => {
    if (!rawData.length) return [];
    const anneeMax = Math.max(...rawData.map(s => Number(s.annee)).filter(n => !isNaN(n)));
    return rawData.filter(s => Number(s.annee) === anneeMax).map(d => ({...d, nom: d.nom_departement || d.nom, code: d.code_departement || d.code}));
  }, [rawData]);

  const latestDataMetropole = useMemo(() => latestDataAll.filter(d => isMetropole(d.code)), [latestDataAll]);

  const regionsList = useMemo(() => {
    const list = new Set();
    latestDataAll.forEach(d => {
      if (d.nom_region) list.add(d.nom_region);
    });
    return Array.from(list).sort();
  }, [latestDataAll]);

  const mapData = useMemo(() => {
    if (!latestDataAll.length || !geoData.length) return [];
    
    let minAge = Infinity, maxAge = -Infinity;
    let minEne = Infinity, maxEne = -Infinity;
    let minVac = Infinity, maxVac = -Infinity;

    latestDataMetropole.forEach(d => {
      const a = Number(d.age_moyen_parc);
      const e = Number(d.taux_energivores);
      const v = Number(d.parc_social_taux_vacants);
      if(!isNaN(a)) { if(a < minAge) minAge = a; if(a > maxAge) maxAge = a; }
      if(!isNaN(e)) { if(e < minEne) minEne = e; if(e > maxEne) maxEne = e; }
      if(!isNaN(v)) { if(v < minVac) minVac = v; if(v > maxVac) maxVac = v; }
    });

    if (minAge === Infinity) { minAge = 0; maxAge = 1; }
    if (minEne === Infinity) { minEne = 0; maxEne = 1; }
    if (minVac === Infinity) { minVac = 0; maxVac = 1; }

    // We only take Metropole for the map to keep zoom focused, sans Corse
    const topoFeatures = geoData.filter(g => isMetropole(g.code) && g.code !== "2A" && g.code !== "2B").map(g => {
      let parsed = null;
      try { parsed = JSON.parse(g.geom); } catch(e){}
      
      const stat = latestDataAll.find(s => s.code === g.code);
      
      let score = null;
      if (stat) {
        const age = Number(stat.age_moyen_parc);
        const ene = Number(stat.taux_energivores);
        const vac = Number(stat.parc_social_taux_vacants);
        if (!isNaN(age) && !isNaN(ene) && !isNaN(vac)) {
          const normAge = (age - minAge) / (maxAge - minAge || 1);
          const normEne = (ene - minEne) / (maxEne - minEne || 1);
          const normVac = (vac - minVac) / (maxVac - minVac || 1);
          // Utiliser les poids personnalisés au lieu de moyenne simple
          const totalWeight = ageWeight + energetiqueWeight + vacanceWeight;
          score = ((normAge * ageWeight + normEne * energetiqueWeight + normVac * vacanceWeight) / totalWeight) * 100;
        }
      }

      return {
        type: "Feature",
        properties: { 
          code: g.code, 
          nom: g.nom,
          loyer: stat ? Number(stat.loyer_moyen) : null,
          age: stat ? Number(stat.age_moyen_parc) : null,
          energivores: stat ? Number(stat.taux_energivores) : null,
          vacance: stat ? Number(stat.parc_social_taux_vacants) : null,
          score
        },
        geometry: parsed
      };
    }).filter(f => f.geometry);
    
    return {
      type: "FeatureCollection",
      features: topoFeatures
    };
  }, [latestDataAll, geoData, latestDataMetropole, ageWeight, energetiqueWeight, vacanceWeight]);

  const getScoreColor = (score) => {
    if (score === null || isNaN(score)) return "#e2e8f0";
    if (score >= 65) return "#9f1239"; // rose sombre (Urgence)
    if (score >= 50) return "#dc2626"; // red
    if (score >= 35) return "#f59e0b"; // orange
    if (score >= 20) return "#facc15"; // jaune
    return "#86efac"; // vert clair (Bon état)
  };

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // 01 Scatter: Prix vs Qualité (Loyer x Energivores)
  const prixQualiteData = useMemo(() => {
    let filtered = [...latestDataAll];
    
    // Filtre par région
    if (priceQualityRegion !== "Toutes") {
      filtered = filtered.filter(d => d.nom_region === priceQualityRegion);
    }
    
    // Filtre par seuil de passoires
    filtered = filtered.filter(d => Number(d.taux_energivores) >= passoireSeuil);
    
    // Filtre par tranche de loyer
    if (loyerRange !== 'all') {
      filtered = filtered.filter(d => {
        const loyer = Number(d.loyer_moyen);
        if (loyerRange === '<5') return loyer < 5;
        if (loyerRange === '5-6') return loyer >= 5 && loyer < 6;
        if (loyerRange === '>6') return loyer >= 6;
        return true;
      });
    }
    
    const points = filtered.filter(d => !isNaN(Number(d.loyer_moyen)) && !isNaN(Number(d.taux_energivores))).map(d => ({
      x: Number(d.loyer_moyen),
      y: Number(d.taux_energivores),
      nom: d.nom
    }));

    return {
      datasets: [{
        label: 'Départements',
        data: points,
        backgroundColor: '#ef4444',
        pointRadius: 4,
        pointHoverRadius: 7,
        clip: false
      }]
    };
  }, [latestDataAll, priceQualityRegion, passoireSeuil, loyerRange])

  // 06 Flux : Entrées vs Sorties
  const fluxData = useMemo(() => {
    let filtered = [...latestDataMetropole];
    if (selectedRegion !== "Toutes") {
      filtered = filtered.filter(d => d.nom_region === selectedRegion);
    }

    const calculated = filtered.map(d => {
      const inLocation = Number(d.logements_mis_en_location) || 0;
      const soldes = (Number(d.logements_demolis) || 0) + (Number(d.ventes_personnes_physiques) || 0);
      return {
        ...d,
        inLocation,
        demo: Number(d.logements_demolis) || 0,
        ventes: Number(d.ventes_personnes_physiques) || 0,
        soldeNet: inLocation - soldes
      };
    });

    // Tri Intelligent : du plus gros solde net au plus petit ou inversement
    if (sortFluxOrder === 'desc') {
      calculated.sort((a,b) => b.soldeNet - a.soldeNet);
    } else {
      calculated.sort((a,b) => a.soldeNet - b.soldeNet);
    }

    const sorted = calculated.slice(0, 15);

    return {
      labels: sorted.map(d => d.nom.substring(0,8)+(d.nom.length>8?".":"")),
      datasets: [
        {
          type: 'line',
          label: 'Solde Net',
          data: sorted.map(d => d.soldeNet),
          borderColor: '#eab308', // Jaune fort contrasté
          backgroundColor: '#ca8a04',
          borderWidth: 3,
          pointRadius: 4,
          pointBackgroundColor: sorted.map(d => d.soldeNet >= 0 ? '#eab308' : '#dc2626'), // Rouge si négatif
          fill: false,
          zIndex: 10
        },
        {
          type: 'bar',
          label: 'Mises en location (+)',
          data: sorted.map(d => d.inLocation),
          backgroundColor: '#10b981', // green
          stack: 'bars'
        },
        {
          type: 'bar',
          label: 'Démolitions (-)',
          data: sorted.map(d => -d.demo),
          backgroundColor: '#f43f5e', // rose
          stack: 'bars'
        },
        {
          type: 'bar',
          label: 'Ventes physiques (-)',
          data: sorted.map(d => -d.ventes),
          backgroundColor: '#8b5cf6', // purple
          stack: 'bars'
        }
      ]
    };
  }, [latestDataMetropole, selectedRegion, sortFluxOrder]);

  // Nouveau Scatter : Attractivité vs Coût
  const attractiviteCoutData = useMemo(() => {
    let filtered = latestDataAll.filter(d => 
      !isNaN(Number(d.loyer_moyen)) && 
      !isNaN(Number(d.logements_mis_en_location)) &&
      !isNaN(Number(d.nb_logements))
    );

    // Filtre par région
    if (attractivityRegion !== "Toutes") {
      filtered = filtered.filter(d => d.nom_region === attractivityRegion);
    }

    // Filtre par taille de bulle (nombre minimum de logements)
    filtered = filtered.filter(d => Number(d.nb_logements) >= minBubbleSize * 1000);

    // Filtre par tension de marché (mises en location minimum)
    if (marketTension > 0) {
      filtered = filtered.filter(d => {
        const inLocation = Number(d.logements_mis_en_location);
        return inLocation >= marketTension * 300; // Convertir slider 0-10 en 0-3000
      });
    }

    const maxNb = Math.max(...filtered.map(d => Number(d.nb_logements)), 1);

    const points = filtered.map(d => {
      const nb = Number(d.nb_logements);
      const radius = 4 + (nb / maxNb) * 20; // Rayon dynamique (bulles) entre 4px et 24px
      return {
        x: Number(d.loyer_moyen),
        y: Number(d.logements_mis_en_location),
        r: radius,
        nom: d.nom,
        nb_logements: nb
      };
    });

    return {
      datasets: [{
        label: 'Départements',
        data: points,
        backgroundColor: 'rgba(99, 102, 241, 0.6)', // Indigo transparent
        borderColor: '#4f46e5',
        borderWidth: 1,
        pointRadius: points.map(p => p.r),
        pointHoverRadius: points.map(p => p.r + 2),
        clip: false
      }]
    };
  }, [latestDataAll, attractivityRegion, minBubbleSize, marketTension]);

  // 02 Bar horizontal: Loyer par région
  const loyerRegionData = useMemo(() => {
    const grouped = {};
    let totalRent = 0; let totalCnt = 0;
    latestDataAll.forEach(d => {
      const r = d.nom_region;
      const l = Number(d.loyer_moyen);
      if(!r || isNaN(l)) return;
      
      // Filtre Outre-Mer vs Métropole basé sur le code département
      const code = String(d.code || '');
      const isOutreMer = code.startsWith('97') || code.startsWith('98');
      if (loyerRegionFilter === 'metropole' && isOutreMer) return;
      if (loyerRegionFilter === 'outremer' && !isOutreMer) return;
      
      if(!grouped[r]) grouped[r] = {sum:0, cnt:0};
      grouped[r].sum += l; grouped[r].cnt++;
      totalRent += l; totalCnt++;
    });
    const avgNat = totalCnt > 0 ? totalRent / totalCnt : 5.8;
    const regions = Object.keys(grouped).sort((a,b) => (grouped[b].sum/grouped[b].cnt) - (grouped[a].sum/grouped[a].cnt));
    const vals = regions.map(r => grouped[r].sum / grouped[r].cnt);
    
    const colors = [
      '#f87171', '#fb923c', '#fbbf24', '#a3e635', '#4ade80', '#34d399',
      '#2dd4bf', '#38bdf8', '#60a5fa', '#818cf8', '#a78bfa', '#c084fc',
      '#e879f9', '#f472b6', '#fb7185', '#94a3b8'
    ];

    return {
      labels: regions.map(r => r.substring(0,18)),
      datasets: [
        {
          type: 'line',
          label: 'Moyenne Nationale',
          data: regions.map(() => avgNat),
          borderColor: '#000',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0
        },
        {
          type: 'bar',
          label: 'Loyer moyen (€/m²)',
          data: vals,
          backgroundColor: regions.map((_, i) => colors[i % colors.length]),
          borderRadius: 4
        }
      ]
    };
  }, [latestDataAll, loyerRegionFilter]);

  return (
    <div className="flex w-full items-start bg-transparent min-h-screen flex-col xl:flex-row">
      <SidebarParcSocial 
        regions={regionsList} 
        selectedRegion={selectedRegion} 
        setSelectedRegion={setSelectedRegion}
        regionSearch={regionSearch}
        setRegionSearch={setRegionSearch}
        sortFluxOrder={sortFluxOrder}
        setSortFluxOrder={setSortFluxOrder}
        ageWeight={ageWeight}
        setAgeWeight={setAgeWeight}
        energetiqueWeight={energetiqueWeight}
        setEnergetiqueWeight={setEnergetiqueWeight}
        vacanceWeight={vacanceWeight}
        setVacanceWeight={setVacanceWeight}
        priceQualityRegion={priceQualityRegion}
        setPriceQualityRegion={setPriceQualityRegion}
        priceQualityRegionSearch={priceQualityRegionSearch}
        setPriceQualityRegionSearch={setPriceQualityRegionSearch}
        passoireSeuil={passoireSeuil}
        setPassoireSeuil={setPassoireSeuil}
        loyerRange={loyerRange}
        setLoyerRange={setLoyerRange}
        attractivityRegion={attractivityRegion}
        setAttractivityRegion={setAttractivityRegion}
        attractivityRegionSearch={attractivityRegionSearch}
        setAttractivityRegionSearch={setAttractivityRegionSearch}
        marketTension={marketTension}
        setMarketTension={setMarketTension}
        minBubbleSize={minBubbleSize}
        setMinBubbleSize={setMinBubbleSize}
        loyerRegionFilter={loyerRegionFilter}
        setLoyerRegionFilter={setLoyerRegionFilter}
      />
      <div className="flex-1 ml-0 xl:ml-[20%] flex flex-col gap-8 p-6 xl:p-8 xl:pt-0 xl:pb-0 pb-0">
        {/* ROW 1 : CHOROPLETH MAP */}
        <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative" onMouseMove={handleMouseMove}>
          <div className="absolute top-3 left-3 z-10">
            <h2 className="text-lg font-bold text-slate-800 leading-tight">Où rénover en urgence ? (Score de Vétusté)</h2>
            <div className="text-xs font-normal text-slate-500 mt-0.5">Le score combine âge moyen, passoires thermiques et taux de vacance.</div>
            <div className="mt-3 flex items-center gap-2">
              <div className="text-xs font-semibold text-slate-600">Bon état</div>
              <div className="flex h-3 w-40 rounded-full bg-gradient-to-r from-[#86efac] via-[#facc15] via-[#f59e0b] via-[#dc2626] to-[#9f1239]"></div>
              <div className="text-xs font-semibold text-slate-600">Urgence absolue</div>
            </div>
          </div>
          
          <div className="w-full h-[80vh] min-h-[500px] bg-slate-50">
            {mapData.features ? (
              <ComposableMap projection="geoMercator" projectionConfig={{ center: [2.4, 47], scale: 2300 }} className="w-full h-full outline-none">
                <Geographies geography={mapData}>
                  {({ geographies }) => geographies.map(geo => {
                    const score = geo.properties.score;
                    const fill = getScoreColor(score);
                    return (
                      <Geography 
                        key={geo.rsmKey} 
                        geography={geo} 
                        fill={fill} 
                        stroke="#cbd5e1" 
                        strokeWidth={0.5} 
                        className="outline-none hover:opacity-80 transition-all cursor-pointer"
                        onMouseEnter={() => setHoveredDep(geo.properties)}
                        onMouseLeave={() => setHoveredDep(null)}
                      />
                    );
                  })}
                </Geographies>
              </ComposableMap>
            ) : (
             <div className="flex items-center justify-center h-full text-slate-400">Chargement...</div>
            )}
          </div>

          {hoveredDep && (
            <div className="fixed z-50 bg-white/95 backdrop-blur shadow-xl border border-slate-200 rounded-lg p-3 pointer-events-none" style={{ left: mousePos.x + 15, top: mousePos.y + 15 }}>
              <div className="font-bold text-slate-800 border-b border-gray-100 pb-1 mb-1">{hoveredDep.nom} ({hoveredDep.code})</div>
              <div className="text-sm font-semibold text-rose-600 mb-1">Score de vétusté : {hoveredDep.score ? hoveredDep.score.toFixed(0) : 'N/A'}/100</div>
              <div className="text-sm text-slate-600">Âge moyen du parc : <strong>{hoveredDep.age ? hoveredDep.age.toFixed(1) : 'N/A'} ans</strong></div>
              <div className="text-sm text-slate-600">Passoires thermiques : <strong>{hoveredDep.energivores ? hoveredDep.energivores.toFixed(1) : 'N/A'} %</strong></div>
              <div className="text-sm text-slate-600">Vacance sociale : <strong>{hoveredDep.vacance ? hoveredDep.vacance.toFixed(1) : 'N/A'} %</strong></div>
            </div>
          )}
        </div>

        {/* ROW 2 : PRIX VS QUALITE */}
        <div className="w-full flex flex-col xl:flex-row gap-6">
          <div className="w-full xl:w-1/4 flex flex-col justify-center px-2">
            <h4 className="text-xl font-extrabold text-slate-800 mb-3">Prix vs Qualité</h4>
            <p className="text-sm text-slate-600 mb-3 leading-relaxed">
              Est-ce que les gens paient cher pour des passoires ?
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              C'est le graphique de la <strong>"justice sociale"</strong>. Les points en haut à droite représentent les anomalies à corriger : un <strong>loyer moyen élevé</strong> pour un <strong>taux de passoires thermiques énorme</strong>.
            </p>
          </div>
          <div className="w-full xl:w-3/4 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-md font-bold text-slate-800 mb-1">Prix vs Qualité (Loyer x Énergivores)</h3>
            <p className="text-xs text-slate-500 mb-4">La double peine : Taux d'énergivores (Y) et Loyer (X)</p>
            <div className="h-[280px] w-full">
              <Scatter 
                data={prixQualiteData} 
                options={{
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { display: false },
                    tooltip: { callbacks: { label: c => `${c.raw.nom}: Loyer ${c.raw.x}€/m² | Énergivores ${c.raw.y}%` } } 
                  },
                  scales: { 
                    x: { 
                      min: 4.5,
                      max: 8,
                      clip: false,
                      title: { display: true, text: 'Loyer moyen (€/m²)', font: { size: 11, weight: '600' } } 
                    }, 
                    y: { 
                      min: 0,
                      max: 60,
                      clip: false,
                      title: { display: true, text: 'Passoires thermiques (%)', font: { size: 11, weight: '600' } } 
                    } 
                  }
                }} 
              />
            </div>
          </div>
        </div>

        {/* ROW 3 : FLUX */}
        <div className="w-full flex flex-col xl:flex-row gap-6">
          <div className="w-full xl:w-3/4 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
             <h3 className="text-md font-bold text-slate-800 mb-1">Mouvements du Parc Social (Solde Net)</h3>
             <p className="text-xs text-slate-500 mb-4">Mises en location (+) vs Sorties (-). La courbe représente le Solde Net.</p>
             <div className="h-[280px] w-full">
               <Bar 
                 data={fluxData} 
                 options={{ maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true } } }} 
               />
             </div>
          </div>
          <div className="w-full xl:w-1/4 flex flex-col justify-center px-2">
            <h4 className="text-xl font-extrabold text-slate-800 mb-3">Dynamique de l'offre</h4>
            <p className="text-sm text-slate-600 mb-3 leading-relaxed">
              Le <strong>Solde Net</strong> (Ligne Jaune) révèle si le parc s'agrandit ou se rétrécit. 
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Si la ligne passe en-dessous de 0 (point rouge), cela signifie qu'un département détruit et/ou vend plus de logements sociaux qu'il n'en construit (Alerte !).
            </p>
          </div>
        </div>

        {/* ROW 4 */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col">
             <h3 className="text-md font-bold text-slate-800 mb-1 leading-snug">Attractivité vs Coût</h3>
             <p className="text-xs text-slate-500 mb-4 line-clamp-2">Loyer (X) vs Attributions (Y). Volume des bulles = Nb total de logements.</p>
             <div className="h-[280px] w-full mt-auto">
               <Scatter 
                 data={attractiviteCoutData} 
                 options={{ 
                   maintainAspectRatio: false, 
                   plugins: { 
                     tooltip: { callbacks: { label: c => `${c.raw.nom}: Loyer ${c.raw.x}€ | ${c.raw.y} attributions | Parc: ${c.raw.nb_logements}` } },
                     legend: { display: false }
                   },
                   scales: {
                     x: { 
                       min: 4.5,
                       max: 8,
                       clip: false,
                       title: { display: true, text: 'Loyer moyen (€/m²)', font: { size: 10 } } 
                     },
                     y: { 
                       min: 0,
                       max: 3500,
                       clip: false,
                       title: { display: true, text: 'Mises en location', font: { size: 10 } } 
                     }
                   }
                  }} 
               />
             </div>
           </div>

           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col">
             <h3 className="text-md font-bold text-slate-800 mb-1 leading-snug">Loyer moyen par Région</h3>
             <p className="text-xs flex items-center gap-2 text-slate-500 mb-4 line-clamp-1">Ligne = Moyenne nationale. Fossé Île-de-France vs Reste.</p>
             <div className="h-[280px] w-full mt-auto">
               <Bar 
                 data={loyerRegionData} 
                 options={{ maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } }} 
               />
             </div>
           </div>
        </div>

        {/* CTA - Créer son propre graphique */}
        <div className="w-full py-1 text-center border-t border-slate-200">
          <p className="text-slate-600 text-sm mb-1">Vous ne trouvez pas ce que vous cherchez ?</p>
          <Link to="/test" className="inline-block text-slate-900 font-semibold hover:underline transition-all text-base">
            Créez votre propre graphique
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ParcSocialPage;
