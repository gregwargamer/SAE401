import { useState, useEffect, useMemo } from "react";
import { getAll } from "../service/regiondepartement";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { Bar, Scatter, Line } from "react-chartjs-2";
import SidebarComparateur from "../components/SidebarComparateur";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

/* ALL_FIELDS liste tous les champs et findLabel qui retourne le label lisible a partir de l'id (enfin la cle quoi) */
const ALL_FIELDS = [
  { key: "nb_habitants", label: "Nombre d'habitants" }, { key: "densite", label: "Densité (hab/km²)" }, { key: "variation_population", label: "Variation de population (%)" }, { key: "contribution_solde_naturel", label: "Solde naturel (%)" }, { key: "contribution_solde_migratoire", label: "Solde migratoire (%)" }, { key: "pct_moins_20ans", label: "Part des moins de 20 ans (%)" }, { key: "pct_plus_60ans", label: "Part des plus de 60 ans (%)" }, { key: "taux_chomage", label: "Taux de chômage (%)" }, { key: "taux_pauvrete", label: "Taux de pauvreté (%)" },
  { key: "nb_logements", label: "Nombre de logements" }, { key: "nb_residences_principales", label: "Résidences principales" }, { key: "taux_logements_sociaux", label: "Taux logements sociaux (%)" }, { key: "taux_logements_vacants", label: "Taux logements vacants (%)" }, { key: "taux_logements_individuels", label: "Taux logements individuels (%)" }, { key: "moyenne_construction_neuve", label: "Construction neuve moyenne" }, { key: "construction", label: "Construction (total)" },
  { key: "parc_social_nb_logements", label: "Logements parc social" }, { key: "logements_mis_en_location", label: "Logements mis en location" }, { key: "logements_demolis", label: "Logements démolis" }, { key: "ventes_personnes_physiques", label: "Ventes personnes physiques" }, { key: "parc_social_taux_vacants", label: "Taux vacants parc social (%)" }, { key: "parc_social_taux_individuels", label: "Taux individuels parc social (%)" }, { key: "loyer_moyen", label: "Loyer moyen (€/m²)" }, { key: "age_moyen_parc", label: "Âge moyen du parc (ans)" }, { key: "taux_energivores", label: "Passoires thermiques (%)" },
];
const findLabel = (key) => ALL_FIELDS.find(f => f.key === key)?.label ?? key;

/* avg moyenne d'un champ sur un tableau de lignes (ignore null/NaN) */
const avg = (rows, key) => {
  const vals = rows.map(d => Number(d[key])).filter(v => !isNaN(v) && v !== null);
  return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
};

/* formatage FR avec 1 décimale */
const fmt = (v) => v == null ? "N/A" : Number(v).toLocaleString("fr-FR", { maximumFractionDigits: 1 });

/* Page principale */
const TestPage = () => {
  const [allData, setAllData] = useState([]);
  const [mode, setMode] = useState("departement");
  const [fieldX, setFieldX] = useState("nb_habitants");
  const [fieldY, setFieldY] = useState("nb_logements");
  const [chartType, setChartType] = useState("scatter");
  const [selectedYear, setSelectedYear] = useState("all");

  useEffect(() => {
    getAll().then(d => setAllData(d || []));
  }, []);

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
      const map = {};
      yearRows.forEach(d => {
        if (!d.code_departement) return;
        const k = d.code_departement;
        if (!map[k]) map[k] = { name: `${d.nom_departement} (${d.code_departement})`, rows: [] };
        map[k].rows.push(d);
      });
      return Object.values(map).map(({ name, rows }) => ({ name, x: avg(rows, fieldX), y: avg(rows, fieldY) })).filter(p => p.x != null && p.y != null);
    } else {
      const map = {};
      yearRows.forEach(d => {
        if (!d.nom_region) return;
        if (!map[d.nom_region]) map[d.nom_region] = { name: d.nom_region, rows: [] };
        map[d.nom_region].rows.push(d);
      });
      return Object.values(map).map(({ name, rows }) => ({ name, x: avg(rows, fieldX), y: avg(rows, fieldY) })).filter(p => p.x != null && p.y != null);
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

    // un dataset indigo pour l'indicateur X, un rose pour Y
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
              return [pt.name, `${findLabel(fieldX)} : ${fmt(pt.x)}`, `${findLabel(fieldY)} : ${fmt(pt.y)}`];
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

  return (
    <div className="flex flex-col lg:flex-row w-full items-start bg-transparent min-h-screen">
      <SidebarComparateur
        mode={mode} setMode={setMode}
        fieldX={fieldX} setFieldX={setFieldX}
        fieldY={fieldY} setFieldY={setFieldY}
        chartType={chartType} setChartType={setChartType}
        selectedYear={selectedYear} setSelectedYear={setSelectedYear}
        years={years}
      />

      <div className="flex-1 w-full lg:ml-[240px] xl:ml-[19%] flex flex-col gap-6 p-4 lg:p-8 lg:pt-6 pb-10">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Explorateur de données</h1>
          <p className="text-sm text-slate-500 mt-1">
            Choisissez deux indicateurs et visualisez-les sur l'ensemble des {mode === "departement" ? "départements" : "régions"}.
          </p>
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
            <span>{selectedYear === "all" ? "Toutes les années" : selectedYear}</span>
          </div>
        )}

        {/* Graphique */}
        {!fieldX || !fieldY ? (
          <p className="text-sm text-slate-400 text-center py-16">Sélectionnez deux indicateurs pour afficher le graphique.</p>
        ) : chartData.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-16">Aucune donnée disponible pour cette sélection.</p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="overflow-y-auto" style={{ maxHeight: "620px" }}>
              <div style={{ height: chartType === "scatter" ? 520 : Math.min(Math.max(320, chartData.length * (chartType === "bar" ? 22 : 16)), 600) }}>
                <ChartComponent data={buildDataset()} options={chartOptions} />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TestPage;
