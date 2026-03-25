import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../service/mainapi";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import MapComparateur from "../components/MapComparateur";
import SidebarComparateurMap from "../components/SidebarComparateurMap";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

/* couleurs des deux départements sélectionnés */
const COLOR_DEP1 = "#ef4444";
const COLOR_DEP2 = "#3b82f6";
const COLOR_DEP1_COMP = "#fca5a5";
const COLOR_DEP2_COMP = "#93c5fd";

/* retourne un Number valide ou null */
const val = (d, key) =>
  d && Number.isFinite(Number(d[key])) ? Number(d[key]) : null;

/* options pour les bar charts horizontaux */
const barOpts = (suffix = "%") => ({
  indexAxis: "y",
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.parsed.x != null ? ctx.parsed.x.toFixed(2) : "N/A"}${suffix}`,
      },
    },
  },
  scales: {
    x: { ticks: { font: { size: 11 } } },
    y: { ticks: { font: { size: 12, weight: "600" } }, grid: { display: false } },
  },
});

/* options pour les camemberts */
const pieOpts = {
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.label}: ${ctx.parsed != null ? ctx.parsed.toFixed(2) : "N/A"}%`,
      },
    },
  },
};

const ComparateurPage = () => {
  const [rawData, setRawData] = useState([]);
  const [geoData, setGeoData] = useState([]);
  const [dep1Code, setDep1Code] = useState(null);
  const [dep2Code, setDep2Code] = useState(null);
  const [selectedYear, setSelectedYear] = useState("all");

  useEffect(() => {
    const load = async () => {
      /* charge en parallèle les géométries et les stats */
      const [geo, stats] = await Promise.all([
        apiClient.get("/geo"),
        apiClient.get("/all"),
      ]);
      setGeoData(geo.data || []);
      setRawData(stats.data || []);
    };
    load();
  }, []);

  /* années disponibles pour le sélecteur */
  const years = useMemo(() =>
    [...new Set(rawData.map((d) => String(d.annee)).filter(Boolean))].sort()
  , [rawData]);

  /* données agrégées par département — moyenne si "all" ou filtrées par année */
  const latestData = useMemo(() => {
    if (!rawData.length) return [];
    const rows = selectedYear === "all" ? rawData : rawData.filter((s) => String(s.annee) === selectedYear);
    const map = {};
    rows.forEach((d) => {
      const code = d.code_departement || d.code;
      if (!code) return;
      if (!map[code]) map[code] = { code, nom: d.nom_departement || d.nom, rows: [] };
      map[code].rows.push(d);
    });
    const numKeys = ["taux_chomage","taux_pauvrete","taux_logements_sociaux","taux_logements_vacants","taux_logements_individuels","densite","moyenne_construction_neuve","construction"];
    return Object.values(map).map(({ code, nom, rows }) => {
      const avg = {};
      numKeys.forEach((k) => {
        const vals = rows.map((r) => Number(r[k])).filter((v) => !isNaN(v));
        avg[k] = vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
      });
      return { code, nom, ...avg };
    });
  }, [rawData, selectedYear]);

  /* liste triée des départements métro pour les menus déroulants */
  const depList = useMemo(() => {
    return latestData
      .filter((d) => {
        const c = String(d.code);
        // On exclut les DOM et la Corse parce que chiant
        return !c.startsWith("97") && !c.startsWith("98") && c !== "2A" && c !== "2B" && c !== "20";
      })
      .sort((a, b) => String(a.code).localeCompare(String(b.code)));
  }, [latestData]);

  /* données GeoJSON pour la carte, même structure que LogementPage */
  const mapData = useMemo(() => {
    return geoData.map((g) => {
      let geometry;
      try { geometry = typeof g.geom === "string" ? JSON.parse(g.geom) : g.geom; } catch { return null; }
      if (!geometry) return null;
      const stats = latestData.find((s) => s.code === g.code) || {};
      return {
        type: "Feature",
        geometry: geometry.type === "Feature" ? geometry.geometry : geometry,
        properties: { nom: g.nom, code: g.code, taux_logements_sociaux: stats.taux_logements_sociaux, taux_chomage: stats.taux_chomage, taux_pauvrete: stats.taux_pauvrete },
      };
    }).filter(Boolean);
  }, [geoData, latestData]);

  /* logique de sélection sur la carte : alterne dep1/dep2, re-clic désélectionne */
  const handleMapSelect = (code) => {
    const c = String(code);
    if (c === String(dep1Code)) { setDep1Code(null); return; }
    if (c === String(dep2Code)) { setDep2Code(null); return; }
    if (!dep1Code) { setDep1Code(c); }
    else if (!dep2Code) { setDep2Code(c); }
    else { setDep1Code(c); }
  };

  /* stats des deux départements choisis */
  const d1 = useMemo(() => latestData.find((d) => String(d.code) === String(dep1Code)) || null, [latestData, dep1Code]);
  const d2 = useMemo(() => latestData.find((d) => String(d.code) === String(dep2Code)) || null, [latestData, dep2Code]);
  const nom1 = d1?.nom || "Département 1";
  const nom2 = d2?.nom || "Département 2";

  /* 5 bar charts : chômage, pauvreté, logements sociaux, vacants, densité */
  const barChomage = useMemo(() => ({ labels: [nom1, nom2], datasets: [{ data: [val(d1, "taux_chomage"), val(d2, "taux_chomage")], backgroundColor: [COLOR_DEP1, COLOR_DEP2], borderRadius: 6 }] }), [d1, d2, nom1, nom2]);
  const barPauvrete = useMemo(() => ({ labels: [nom1, nom2], datasets: [{ data: [val(d1, "taux_pauvrete"), val(d2, "taux_pauvrete")], backgroundColor: [COLOR_DEP1, COLOR_DEP2], borderRadius: 6 }] }), [d1, d2, nom1, nom2]);
  const barLogSoc = useMemo(() => ({ labels: [nom1, nom2], datasets: [{ data: [val(d1, "taux_logements_sociaux"), val(d2, "taux_logements_sociaux")], backgroundColor: [COLOR_DEP1, COLOR_DEP2], borderRadius: 6 }] }), [d1, d2, nom1, nom2]);
  const barVacants = useMemo(() => ({ labels: [nom1, nom2], datasets: [{ data: [val(d1, "taux_logements_vacants"), val(d2, "taux_logements_vacants")], backgroundColor: [COLOR_DEP1, COLOR_DEP2], borderRadius: 6 }] }), [d1, d2, nom1, nom2]);
  const barDensite = useMemo(() => ({ labels: [nom1, nom2], datasets: [{ data: [val(d1, "densite"), val(d2, "densite")], backgroundColor: [COLOR_DEP1, COLOR_DEP2], borderRadius: 6 }] }), [d1, d2, nom1, nom2]);

  /* 5 camemberts : indiv/collectif dep1, indiv/collectif dep2, pauvreté dep1, pauvreté dep2, social comparaison */
  const pieIndiv1 = useMemo(() => { const i = val(d1, "taux_logements_individuels") ?? 0; return { labels: ["Individuels", "Collectifs"], datasets: [{ data: [i, Math.max(0, 100 - i)], backgroundColor: [COLOR_DEP1, COLOR_DEP1_COMP], borderWidth: 1 }] }; }, [d1]);
  const pieIndiv2 = useMemo(() => { const i = val(d2, "taux_logements_individuels") ?? 0; return { labels: ["Individuels", "Collectifs"], datasets: [{ data: [i, Math.max(0, 100 - i)], backgroundColor: [COLOR_DEP2, COLOR_DEP2_COMP], borderWidth: 1 }] }; }, [d2]);
  const piePauvrete1 = useMemo(() => { const p = val(d1, "taux_pauvrete") ?? 0; return { labels: ["Sous seuil pauvreté", "Reste"], datasets: [{ data: [p, Math.max(0, 100 - p)], backgroundColor: [COLOR_DEP1, COLOR_DEP1_COMP], borderWidth: 1 }] }; }, [d1]);
  const piePauvrete2 = useMemo(() => { const p = val(d2, "taux_pauvrete") ?? 0; return { labels: ["Sous seuil pauvreté", "Reste"], datasets: [{ data: [p, Math.max(0, 100 - p)], backgroundColor: [COLOR_DEP2, COLOR_DEP2_COMP], borderWidth: 1 }] }; }, [d2]);
  const pieSocialCompar = useMemo(() => ({ labels: [nom1, nom2], datasets: [{ data: [val(d1, "taux_logements_sociaux") ?? 0, val(d2, "taux_logements_sociaux") ?? 0], backgroundColor: [COLOR_DEP1, COLOR_DEP2], borderWidth: 1 }] }), [d1, d2, nom1, nom2]);

  const hasSelection = dep1Code || dep2Code;

  return (
    <div className="flex flex-col lg:flex-row w-full items-start bg-transparent min-h-screen">
      <SidebarComparateurMap
        dep1Code={dep1Code} setDep1Code={setDep1Code}
        dep2Code={dep2Code} setDep2Code={setDep2Code}
        depList={depList}
        selectedYear={selectedYear} setSelectedYear={setSelectedYear}
        years={years}
      />

      <div className="flex-1 w-full lg:ml-[240px] xl:ml-[20%] flex flex-col gap-6 p-4 lg:p-8 lg:pt-6 pb-10">


        {/* Carte unique cliquable */}
        <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="w-full h-[55vh] min-h-[380px]">
            <MapComparateur features={mapData} dep1={dep1Code} dep2={dep2Code} onSelectDep={handleMapSelect} />
          </div>
        </div>

        {/* État vide si aucune sélection */}
        {!hasSelection ? (
          <div className="flex items-center justify-center">
            <div className="text-center py-16 px-8 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-md">
              <h2 className="text-lg font-bold text-slate-700 mb-2">Aucun département sélectionné</h2>
              <p className="text-sm text-slate-500">
                Cliquez sur un ou deux départements sur la carte, ou utilisez les menus déroulants dans la sidebar.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">

          {/* Badges des deux départements sélectionnés */}
          {dep1Code && dep2Code && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <span className="w-4 h-4 rounded bg-red-500" />
                <span className="font-bold text-red-700 text-sm">{nom1} ({dep1Code})</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                <span className="w-4 h-4 rounded bg-blue-500" />
                <span className="font-bold text-blue-700 text-sm">{nom2} ({dep2Code})</span>
              </div>
            </div>
          )}

          {/* 5 bar charts */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3">
              <h3 className="text-xs font-bold text-slate-800 mb-0.5">Taux de chômage</h3>
              <p className="text-[10px] text-slate-400 mb-2">Part de la population active sans emploi.</p>
              <div className="h-[90px]"><Bar data={barChomage} options={barOpts()} /></div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3">
              <h3 className="text-xs font-bold text-slate-800 mb-0.5">Taux de pauvreté</h3>
              <p className="text-[10px] text-slate-400 mb-2">Sous le seuil de pauvreté.</p>
              <div className="h-[90px]"><Bar data={barPauvrete} options={barOpts()} /></div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3">
              <h3 className="text-xs font-bold text-slate-800 mb-0.5">Logements sociaux</h3>
              <p className="text-[10px] text-slate-400 mb-2">Part du parc résidentiel HLM.</p>
              <div className="h-[90px]"><Bar data={barLogSoc} options={barOpts()} /></div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3">
              <h3 className="text-xs font-bold text-slate-800 mb-0.5">Logements vacants</h3>
              <p className="text-[10px] text-slate-400 mb-2">Part des logements inoccupés.</p>
              <div className="h-[90px]"><Bar data={barVacants} options={barOpts()} /></div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3">
              <h3 className="text-xs font-bold text-slate-800 mb-0.5">Densité de population</h3>
              <p className="text-[10px] text-slate-400 mb-2">Habitants par km².</p>
              <div className="h-[90px]"><Bar data={barDensite} options={barOpts(" hab/km²")} /></div>
            </div>
          </div>

          {/* 5 camemberts */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3">
              <h3 className="text-xs font-bold text-slate-800 mb-0.5">
                <span className="inline-block w-2 h-2 rounded bg-red-500 mr-1" />
                Individuel vs collectif  {nom1}
              </h3>
              <p className="text-[10px] text-slate-400 mb-2">Structure du parc.</p>
              <div className="h-[160px]"><Pie data={pieIndiv1} options={pieOpts} /></div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3">
              <h3 className="text-xs font-bold text-slate-800 mb-0.5">
                <span className="inline-block w-2 h-2 rounded bg-blue-500 mr-1" />
                Individuel vs collectif {nom2}
              </h3>
              <p className="text-[10px] text-slate-400 mb-2">Structure du parc.</p>
              <div className="h-[160px]"><Pie data={pieIndiv2} options={pieOpts} /></div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3">
              <h3 className="text-xs font-bold text-slate-800 mb-0.5">
                <span className="inline-block w-2 h-2 rounded bg-red-500 mr-1" />
                Pauvreté en {nom1}
              </h3>
              <p className="text-[10px] text-slate-400 mb-2">Sous le seuil de pauvreté.</p>
              <div className="h-[160px]"><Pie data={piePauvrete1} options={pieOpts} /></div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3">
              <h3 className="text-xs font-bold text-slate-800 mb-0.5">
                <span className="inline-block w-2 h-2 rounded bg-blue-500 mr-1" />
                Pauvreté en {nom2}
              </h3>
              <p className="text-[10px] text-slate-400 mb-2">Sous le seuil de pauvreté.</p>
              <div className="h-[160px]"><Pie data={piePauvrete2} options={pieOpts} /></div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3">
              <h3 className="text-xs font-bold text-slate-800 mb-0.5">Logements sociaux comparés</h3>
              <p className="text-[10px] text-slate-400 mb-2">Proportion relative.</p>
              <div className="h-[160px]"><Pie data={pieSocialCompar} options={pieOpts} /></div>
            </div>
          </div>

        </div>
      )}

      </div>
    </div>
  );
};

export default ComparateurPage;