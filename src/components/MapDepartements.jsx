import { useMemo, useRef, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

// Couleurs pour la légende - différentes selon la variable
const LEGENDES = {
  taux_logements_sociaux: [
    { max: 10, color: "#dbeafe", label: "5% - 10%" },
    { max: 15, color: "#93c5fd", label: "10% - 15%" },
    { max: 20, color: "#60a5fa", label: "15% - 20%" },
    { max: 25, color: "#2563eb", label: "20% - 25%" },
    { max: 30, color: "#1e3a8a", label: "25% - 37%" },
  ],
  taux_logements_vacants: [
    { max: 5, color: "#dbeafe", label: "0% - 5%" },
    { max: 8, color: "#93c5fd", label: "5% - 8%" },
    { max: 11, color: "#60a5fa", label: "8% - 11%" },
    { max: 14, color: "#2563eb", label: "11% - 14%" },
    { max: 16, color: "#1e3a8a", label: "14% - 16%" },
  ],
  taux_energivores: [
    { max: 10, color: "#fecaca", label: "0% - 10%" },
    { max: 15, color: "#f87171", label: "10% - 15%" },
    { max: 20, color: "#ef4444", label: "15% - 20%" },
    { max: 25, color: "#dc2626", label: "20% - 25%" },
    { max: 30, color: "#991b1b", label: "25% - 30%" },
  ],
};

const VARIABLE_CONFIG = {
  taux_logements_sociaux: { 
    label: "Taux de logements sociaux", 
    key: "taux_logements_sociaux",
    subtitle: "Répartition de l'offre sociale sur le territoire national."
  },
  taux_logements_vacants: { 
    label: "Taux de vacance", 
    key: "taux_logements_vacants",
    subtitle: "Proportion de logements vacants par département."
  },
  taux_energivores: { 
    label: "Taux de passoires", 
    key: "taux_energivores",
    subtitle: "Proportion de logements énergétiquement inefficaces."
  }
};

// Peindre la zone en fonction du chiffre du taux
const getCouleur = (taux, variable) => {
  if (!Number.isFinite(Number(taux))) return "#e5e7eb";
  const legende = LEGENDES[variable] || LEGENDES.taux_logements_sociaux;
  return (legende.find(bin => Number(taux) <= bin.max) || legende[legende.length - 1]).color;
};

// Formate en pourcentage
const pourcent = (valeur) => Number.isFinite(Number(valeur)) ? `${Number(valeur).toFixed(2)}%` : "N/A";

const MapDepartements = ({ features, selectedVariable = 'taux_logements_sociaux' }) => {
  const containerRef = useRef(null);
  const [survol, setSurvol] = useState(null);
  const [souris, setSouris] = useState({ x: 0, y: 0 });

  const varConfig = VARIABLE_CONFIG[selectedVariable] || VARIABLE_CONFIG.taux_logements_sociaux;

  const carteDonnees = useMemo(() => ({
    type: "FeatureCollection",
    features: (features || []).filter(geo => {
      const code = String(geo.properties?.code || geo.properties?.code_departement);
      return !code.startsWith("97") && !code.startsWith("98") && code !== "2A" && code !== "2B" && code !== "20";
    })
  }), [features]);

  const bougerSouris = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) setSouris({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div ref={containerRef} className="relative h-full bg-slate-50">
      <ComposableMap projection="geoMercator" projectionConfig={{ center: [2.4, 47], scale: 2300 }} className="w-full h-full outline-none">
        <Geographies geography={carteDonnees}>
          {({ geographies }) => geographies.map((geo) => (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              fill={getCouleur(geo.properties?.[varConfig.key], selectedVariable)}
              stroke="#475569" strokeWidth={0.8}
              style={{ default: { outline: "none" }, hover: { outline: "none", opacity: 0.8 }, pressed: { outline: "none" } }}
              onMouseEnter={(e) => { setSurvol(geo.properties); bougerSouris(e); }}
              onMouseMove={bougerSouris}
              onMouseLeave={() => setSurvol(null)}
            />
          ))}
        </Geographies>
      </ComposableMap>

      <div className="absolute top-3 left-3 px-1 py-1 text-md font-semibold text-slate-700">
        {varConfig.label} - France métropolitaine (2022)
        <div className="text-xs font-normal text-slate-500">{varConfig.subtitle}</div>
      </div>

      {survol && (
        <div 
          className="absolute z-20 pointer-events-none bg-white border border-slate-300 rounded-lg p-2 text-xs shadow-lg"
          style={{ left: souris.x + 15, top: Math.max(souris.y - 20, 8) }}
        >
          <div className="font-bold mb-2">
            {survol.nom} {survol.code ? `(${survol.code})` : ""}
          </div>
          <div className="font-semibold text-slate-800">
            {varConfig.label}: {pourcent(survol[varConfig.key])}
          </div>
          <div className="text-slate-600 mt-1">
            {selectedVariable !== 'taux_logements_sociaux' && <div>Logements sociaux: {pourcent(survol.taux_logements_sociaux)}</div>}
            {selectedVariable !== 'taux_logements_vacants' && <div>Vacance: {pourcent(survol.taux_logements_vacants)}</div>}
            {selectedVariable !== 'taux_energivores' && <div>Passoires: {pourcent(survol.taux_energivores)}</div>}
          </div>
        </div>
      )}

      <div className="absolute left-4 bottom-4 bg-white/95 border border-slate-300 rounded-xl p-3 shadow-lg">
        <div className="text-xs font-bold text-gray-800 mb-2">{varConfig.label}</div>
        {LEGENDES[selectedVariable].map((bin) => (
          <div key={bin.label} className="flex items-center gap-2 text-xs mb-1">
            <span className="w-3.5 h-3.5 rounded-[3px] border border-black/15" style={{ background: bin.color }} />
            <span>{bin.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapDepartements;
