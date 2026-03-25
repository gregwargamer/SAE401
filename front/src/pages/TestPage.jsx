import { useEffect, useMemo, useState } from "react";
import { apiClient, fetchGeoData } from "../service/mainapi";
import MapDepartements from "../components/MapDepartements";

// Importations recommandées pour Chart.js (déjà installé dans votre package.json)
import { 
  Chart as ChartJS, PointElement, Tooltip, Legend, 
  CategoryScale, LinearScale, LogarithmicScale, BarElement, Title 
} from 'chart.js';
import { Scatter, Bar } from 'react-chartjs-2';

// Enregistrement des modules pour Chart.js
ChartJS.register(PointElement, Tooltip, Legend, CategoryScale, LinearScale, LogarithmicScale, BarElement, Title);

const TestPage = () => {
  // pour stocker les données 
  const [data, setData] = useState([]);

  useEffect(() => {
    // 1. On lance le téléchargement
    const load = async () => {
      // on dmd les coo all et geo 
      const [geoResult, stats] = await Promise.all([fetchGeoData(), apiClient.get("/all")]);
      
      // l'anné la plus recente poru etre a jour 
      const statsList = stats.data || [];
      const anneeMax = Math.max(...statsList.map(s => Number(s.annee)).filter(n => !isNaN(n)));
      const statsAjour = statsList.filter(s => Number(s.annee) === anneeMax);

      // ici c pour coller les chiffre sur le geo et sauvegarder
      setData(geoResult.map(g => {
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


  // 3. Préparer les données du Scatter (Densité x Taux de logements sociaux)
  const scatterChartData = useMemo(() => {
    // Filtrer les données (Exclure Corse si on veut et retenir ceux qui ont les 2 chiffres)
    const points = data
      .filter(d => !isNaN(Number(d.densite)) && !isNaN(Number(d.taux_logements_sociaux)))
      .map(d => ({
        x: Number(d.densite),
        y: Number(d.taux_logements_sociaux),
        code: d.code,
        nom: d.nom
      }));

    return {
      datasets: [{
        label: 'Départements',
        data: points,
        backgroundColor: '#adc522', // vert doux Tailwind (emerald-500)
        pointRadius: 5,
        pointHoverRadius: 8
      }]
    };
  }, [data]);

  // Options pour le scatter plot
  const scatterOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const raw = context.raw;
            return `${raw.nom} (${raw.code}): ${raw.x} hab/km² | ${raw.y}% log. soc.`;
          }
        }
      }
    },
    scales: {
      x: {
        title: { display: true, text: 'Densité de population (hab/km²)', font: { size: 13, weight: 'bold' } },
        grid: { color: '#e5e7eb' },
        type: 'logarithmic', position: 'bottom', // L'échelle logarithmique règle le problème d'écrasement des points 
        ticks: {
          callback: function (value, index, values) {
            if (value === 10 || value === 100 || value === 1000 || value === 10000) {
              return value;
            }
            return '';
          }
        }
      },
      y: {
        title: { display: true, text: 'Taux de logements sociaux (%)', font: { size: 13, weight: 'bold' } },
        grid: { color: '#e5e7eb' }
      }
    }
  };


  // 4. Préparer les données de la Bar (Top 5 / Flop 5)
  const barChartData = useMemo(() => {
    // Filtrage pour ne garder que la France metropolitaine (sans corse, comme la carte)
    const dataMetropole = data.filter(d => 
      !isNaN(Number(d.taux_logements_sociaux)) && 
      String(d.code) !== "2A" && String(d.code) !== "2B" && !String(d.code).startsWith("97")
    );

    // Tri du plus grand taux au plus petit
    const sorted = [...dataMetropole].sort((a, b) => Number(b.taux_logements_sociaux) - Number(a.taux_logements_sociaux));
    
    const top5 = sorted.slice(0, 5);
    const flop5 = sorted.slice(-5).reverse(); // On inverse pour avoir le bonnet d'âne tout en bas du graph

    // Réunir le Top 5 et le Flop 5
    const mergedList = [...top5, ...flop5];

    return {
      labels: mergedList.map(d => d.nom),
      datasets: [{
        label: 'Taux de logements sociaux (%)',
        data: mergedList.map(d => Number(d.taux_logements_sociaux)),
        // Bleu foncé pour les 5 premiers, Bleu ciel pour les 5 derniers
        backgroundColor: [...Array(5).fill('#1e3a8a'), ...Array(5).fill('#93c5fd')],
        borderRadius: 4
      }]
    };
  }, [data]);


  return (
    <section className="p-2 lg:p-0">
      {/* On utilise grid pour gerer lg: 1 col map / 1 col pour la droite (qui comprend les 2 graphs) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 items-start">
        
        {/* Colonne GAUCHE: Carte et son encart au-dessus */}
        <div className="w-full flex flex-col gap-4">
          <div className="text-md bg-gray-200 text-black p-3 rounded-md border w-full">
            Concevez vos propre graphique et croisé les données officiel que vous souhaitez !  
          </div>

          <div className="w-full border border-stone-200 bg-white rounded-xl overflow-hidden h-[80vh] min-h-[450px]">
            {/* affichage de la carte juste ici*/}
            <MapDepartements features={mapData} />
          </div>
        </div>

        {/* Colonne DROITE: Les deux widgets de graphiques empilés (Top 5/Flop 5 en haut, Scatter en bas) */}
        <div className="w-full flex flex-col gap-6 lg:mt-0">

          {/* ---> 1. BLOC BAR HORIZONTALE (Graph à droite, Texte à gauche) */}
          <div className="flex flex-col-reverse lg:flex-row-reverse gap-4 items-start">
            <div className="w-full lg:w-3/4 h-[300px] relative">
               <Bar 
                data={barChartData} 
                options={{ 
                  maintainAspectRatio: false, 
                  indexAxis: 'y', // Mode horizontal
                  plugins: { legend: { display: false } },
                  scales: { 
                    x: { ticks: { font: { size: 12 } } }, 
                    y: { ticks: { font: { size: 12 } }, grid: { display: false } } 
                  }
                }} 
               />
            </div>
            <div className="w-full lg:w-1/4 text-md text-slate-800 flex flex-col gap-4 leading-snug">
              <span className="font-extrabold text-2xl text-black">Top 5 vs Flop 5</span>
              <span>L'Île-de-France domine l'offre sociale pour absorber la demande, tandis que les zones rurales conservent des taux très inférieurs en raison de l'habitat individuel.</span>
            </div>
          </div>

          {/* ---> 2. BLOC SCATTER (Graph à droite, Texte à gauche) */}
          <div className="flex flex-col lg:flex-row-reverse gap-4 items-start">
            <div className="w-full lg:w-1/4 text-sm text-slate-800 flex flex-col gap-1 leading-snug">
              <span className="font-extrabold text-2xl text-black">Densité vs Offre Sociale</span>
              <span>Les métropoles denses concentrent l'essentiel du parc social. Les territoires ruraux, peu denses, restent largement en dessous du seuil SRU de 25%</span>
            </div>
            {/* on laisse un espace 3/4 enorme au graph */}
            <div className="w-full lg:w-3/4 h-[300px] relative">
               <Scatter 
                data={scatterChartData} 
                options={scatterOptions} 
               />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TestPage;
