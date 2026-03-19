import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../service/mainapi";
import MapDepartements from "../components/MapDepartements";

const HomePage = () => {
  // pour stocker les données 
  const [data, setData] = useState([]);

  useEffect(() => {
    // 1. On lance le téléchargement
    const load = async () => {
      // on dmd les coo all et geo 
      const [geo, stats] = await Promise.all([apiClient.get("/geo"), apiClient.get("/all")]);
      
      // l'anné la plus recente poru etre a jour 
      const statsList = stats.data || [];
      const anneeMax = Math.max(...statsList.map(s => Number(s.annee)).filter(n => !isNaN(n)));
      const statsAjour = statsList.filter(s => Number(s.annee) === anneeMax);

      // ici c pour coller les chiffre sur le geo et sauvegarder
      setData((geo.data || []).map(g => {
        const sesChiffres = statsAjour.find(s => s.code_departement === g.code) || {};
        return { ...g, ...sesChiffres, nom: g.nom, code: g.code };
      }));
    };
    load();
  }, []);

  // 2. tranformer en format gson pour que ca soir lisible pour fairela carte
  const mapData = useMemo(() => {
    return data.map(d => {
      let geometry;
      try { geometry = typeof d.geom === "string" ? JSON.parse(d.geom) : d.geom; } catch(e) { return null; }
      if (!geometry) return null;

      // stucturation des données
      return {
        type: "Feature",
        geometry: geometry.type === "Feature" ? geometry.geometry : geometry,
        properties: { nom: d.nom, code: d.code, taux_logements_sociaux: d.taux_logements_sociaux, taux_chomage: d.taux_chomage, taux_pauvrete: d.taux_pauvrete }
      };
    }).filter(v => v !== null); // On retire les erreurs
  }, [data]);

  return (
    <section className="p-2 lg:p-0">
      <div className="flex items-start">
        <div className="w-full max-w-[750px] border border-stone-200 rounded-xl overflow-hidden h-[80vh] min-h-[450px]">
          {/* affichage de la carte juste ici*/}
          <MapDepartements features={mapData} />
        </div>
      </div>
    </section>
  );
};

export default HomePage;
