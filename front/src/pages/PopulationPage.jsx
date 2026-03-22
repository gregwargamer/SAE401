import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../service/mainapi";
import {
  Chart as ChartJS, CategoryScale, LinearScale, LogarithmicScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend
} from "chart.js";
import { Bar, Scatter, Bubble } from "react-chartjs-2";
import SidebarPopulation from "../components/SidebarPopulation";

// Register custom charts
ChartJS.register(CategoryScale, LinearScale, LogarithmicScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const PopulationPage = () => {
  const [rawData, setRawData] = useState([]);
  const [showDomNatMig, setShowDomNatMig] = useState(false);
  const [sansGers, setSansGers] = useState(false);

  useEffect(() => {
    const load = async () => {
      const stats = await apiClient.get("/all");
      setRawData(stats.data || []);
    };
    load();
  }, []);

  // Fonction réutilisable pour exclure les DOM-TOM (codes commençant par 97 ou 98)
  // afin d'éviter qu'ils n'écrasent/étirent les échelles des graphiques à cause de valeurs extrêmes.
  const isMetropole = (code) => {
    if (!code) return false;
    const strCode = String(code);
    return !strCode.startsWith("97") && !strCode.startsWith("98");
  };

  // Filtrer sur l'année la plus récente (Toutes les données, DOM inclus)
  const latestDataAll = useMemo(() => {
    if (!rawData.length) return [];
    const anneeMax = Math.max(...rawData.map(s => Number(s.annee)).filter(n => !isNaN(n)));
    return rawData
      .filter(s => Number(s.annee) === anneeMax)
      .map(d => ({ ...d, nom: d.nom_departement || d.nom, code: d.code_departement || d.code }));
  }, [rawData]);

  // Données restreintes à la Métropole (sans les DOM)
  const latestDataMetropole = useMemo(() => {
    return latestDataAll.filter(d => isMetropole(d.code));
  }, [latestDataAll]);

  // 1. BUBBLE CHART : Chômage (X) × Pauvreté (Y) × Taux log. sociaux (R)
  // Commentaire : Triple corrélation entre précarité, chômage et présence du parc social.
  // Plus un département est pauvre et chômeur, plus il a de logements sociaux — mais pas toujours.
  const bubbleData = useMemo(() => {
    const points = latestDataMetropole
      .filter(d => !isNaN(Number(d.taux_chomage)) && !isNaN(Number(d.taux_pauvrete)) && !isNaN(Number(d.taux_logements_sociaux)))
      .filter(d => !sansGers || String(d.code) !== "32")
      .map(d => ({
        x: Number(d.taux_chomage),
        y: Number(d.taux_pauvrete),
        r: Number(d.taux_logements_sociaux) / 1.2, // Scaling size for readability
        code: d.code,
        nom: d.nom,
        realR: Number(d.taux_logements_sociaux)
      }));

    return {
      datasets: [{
        label: 'Départements',
        data: points,
        backgroundColor: 'rgba(56, 189, 248, 0.6)', // Blue-400 slightly transparent
        borderColor: '#0284c7', // Blue-600
        borderWidth: 1,
        hoverBackgroundColor: 'rgba(2, 132, 199, 0.8)'
      }]
    };
  }, [latestDataMetropole, sansGers]);

  const bubbleOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.raw.nom}: Chômage ${ctx.raw.x}% | Pauvreté ${ctx.raw.y}% | Sociaux ${ctx.raw.realR}%`
        }
      }
    },
    scales: {
      x: { title: { display: true, text: 'Taux de chômage (%)', font: { size: 12, weight: '600' } } },
      y: { title: { display: true, text: 'Taux de pauvreté (%)', font: { size: 12, weight: '600' } } }
    }
  };

  // 2. BAR GROUPÉ : Solde naturel vs migratoire (Groupé par Région pour lisibilité) INCLUS DOM
  // Commentaire : Parce que la lecture de deux barres côte à côte n'est pas intuitive pour tout le monde — 
  // il faut expliquer que quand le solde naturel est négatif mais le total positif, c'est la migration qui sauve la démographie.
  const barNatMigData = useMemo(() => {
    const grouped = {};
    latestDataAll.forEach(d => {
      let r = d.nom_region;
      if (!r) return;
      const isDom = !isMetropole(d.code);
      if (isDom && !showDomNatMig) return;
      
      if (!grouped[r]) grouped[r] = { nat: [], mig: [], cnt: 0, isDom: isDom };
      if (!isNaN(Number(d.contribution_solde_naturel)) && !isNaN(Number(d.contribution_solde_migratoire))) {
        grouped[r].nat.push(Number(d.contribution_solde_naturel));
        grouped[r].mig.push(Number(d.contribution_solde_migratoire));
        grouped[r].cnt++;
      }
    });

    const regions = Object.keys(grouped);
    regions.sort((a, b) => {
      // Les DOM à la fin
      if (grouped[a].isDom && !grouped[b].isDom) return 1;
      if (!grouped[a].isDom && grouped[b].isDom) return -1;
      // Puis par ordre alphabétique
      return a.localeCompare(b);
    });

    const natAvg = regions.map(r => {
      const g = grouped[r];
      return g.cnt > 0 ? g.nat.reduce((a, b) => a + b, 0) / g.cnt : 0;
    });
    const migAvg = regions.map(r => {
      const g = grouped[r];
      return g.cnt > 0 ? g.mig.reduce((a, b) => a + b, 0) / g.cnt : 0;
    });

    return {
      labels: regions.map(r => {
        let label = r.substring(0, 10) + (r.length > 10 ? '.' : '');
        if (grouped[r].isDom) label += ' (DOM)';
        return label;
      }),
      datasets: [
        {
          label: 'Solde Naturel',
          data: natAvg,
          backgroundColor: regions.map(r => grouped[r].isDom ? '#22c55e' : '#38bdf8'), // Green-500 for DOM, Sky-400 for Metropole
        },
        {
          label: 'Solde Migratoire',
          data: migAvg,
          backgroundColor: regions.map(r => grouped[r].isDom ? '#166534' : '#818cf8'), // Green-800 for DOM, Indigo-400 for Metropole
        }
      ]
    };
  }, [latestDataAll, showDomNatMig]);

  const barNatMigOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
      tooltip: { mode: 'index', intersect: false }
    },
    responsive: true,
    scales: {
      x: { title: { display: true, text: 'Régions' } },
      y: { title: { display: true, text: 'Contribution / 1000 hab' } }
    }
  };

  // 3. SCATTER : Taux de pauvreté (X) × Variation de population (Y)
  // Commentaire : Parce que la conclusion contre-intuitive — certains territoires pauvres croissent encore — mérite d'être explicitée. 
  // Sans texte le visiteur va chercher une tendance claire, ne pas en trouver, et penser que le gra^hique est raté 
  // alors que c'est justement l'absence de corrélation qui est le message.
  const scatterPauvreteVarData = useMemo(() => {
    const points = latestDataMetropole
      .filter(d => !isNaN(Number(d.taux_pauvrete)) && !isNaN(Number(d.variation_population)))
      .map(d => ({
        x: Number(d.taux_pauvrete),
        y: Number(d.variation_population),
        code: d.code,
        nom: d.nom
      }));

    return {
      datasets: [{
        label: 'Départements',
        data: points,
        backgroundColor: '#fb923c', // Orange-400
        pointRadius: 4,
        pointHoverRadius: 7
      }]
    };
  }, [latestDataMetropole]);

  const scatterPauvreteVarOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.raw.nom}: Pauvreté ${ctx.raw.x}% | Variation Pop. ${ctx.raw.y}`
        }
      }
    },
    scales: {
      x: { title: { display: true, text: 'Taux de pauvreté (%)', font: { size: 11, weight: '600' } } },
      y: { title: { display: true, text: 'Variation Pop. (/1000)', font: { size: 11, weight: '600' } } }
    }
  };

  // 4A. BAR EMPILÉ : % moins de 20 ans vs 60 ans et + par Région (pour la lisibilité)
  // Commentaire : Identifie les territoires vieillissants vs jeunes.
  // Un département avec 35% de +60 ans aura des besoins en logement très différents d'un département jeune.
  const barAgesData = useMemo(() => {
    const grouped = {};
    latestDataMetropole.forEach(d => {
      let r = d.nom_region;
      if (!r) return;
      if (!grouped[r]) grouped[r] = { m20: [], p60: [], cnt: 0 };
      if (!isNaN(Number(d.pct_moins_20ans)) && !isNaN(Number(d.pct_plus_60ans))) {
        grouped[r].m20.push(Number(d.pct_moins_20ans));
        grouped[r].p60.push(Number(d.pct_plus_60ans));
        grouped[r].cnt++;
      }
    });

    const regions = Object.keys(grouped).slice(0, 15);
    regions.sort();

    const m20Avg = regions.map(r => {
      const g = grouped[r];
      return g.cnt > 0 ? g.m20.reduce((a, b) => a + b, 0) / g.cnt : 0;
    });
    const p60Avg = regions.map(r => {
      const g = grouped[r];
      return g.cnt > 0 ? g.p60.reduce((a, b) => a + b, 0) / g.cnt : 0;
    });
    // Reste (20 à 60 ans) pour boucher la barre à 100%
    const midAvg = m20Avg.map((val, idx) => 100 - val - p60Avg[idx]);

    return {
      labels: regions.map(r => r.substring(0, 10) + (r.length > 10 ? '.' : '')),
      datasets: [
        { label: 'Moins de 20 ans (%)', data: m20Avg, backgroundColor: '#f472b6' }, // Pink-400
        { label: '20 à 59 ans (%)', data: midAvg, backgroundColor: '#cbd5e1' }, // Slate-300
        { label: '60 ans et + (%)', data: p60Avg, backgroundColor: '#3b82f6' } // Blue-500
      ]
    };
  }, [latestDataMetropole]);

  const barAgesOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } },
      tooltip: { mode: 'index', intersect: false }
    },
    responsive: true,
    scales: {
      x: { stacked: true },
      y: { stacked: true, max: 100 }
    }
  };

  // 4B. SCATTER : Variation de population × Taux de chômage (METROPOLE UNIQUEMENT)
  const scatterVariationChomageData = useMemo(() => {
    const points = latestDataMetropole
      .filter(d => !isNaN(Number(d.variation_population)) && !isNaN(Number(d.taux_chomage)))
      .map(d => ({
        x: Number(d.taux_chomage),
        y: Number(d.variation_population),
        code: d.code,
        nom: d.nom
      }));

    return {
      datasets: [{
        label: 'Départements (Métropole)',
        data: points,
        backgroundColor: '#a855f7', // Purple-500
        pointRadius: 4,
        pointHoverRadius: 7
      }]
    };
  }, [latestDataMetropole]);

  const scatterVariationChomageOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.raw.nom}: Chômage ${ctx.raw.x}% | Variation Pop. ${ctx.raw.y}`
        }
      }
    },
    scales: {
      x: { title: { display: true, text: 'Taux de chômage (%)', font: { size: 11, weight: '600' } } },
      y: { title: { display: true, text: 'Variation Population (/1000)', font: { size: 11, weight: '600' } } }
    }
  };

  return (
    <div className="flex w-full items-start bg-transparent min-h-screen">
      <SidebarPopulation 
        showDomNatMig={showDomNatMig} setShowDomNatMig={setShowDomNatMig} 
        sansGers={sansGers} setSansGers={setSansGers}
      />

      <div className="flex-1 ml-[240px] lg:ml-[22%] flex flex-col gap-8 p-6 lg:p-8 lg:pt-0">
        
        {/* ROW 1 : BUBBLE CHART FULL WIDTH */}
        <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
          <div className="absolute top-3 left-3 px-1 py-1 z-10 text-md font-semibold text-slate-700">
            <h2 className="text-lg font-bold text-slate-800 leading-tight">Chômage, Pauvreté et Parc Social</h2>
            <div className="text-xs font-normal text-slate-500 mt-0.5">Bulles = Part de logements sociaux. Corrélation entre précarité et hébergement social.</div>
          </div>
          <div className="w-full h-[80vh] min-h-[450px] p-6 pt-20">
            <Bubble data={bubbleData} options={bubbleOptions} />
          </div>
        </div>

        {/* ROW 2 : 25% EXPLICATION GAUCHE / 75% GRAPHIQUE DROITE */}
        <div className="w-full flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/4 flex flex-col justify-center px-2">
            <h4 className="text-xl font-extrabold text-slate-800 mb-3">Dynamique de population</h4>
            <p className="text-sm text-slate-600 mb-3 leading-relaxed">
              La variation de la population repose sur deux piliers : le solde naturel (naissances - décès) et le solde migratoire.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Quand le solde naturel est négatif mais le total positif, c'est la <strong>migration qui sauve la démographie</strong> locale d'un territoire qui, sinon, se viderait.
            </p>
          </div>
          <div className="w-full lg:w-3/4 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
             <h3 className="text-md font-bold text-slate-800 mb-1">Solde naturel vs Solde migratoire</h3>
             <p className="text-xs text-slate-500 mb-4">Contribution à l'évolution démographique par région.</p>
             <div className="h-[280px] w-full">
               <Bar data={barNatMigData} options={barNatMigOptions} />
             </div>
          </div>
        </div>

        {/* ROW 3 : 75% GRAPHIQUE GAUCHE / 25% EXPLICATION DROITE */}
        <div className="w-full flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-3/4 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
             <h3 className="text-md font-bold text-slate-800 mb-1">Pauvreté × Variation de population</h3>
             <p className="text-xs text-slate-500 mb-4">Mise en évidence de l'absence de règle universelle liant richesse et croissance démographique.</p>
             <div className="h-[280px] w-full">
               <Scatter data={scatterPauvreteVarData} options={scatterPauvreteVarOptions} />
             </div>
          </div>
          <div className="w-full lg:w-1/4 flex flex-col justify-center px-2">
            <h4 className="text-xl font-extrabold text-slate-800 mb-3">Croissance paradoxale</h4>
            <p className="text-sm text-slate-600 mb-3 leading-relaxed">
              Il est contre-intuitif d'imaginer des territoires pauvres attirer massivement. Pourtant, certains départements précaires croissent fortement.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Cette absence de corrélation montre que l'attractivité d'un territoire n'est pas systématiquement dictée par sa richesse économique locale moyenne.
            </p>
          </div>
        </div>

        {/* ROW 4 : 2 GRAPHIQUES 50/50 */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ligne 4 Gauche : Bar Empilé Age */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col">
            <h3 className="text-md font-bold text-slate-800 mb-1 leading-snug">Répartition : Jeunes vs Seniors</h3>
            <p className="text-xs text-slate-500 mb-4 line-clamp-1">Identifie les territoires vieillissants face aux régions d'avenir.</p>
            <div className="h-[280px] w-full mt-auto">
              <Bar data={barAgesData} options={barAgesOptions} />
            </div>
          </div>
          
          {/* Ligne 4 Droite : Scatter Variation x Chômage */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col">
            <h3 className="text-md font-bold text-slate-800 mb-1 leading-snug">Croissance et Chômage</h3>
            <p className="text-xs text-slate-500 mb-4 line-clamp-1">
              Variation de la population selon le taux de chômage.
            </p>
            <div className="h-[280px] w-full mt-auto">
              <Scatter data={scatterVariationChomageData} options={scatterVariationChomageOptions} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PopulationPage;
