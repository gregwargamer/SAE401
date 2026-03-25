import { useMemo, useRef, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

// Formate en pourcentage pour les valeurs plus intuitif dcp
const pourcent = (valeur) =>
  Number.isFinite(Number(valeur)) ? `${Number(valeur).toFixed(2)}%` : "N/A";


const MapComparateur = ({ features, dep1, dep2, onSelectDep }) => {
  const containerRef = useRef(null);
  const [survol, setSurvol] = useState(null); // Savoir quel département on touche
  const [souris, setSouris] = useState({ x: 0, y: 0 }); // Savoir où est la souris

  // On enlève les DOM-TOM et la Corse pour afficher que la France continentale
  // et corse car pas interessant et prend trop de place pour rien
  const carteDonnees = useMemo(
    () => ({
      type: "FeatureCollection",
      features: (features || []).filter((geo) => {
        const code = String(
          geo.properties?.code || geo.properties?.code_departement
        );
        return (
          !code.startsWith("97") &&
          !code.startsWith("98") &&
          code !== "2A" &&
          code !== "2B" &&
          code !== "20"
        );
      }),
    }),
    [features]
  );

  // il faut emttre a jolur manuelement la souris car la lib pue
  const bougerSouris = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) setSouris({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  /* couleur du département : rouge si dep1, bleu si dep2, gris-bleu pâle sinon */
  const getFill = (code) => {
    if (String(code) === String(dep1)) return "#ef4444";
    if (String(code) === String(dep2)) return "#3b82f6";
    return "#dbeafe";
  };

  return (
    <div ref={containerRef} className="relative h-full bg-slate-50">

      {/* Titre et légende des couleurs */}
      <div className="absolute top-3 left-3 px-1 py-1 text-sm font-semibold text-slate-700 z-10">
        Cliquez sur deux départements pour les comparer
        <div className="flex gap-3 mt-1">
          <span className="flex items-center gap-1 text-xs font-normal">
            <span className="w-3 h-3 rounded bg-red-500 inline-block" />
            Département 1
          </span>
          <span className="flex items-center gap-1 text-xs font-normal">
            <span className="w-3 h-3 rounded bg-blue-500 inline-block" />
            Département 2
          </span>
        </div>
      </div>

      {/* Carte et ses départements cliquables */}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [2.4, 47], scale: 2300 }}
        className="w-full h-full outline-none"
      >
        <Geographies geography={carteDonnees}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const code = String(
                geo.properties?.code || geo.properties?.code_departement
              );
              const isSelected =
                String(code) === String(dep1) || String(code) === String(dep2);
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={getFill(code)}
                  stroke={isSelected ? "#1e293b" : "#475569"}
                  strokeWidth={isSelected ? 1.8 : 0.8}
                  style={{
                    default: { outline: "none", cursor: "pointer" },
                    hover: { outline: "none", opacity: 0.75, cursor: "pointer" },
                    pressed: { outline: "none" },
                  }}
                  onMouseEnter={(e) => { setSurvol(geo.properties); bougerSouris(e); }}
                  onMouseMove={bougerSouris}
                  onMouseLeave={() => setSurvol(null)}
                  onClick={() => {
                    if (onSelectDep)
                      onSelectDep(
                        geo.properties.code || geo.properties.code_departement,
                        geo.properties.nom
                      );
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {/* 2. INFOBULLE du hoverr (apparait seulement au survol avec la souris) */}
      {survol && (
        <div
          className="absolute z-20 pointer-events-none bg-white border border-slate-300 rounded-lg p-2 text-xs shadow-lg"
          style={{ left: souris.x + 15, top: Math.max(souris.y - 20, 8) }}
        >
          <div className="font-bold mb-1">
            {survol.nom} {survol.code ? `(${survol.code})` : ""}
          </div>
          <div>Logements sociaux : {pourcent(survol.taux_logements_sociaux)}</div>
          <div>Chômage : {pourcent(survol.taux_chomage)}</div>
          <div>Pauvreté : {pourcent(survol.taux_pauvrete)}</div>
        </div>
      )}

    </div>
  );
};

export default MapComparateur;
