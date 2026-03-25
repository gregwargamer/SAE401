import React from "react";

const FIELD_GROUPS = [
  { group: "Population",  fields: [{ key: "nb_habitants", label: "Nombre d'habitants" }, { key: "densite", label: "Densité (hab/km²)" }, { key: "variation_population", label: "Variation de population (%)" }, { key: "contribution_solde_naturel", label: "Solde naturel (%)" }, { key: "contribution_solde_migratoire", label: "Solde migratoire (%)" }, { key: "pct_moins_20ans", label: "Part des moins de 20 ans (%)" }, { key: "pct_plus_60ans", label: "Part des plus de 60 ans (%)" }, { key: "taux_chomage", label: "Taux de chômage (%)" }, { key: "taux_pauvrete", label: "Taux de pauvreté (%)" }] },
  { group: "Logement",    fields: [{ key: "nb_logements", label: "Nombre de logements" }, { key: "nb_residences_principales", label: "Résidences principales" }, { key: "taux_logements_sociaux", label: "Taux logements sociaux (%)" }, { key: "taux_logements_vacants", label: "Taux logements vacants (%)" }, { key: "taux_logements_individuels", label: "Taux logements individuels (%)" }, { key: "moyenne_construction_neuve", label: "Construction neuve moyenne" }, { key: "construction", label: "Construction (total)" }] },
  { group: "Parc Social", fields: [{ key: "parc_social_nb_logements", label: "Logements parc social" }, { key: "logements_mis_en_location", label: "Logements mis en location" }, { key: "logements_demolis", label: "Logements démolis" }, { key: "ventes_personnes_physiques", label: "Ventes personnes physiques" }, { key: "parc_social_taux_vacants", label: "Taux vacants parc social (%)" }, { key: "parc_social_taux_individuels", label: "Taux individuels parc social (%)" }, { key: "loyer_moyen", label: "Loyer moyen (€/m²)" }, { key: "age_moyen_parc", label: "Âge moyen du parc (ans)" }, { key: "taux_energivores", label: "Passoires thermiques (%)" }] },
];

const CHART_TYPES = [{ id: "bar", label: "Barres" }, { id: "line", label: "Lignes" }, { id: "scatter", label: "Nuage" }];

const sel = "w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 bg-white outline-none focus:border-indigo-400 cursor-pointer";
const btnBase = "w-full py-1.5 text-xs font-medium rounded-md transition-colors";
const btnActive = `${btnBase} bg-[#1f2a2e] text-white`;
const btnInactive = `${btnBase} bg-white text-slate-600 border border-slate-300 hover:bg-slate-50`;

const Label = ({ children }) => (
  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">{children}</p>
);

const SidebarComparateur = ({ mode, setMode, fieldX, setFieldX, fieldY, setFieldY, chartType, setChartType, selectedYear, setSelectedYear, years }) => {
  return (
    <aside className="static xl:fixed top-0 left-0 w-full xl:w-[20%] h-auto xl:h-screen bg-[#fafaf8] text-[#374151] border-b xl:border-r xl:border-b-0 border-[#e5e7eb] p-5 overflow-y-auto z-20 flex flex-col">
      <h2 className="text-lg font-extrabold tracking-widest text-[#111827] mb-4 border-b border-[#d1d5db] pb-2.5 uppercase text-center xl:text-left mt-2 xl:mt-0">
        COMPARATEUR
      </h2>

      <div className="flex-1 flex flex-col gap-4">

        {/* Niveau géographique */}
        <div>
          <Label>Niveau géographique</Label>
          <div className="flex border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            {["departement", "region"].map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-1.5 text-xs font-semibold transition-colors ${mode === m ? "bg-[#1f2a2e] text-white" : "bg-white text-slate-500 hover:text-slate-800"}`}>
                {m === "departement" ? "Département" : "Région"}
              </button>
            ))}
          </div>
        </div>

        {/* Type de graphique */}
        <div>
          <Label>Type de graphique</Label>
          <div className="flex flex-col gap-1.5">
            {CHART_TYPES.map(ct => (
              <button key={ct.id} onClick={() => setChartType(ct.id)}
                className={chartType === ct.id ? btnActive : btnInactive}>
                {ct.label}
              </button>
            ))}
          </div>
        </div>

        {/* Année */}
        <div>
          <Label>Année</Label>
          <select className={sel} value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
            <option value="all">Toutes les années</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Indicateur X */}
        <div>
          <Label><span className="text-indigo-600">Indicateur X</span></Label>
          <select className={sel} value={fieldX} onChange={e => setFieldX(e.target.value)}>
            <option value="">— Choisir —</option>
            {FIELD_GROUPS.map(({ group, fields }) => (
              <optgroup key={group} label={group}>
                {fields.filter(f => f.key !== fieldY).map(f => (
                  <option key={f.key} value={f.key}>{f.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Indicateur Y */}
        <div>
          <Label><span className="text-rose-500">Indicateur Y</span></Label>
          <select className={sel} value={fieldY} onChange={e => setFieldY(e.target.value)}>
            <option value="">— Choisir —</option>
            {FIELD_GROUPS.map(({ group, fields }) => (
              <optgroup key={group} label={group}>
                {fields.filter(f => f.key !== fieldX).map(f => (
                  <option key={f.key} value={f.key}>{f.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

      </div>
    </aside>
  );
};

export default SidebarComparateur;
