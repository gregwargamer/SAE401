import { useState, useEffect, useMemo } from "react";
import { getAll } from "../service/regiondepartement";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { Bar, Scatter, Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

/* Catalogue tous les champs dispo */
const FIELD_GROUPS = [
  { group: "Population",  fields: [{ key: "nb_habitants", label: "Nombre d'habitants" }, { key: "densite", label: "Densité (hab/km²)" }, { key: "variation_population", label: "Variation de population (%)" }, { key: "contribution_solde_naturel", label: "Solde naturel (%)" }, { key: "contribution_solde_migratoire", label: "Solde migratoire (%)" }, { key: "pct_moins_20ans", label: "Part des moins de 20 ans (%)" }, { key: "pct_plus_60ans", label: "Part des plus de 60 ans (%)" }, { key: "taux_chomage", label: "Taux de chômage (%)" }, { key: "taux_pauvrete", label: "Taux de pauvreté (%)" }] },
  { group: "Logement",    fields: [{ key: "nb_logements", label: "Nombre de logements" }, { key: "nb_residences_principales", label: "Résidences principales" }, { key: "taux_logements_sociaux", label: "Taux logements sociaux (%)" }, { key: "taux_logements_vacants", label: "Taux logements vacants (%)" }, { key: "taux_logements_individuels", label: "Taux logements individuels (%)" }, { key: "moyenne_construction_neuve", label: "Construction neuve moyenne" }, { key: "construction", label: "Construction (total)" }] },
  { group: "Parc Social", fields: [{ key: "parc_social_nb_logements", label: "Logements parc social" }, { key: "logements_mis_en_location", label: "Logements mis en location" }, { key: "logements_demolis", label: "Logements démolis" }, { key: "ventes_personnes_physiques", label: "Ventes personnes physiques" }, { key: "parc_social_taux_vacants", label: "Taux vacants parc social (%)" }, { key: "parc_social_taux_individuels", label: "Taux individuels parc social (%)" }, { key: "loyer_moyen", label: "Loyer moyen (€/m²)" }, { key: "age_moyen_parc", label: "Âge moyen du parc (ans)" }, { key: "taux_energivores", label: "Passoires thermiques (%)" }] },
];

/* ALL_FIELDS liste tous les champs et findLabel qui retourne le label lisible a partir de l'id (enfin la cle quoi) */
const ALL_FIELDS = FIELD_GROUPS.flatMap(g => g.fields);
const findLabel = (key) => ALL_FIELDS.find(f => f.key === key)?.label ?? key;

const CHART_TYPES = [{ id: "bar", label: "Barres" }, { id: "line", label: "Lignes" }, { id: "scatter", label: "Nuage" }];

/* avg moyenne d'un champ sur un tableau de lignes (ignore null/NaN) */
const avg = (rows, key) => {
  const vals = rows.map(d => Number(d[key])).filter(v => !isNaN(v) && v !== null);
  return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
};

/* formatage FR avec 1 décimale */
const fmt = (v) =>
  v == null ? "N/A" : Number(v).toLocaleString("fr-FR", { maximumFractionDigits: 1 });

/* Composant selection de champ */
const FieldSelect = ({ value, onChange, exclude, colorClass, label }) => (
  <div className="flex flex-col gap-1">
    <span className={`text-xs font-bold uppercase tracking-widest ${colorClass}`}>{label}</span>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white outline-none focus:border-indigo-400 cursor-pointer"
    >
      {/* vide */}
      <option value="">— Choisir un indicateur —</option>
      {FIELD_GROUPS.map(({ group, fields }) => (
        <optgroup key={group} label={group}>
          {fields
            .filter(f => f.key !== exclude)
            .map(f => (
              <option key={f.key} value={f.key}>{f.label}</option>
            ))}
        </optgroup>
      ))}
    </select>
  </div>
);

/* Page principale */
const ComparateurPage = () => {
  const [allData, setAllData] = useState([]); const [mode, setMode] = useState("departement"); const [fieldX, setFieldX] = useState("nb_habitants"); const [fieldY, setFieldY] = useState("nb_logements"); const [chartType, setChartType] = useState("scatter"); const [selectedYear, setSelectedYear] = useState("all");

  useEffect(() => { getAll().then(d => setAllData(d || [])); }, []);

  /* Années disponibles */
  const years = useMemo(() =>
    [...new Set(allData.map(d => String(d.annee)).filter(Boolean))].sort()
    , [allData]);


  /* Données agregated pour l'année choisie */
  const chartData = useMemo(() => {
    if (!fieldX || !fieldY) return [];

    const yearRows = selectedYear === "all"
      ? allData
      : allData.filter(d => String(d.annee) === String(selectedYear));

    if (mode === "departement") {
      // Regrouper par département
      const map = {};
      yearRows.forEach(d => {
        if (!d.code_departement) return;
        const k = d.code_departement;
        if (!map[k]) map[k] = { name: `${d.nom_departement} (${d.code_departement})`, rows: [] };
        map[k].rows.push(d);
      });
      return Object.values(map).map(({ name, rows }) => ({
        name,
        x: avg(rows, fieldX),
        y: avg(rows, fieldY),
      })).filter(p => p.x != null && p.y != null);
    } else {
      // Regrouper par région
      const map = {};
      yearRows.forEach(d => {
        if (!d.nom_region) return;
        if (!map[d.nom_region]) map[d.nom_region] = { name: d.nom_region, rows: [] };
        map[d.nom_region].rows.push(d);
      });
      return Object.values(map).map(({ name, rows }) => ({
        name,
        x: avg(rows, fieldX),
        y: avg(rows, fieldY),
      })).filter(p => p.x != null && p.y != null);
    }
  }, [allData, mode, fieldX, fieldY, selectedYear]);

  /* Construction du dataset */
  const colors = ["#6366f1","#f43f5e","#10b981","#f59e0b","#3b82f6","#8b5cf6","#ec4899","#14b8a6","#f97316","#06b6d4","#a3e635","#fb923c"];

  const buildDataset = () => {
    if (chartType === "scatter") {
      return {
        datasets: [{
          label: `${findLabel(fieldX)} vs ${findLabel(fieldY)}`,
          data: chartData.map(p => ({ x: p.x, y: p.y, name: p.name })),
          backgroundColor: chartData.map((_, i) => colors[i % colors.length] + "cc"),
          pointRadius: 7,
          pointHoverRadius: 10,
        }],
      };
    }

    // Bar Line : X = entités, Y = valeur
    const labels = chartData.map(p => p.name);
    const makeDs = (field, color, label) => ({
      label,
      data: chartData.map(p => p[field === fieldX ? "x" : "y"]),
      backgroundColor: color + "bb",
      borderColor: color,
      borderWidth: 2,
      borderRadius: chartType === "bar" ? 5 : 0,
      pointRadius: chartType === "line" ? 4 : 0,
      tension: 0.3,
    });

    return {
      labels,
      datasets: [
        makeDs(fieldX, "#6366f1", findLabel(fieldX)),
        makeDs(fieldY, "#f43f5e", findLabel(fieldY)),
      ],
    };
  };

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: { position: "top", labels: { boxWidth: 12, font: { size: 11 } } },
      tooltip: {
        callbacks: {
          label: ctx => {
            if (chartType === "scatter") {
              const pt = ctx.raw;
              return [
                pt.name,
                `${findLabel(fieldX)} : ${fmt(pt.x)}`,
                `${findLabel(fieldY)} : ${fmt(pt.y)}`,
              ];
            }
            return `${ctx.dataset.label} : ${fmt(ctx.raw)}`;
          },
        },
      },
    },
    scales: chartType === "scatter"
      ? {
        x: { title: { display: true, text: findLabel(fieldX), font: { size: 11 } }, ticks: { font: { size: 10 } } },
        y: { title: { display: true, text: findLabel(fieldY), font: { size: 11 } }, ticks: { font: { size: 10 } } },
      }
      : {
        x: { ticks: { font: { size: 9 }, maxRotation: 60 }, grid: { display: false } },
        y: { ticks: { font: { size: 10 } }, grid: { color: "rgba(0,0,0,0.05)" } },
      },
  };

  const ChartComponent = chartType === "bar" ? Bar : chartType === "line" ? Line : Scatter;

  const sel = "border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 bg-white outline-none focus:border-indigo-400 cursor-pointer";

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Explorateur de données</h1>
        <p className="text-sm text-slate-500 mt-1">
          Choisissez deux indicateurs et visualisez-les sur l'ensemble des {mode === "departement" ? "départements" : "régions"}.
        </p>
      </div>

      {/* Panneau de contrôle */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-5">

        {/* Ligne 1 : Mode géo + Type de graphique */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Toggle Dept / Région */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Niveau géographique</p>
            <div className="flex w-fit border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              {["departement", "region"].map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className={`px-5 py-2 text-sm font-semibold transition-colors ${mode === m ? "bg-slate-800 text-white" : "bg-white text-slate-500 hover:text-slate-800"}`}>
                  {m === "departement" ? "Département" : "Région"}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle type de graphique */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Type de graphique</p>
            <div className="flex w-fit border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              {CHART_TYPES.map(ct => (
                <button key={ct.id} onClick={() => setChartType(ct.id)}
                  className={`px-5 py-2 text-sm font-semibold transition-colors ${chartType === ct.id ? "bg-indigo-600 text-white" : "bg-white text-slate-500 hover:text-slate-800"}`}>
                  {ct.label}
                </button>
              ))}
            </div>
          </div>

          {/* Année */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Année</p>
            <select className={sel} value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
              <option value="all">Toutes les années</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Ligne 2 : Sélecteur X et Y */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <FieldSelect label="Indicateur X" colorClass="text-indigo-600" value={fieldX} onChange={setFieldX} exclude={fieldY} />
          <FieldSelect label="Indicateur Y" colorClass="text-rose-600"   value={fieldY} onChange={setFieldY} exclude={fieldX} />
        </div>
      </div>

      {/* Info résumé */}
      {chartData.length > 0 && (
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span className="bg-slate-100 text-slate-700 font-semibold px-3 py-1 rounded-full text-xs">
            {chartData.length} {mode === "departement" ? "départements" : "régions"}
          </span>
          <span className="font-semibold text-indigo-600">{findLabel(fieldX)}</span>
          <span className="text-slate-300 font-black">×</span>
          <span className="font-semibold text-rose-500">{findLabel(fieldY)}</span>
          <span className="text-slate-300">·</span>
          <span>{selectedYear}</span>
        </div>
      )}

      {/* Graphique */}
      {!fieldX || !fieldY ? (
        <p className="text-sm text-slate-400 text-center py-16">Sélectionnez deux indicateurs pour afficher le graphique.</p>
      ) : chartData.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-16">Aucune donnée disponible pour cette sélection.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div style={{ height: chartType === "scatter" ? 520 : Math.max(400, chartData.length * (chartType === "bar" ? 22 : 16)) }}>
            <ChartComponent data={buildDataset()} options={chartOptions} />
          </div>
        </div>
      )}

    </div>
  );
};

export default ComparateurPage;