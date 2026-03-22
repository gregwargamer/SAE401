import { useMemo, useRef, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

// Couleurs pour la legendes, et c ici pour modif le max
const LEGENDE = [
  { max: 10, color: "#dbeafe", label: "5% - 10%" },
  { max: 15, color: "#93c5fd", label: "10% - 15%" },
  { max: 20, color: "#60a5fa", label: "15% - 20%" },
  { max: 25, color: "#2563eb", label: "20% - 25%" },
  { max: 30, color: "#1e3a8a", label: "25% - 37%" },
];

// penture la zone en focntion du chiffre du taux de logement
const getCouleur = (taux) => {
  if (!Number.isFinite(Number(taux))) return "#e5e7eb"; //si jamais ya pas de données 
  return (LEGENDE.find(bin => Number(taux) <= bin.max) || LEGENDE[4]).color;
};

// Formate en pourcentage pour les valeurs plus intuitif dcp 
const pourcent = (valeur) => Number.isFinite(Number(valeur)) ? `${Number(valeur).toFixed(2)}%` : "N/A";

const MapDepartements = ({ features }) => {
  const containerRef = useRef(null);
  const [survol, setSurvol] = useState(null); // Savoir quel département on touche
  const [souris, setSouris] = useState({ x: 0, y: 0 }); // Savoir où est la souris

  // On enlève les DOM-TOM et la Corse pour afficher que la France continentale
  // et corse car pas interessant et prend trop de place pour rien
  const carteDonnees = useMemo(() => ({
    type: "FeatureCollection",
    features: (features || []).filter(geo => {
      const code = String(geo.properties?.code || geo.properties?.code_departement);
      return !code.startsWith("97") && !code.startsWith("98") && code !== "2A" && code !== "2B" && code !== "20";
    })
  }), [features]);

  // il faut emttre a jolur manuelement la souris car la lib pue
  const bougerSouris = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) setSouris({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div ref={containerRef} className="relative h-full bg-slate-50">
      
      {/* 1. LA CARTE ET SES DESSINS */}
      <ComposableMap projection="geoMercator" projectionConfig={{ center: [2.4, 47], scale: 2300 }} className="w-full h-full outline-none">
        <Geographies geography={carteDonnees}>
          {({ geographies }) => geographies.map((geo) => (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              fill={getCouleur(geo.properties?.taux_logements_sociaux)}
              stroke="#475569" strokeWidth={0.8}
              style={{ default: { outline: "none" }, hover: { outline: "none", opacity: 0.8 }, pressed: { outline: "none" } }}
              onMouseEnter={(e) => { setSurvol(geo.properties); bougerSouris(e); }}
              onMouseMove={bougerSouris}
              onMouseLeave={() => setSurvol(null)}
            />
          ))}
        </Geographies>
      </ComposableMap>

      {/* Titre */}
      <div className="absolute top-3 left-3 px-1 py-1 text-md font-semibold text-slate-700">
        Taux de logements sociaux - France métropolitaine (2022)
        <div className="text-xs font-normal text-slate-500">Répartition de l'offre sociale sur le territoire national.</div>
      </div>

      {/* 2. INFOBULLE du hoverr (apparait seulement au survol avec la souris) */}
      {survol && (
        <div 
          className="absolute z-20 pointer-events-none bg-white border border-slate-300 rounded-lg p-2 text-xs shadow-lg"
          style={{ left: souris.x + 15, top: Math.max(souris.y - 20, 8) }}
        >
          <div className="font-bold mb-1">
            {survol.nom} {survol.code ? `(${survol.code})` : ""}
          </div>
          <div>Logements sociaux: {pourcent(survol.taux_logements_sociaux)}</div>
          <div>Chômage: {pourcent(survol.taux_chomage)}</div>
          <div>Pauvreté: {pourcent(survol.taux_pauvrete)}</div>
        </div>
      )}

      {/* 3. LEGENDE (en bas à gauche) */}
      <div className="absolute left-4 bottom-4 bg-white/95 border border-slate-300 rounded-xl p-3 shadow-lg">
        <div className="text-xs font-bold text-gray-800 mb-2">Taux logements sociaux</div>
        {LEGENDE.map((bin) => (
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
