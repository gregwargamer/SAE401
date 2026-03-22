import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../service/mainapi";
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
  const [sansGers, setSansGers] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [stats, geo] = await Promise.all([
        apiClient.get("/all"),
        apiClient.get("/geo")
      ]);
      setRawData(stats.data || []);
      setGeoData(geo.data || []);
    };
    load();
  }, []);

  const latestDataAll = useMemo(() => {
    if (!rawData.length) return [];
    const anneeMax = Math.max(...rawData.map(s => Number(s.annee)).filter(n => !isNaN(n)));
    return rawData.filter(s => Number(s.annee) === anneeMax).map(d => ({...d, nom: d.nom_departement || d.nom, code: d.code_departement || d.code}));
  }, [rawData]);

  const latestDataMetropole = useMemo(() => latestDataAll.filter(d => isMetropole(d.code) && (!sansGers || String(d.code) !== "32")), [latestDataAll, sansGers]);

  const mapData = useMemo(() => {
    if (!latestDataAll.length || !geoData.length) return [];
    
    // We only take Metropole for the map to keep zoom focused, sans Corse
    const topoFeatures = geoData.filter(g => isMetropole(g.code) && g.code !== "2A" && g.code !== "2B" && (!sansGers || String(g.code) !== "32")).map(g => {
      let parsed = null;
      try { parsed = JSON.parse(g.geom); } catch(e){}
      
      const stat = latestDataAll.find(s => s.code === g.code);
      
      return {
        type: "Feature",
        properties: { 
          code: g.code, 
          nom: g.nom,
          loyer: stat ? Number(stat.loyer_moyen) : null,
          age: stat ? Number(stat.age_moyen_parc) : null,
          energivores: stat ? Number(stat.taux_energivores) : null,
          vacance: stat ? Number(stat.parc_social_taux_vacants) : null
        },
        geometry: parsed
      };
    }).filter(f => f.geometry);
    
    return {
      type: "FeatureCollection",
      features: topoFeatures
    };
  }, [latestDataAll, geoData, sansGers]);

  const getEnergiColor = (energie) => {
    if (energie === null || isNaN(energie)) return "#e2e8f0";
    if (energie >= 20) return "#9f1239"; // rose sombre (+20%)
    if (energie >= 15) return "#dc2626"; // red
    if (energie >= 10) return "#f59e0b"; // orange
    if (energie >= 5) return "#facc15"; // jaune
    return "#86efac"; // vert clair (très peu)
  };

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // 01 Scatter: Énergivores x Loyer moyen
  const energiesLoyerData = useMemo(() => {
    const points = latestDataMetropole.filter(d => !isNaN(Number(d.taux_energivores)) && !isNaN(Number(d.loyer_moyen))).map(d => ({
      x: Number(d.taux_energivores),
      y: Number(d.loyer_moyen),
      nom: d.nom
    }));
    return {
      datasets: [{
        label: 'Départements (Métropole)',
        data: points,
        backgroundColor: '#ef4444',
        pointRadius: 4,
        pointHoverRadius: 7
      }]
    };
  }, [latestDataMetropole]);

  // 06 Flux : Entrées vs Sorties
  const fluxData = useMemo(() => {
    const sorted = [...latestDataMetropole].sort((a,b) => Number(b.logements_mis_en_location) - Number(a.logements_mis_en_location)).slice(0, 15);
    return {
      labels: sorted.map(d => d.nom.substring(0,10)+(d.nom.length>10?".":"")),
      datasets: [
        {
          label: 'Mises en location (+)',
          data: sorted.map(d => Number(d.logements_mis_en_location)),
          backgroundColor: '#10b981', // green
        },
        {
          label: 'Démolitions (-)',
          data: sorted.map(d => -Number(d.logements_demolis)),
          backgroundColor: '#f43f5e', // rose
        },
        {
          label: 'Ventes physiques (-)',
          data: sorted.map(d => -Number(d.ventes_personnes_physiques)),
          backgroundColor: '#8b5cf6', // purple
        }
      ]
    };
  }, [latestDataMetropole]);

  // 05 Scatter: Age x Vacance
  const scatterAgeVacanceData = useMemo(() => {
    const points = latestDataMetropole.filter(d => !isNaN(Number(d.age_moyen_parc)) && !isNaN(Number(d.parc_social_taux_vacants))).map(d => ({
      x: Number(d.age_moyen_parc),
      y: Number(d.parc_social_taux_vacants),
      nom: d.nom
    }));
    return {
      datasets: [{
        label: 'Départements (Métropole)',
        data: points,
        backgroundColor: '#3b82f6',
        pointRadius: 4,
        pointHoverRadius: 7
      }]
    };
  }, [latestDataMetropole]);

  // 02 Bar horizontal: Loyer par région
  const loyerRegionData = useMemo(() => {
    const grouped = {};
    let totalRent = 0; let totalCnt = 0;
    latestDataAll.forEach(d => {
      const r = d.nom_region;
      const l = Number(d.loyer_moyen);
      if(!r || isNaN(l)) return;
      if(!grouped[r]) grouped[r] = {sum:0, cnt:0};
      grouped[r].sum += l; grouped[r].cnt++;
      totalRent += l; totalCnt++;
    });
    const avgNat = totalCnt > 0 ? totalRent / totalCnt : 5.8;
    const regions = Object.keys(grouped).sort((a,b) => (grouped[b].sum/grouped[b].cnt) - (grouped[a].sum/grouped[a].cnt));
    const vals = regions.map(r => grouped[r].sum / grouped[r].cnt);
    
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
          backgroundColor: '#38bdf8',
        }
      ]
    };
  }, [latestDataAll]);

  return (
    <div className="flex w-full items-start bg-transparent min-h-screen">
      <SidebarParcSocial sansGers={sansGers} setSansGers={setSansGers} />
      <div className="flex-1 ml-[240px] lg:ml-[22%] flex flex-col gap-8 p-6 lg:p-8">
        
        {/* ROW 1 : CHOROPLETH MAP */}
        <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative" onMouseMove={handleMouseMove}>
          <div className="absolute top-3 left-3 z-10">
            <h2 className="text-lg font-bold text-slate-800 leading-tight">Cartographie des Passoires Thermiques</h2>
            <div className="text-xs font-normal text-slate-500 mt-0.5">Part des logements très énergivores (F & G) par département (Hors Corse)</div>
            <div className="mt-3 flex items-center gap-2">
              <div className="text-xs font-semibold text-slate-600">&lt; 5 %</div>
              <div className="flex h-3 w-40 rounded-full bg-gradient-to-r from-[#86efac] via-[#facc15] via-[#f59e0b] via-[#dc2626] to-[#9f1239]"></div>
              <div className="text-xs font-semibold text-slate-600">&gt; 20 %</div>
            </div>
          </div>
          
          <div className="w-full h-[65vh] min-h-[500px] bg-slate-50">
            {mapData.features ? (
              <ComposableMap projection="geoMercator" projectionConfig={{ center: [2.4, 47], scale: 2300 }} className="w-full h-full outline-none">
                <Geographies geography={mapData}>
                  {({ geographies }) => geographies.map(geo => {
                    const energie = geo.properties.energivores;
                    const fill = getEnergiColor(energie);
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
              <div className="text-sm text-slate-600">Âge moyen : <strong>{hoveredDep.age ? hoveredDep.age.toFixed(1) : 'N/A'} ans</strong></div>
              <div className="text-sm text-slate-600">Loyer moyen : <strong>{hoveredDep.loyer ? hoveredDep.loyer.toFixed(2) : 'N/A'} €/m²</strong></div>
              <div className="text-sm text-slate-600">Passoires thermiques : <strong>{hoveredDep.energivores ? hoveredDep.energivores.toFixed(1) : 'N/A'} %</strong></div>
              <div className="text-sm text-slate-600">Vacance sociale : <strong>{hoveredDep.vacance ? hoveredDep.vacance.toFixed(1) : 'N/A'} %</strong></div>
            </div>
          )}
        </div>

        {/* ROW 2 : ENERGIES VS LOYER */}
        <div className="w-full flex flex-col xl:flex-row gap-6">
          <div className="w-full xl:w-1/4 flex flex-col justify-center px-2">
            <h4 className="text-xl font-extrabold text-slate-800 mb-3">Énergivores × Loyer moyen</h4>
            <p className="text-sm text-slate-600 mb-3 leading-relaxed">
              Les parcs sociaux les plus chers sont-ils nécessairement les mieux rénovés ?
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              En croisant la <strong>part de passoires thermiques</strong> avec le <strong>loyer moyen</strong>, on devrait observer une véritable relation inverse si le coût du loyer garantit un logement économe.
            </p>
          </div>
          <div className="w-full xl:w-3/4 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-md font-bold text-slate-800 mb-1">Passoires thermiques vs Loyer moyen</h3>
            <p className="text-xs text-slate-500 mb-4">Loyer plus bas = parc plus vétuste (Corrélation attendue)</p>
            <div className="h-[280px] w-full">
              <Scatter 
                data={energiesLoyerData} 
                options={{
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { display: false },
                    tooltip: { callbacks: { label: c => `${c.raw.nom}: Énergivores ${c.raw.x}% | Loyer ${c.raw.y}€` } } 
                  },
                  scales: { 
                    x: { title: { display: true, text: 'Passoires thermiques (%)', font: { size: 11, weight: '600' } } }, 
                    y: { title: { display: true, text: 'Loyer moyen (€/m²)', font: { size: 11, weight: '600' } } } 
                  }
                }} 
              />
            </div>
          </div>
        </div>

        {/* ROW 3 : FLUX */}
        <div className="w-full flex flex-col xl:flex-row gap-6">
          <div className="w-full xl:w-3/4 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
             <h3 className="text-md font-bold text-slate-800 mb-1">Mouvements du Parc Social (Entrées / Sorties)</h3>
             <p className="text-xs text-slate-500 mb-4">Les mises en location (+), démolitions et ventes (-) transforment le parc.</p>
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
              Un parc social n'est pas figé : il évolue chaque année au gré des livraisons, des ventes ou des démolitions (Programme de Rénovation Urbaine).
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Si les sorties (démolitions et ventes) s'accumulent sans compensation par du neuf, l'offre sociale du territoire se contracte au détriment des mal-logés.
            </p>
          </div>
        </div>

        {/* ROW 4 */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col">
             <h3 className="text-md font-bold text-slate-800 mb-1 leading-snug">Âge moyen × Taux de vacance</h3>
             <p className="text-xs text-slate-500 mb-4 line-clamp-1">Un parc ancien peine-t-il plus à trouver preneur ?</p>
             <div className="h-[280px] w-full mt-auto">
               <Scatter data={scatterAgeVacanceData} options={{ maintainAspectRatio: false, plugins: { tooltip: { callbacks: { label: c => `${c.raw.nom}: Age ${c.raw.x} | Vacance ${c.raw.y}%` } } } }} />
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

      </div>
    </div>
  );
};

export default ParcSocialPage;
