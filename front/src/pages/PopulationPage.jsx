import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../service/mainapi";
import {
  Chart as ChartJS, CategoryScale, LinearScale, LogarithmicScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, RadialLinearScale, Filler
} from "chart.js";
import { Bar, Bubble, Radar } from "react-chartjs-2";
import SidebarPopulation from "../components/SidebarPopulation";

// Register custom charts
ChartJS.register(CategoryScale, LinearScale, LogarithmicScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, RadialLinearScale, Filler);

const PopulationPage = () => {
  const [rawData, setRawData] = useState([]);
  const [sansGers, setSansGers] = useState(false);
  const [sortJeunes, setSortJeunes] = useState('asc');
  const [sortPauvrete, setSortPauvrete] = useState('desc');
  const [selectedRadarDept, setSelectedRadarDept] = useState('01');

  useEffect(() => {
    const load = async () => {
      const stats = await apiClient.get("/all");
      setRawData(stats.data || []);
    };
    load();
  }, []);

  const isMetropole = (code) => {
    if (!code) return false;
    const strCode = String(code);
    return !strCode.startsWith("97") && !strCode.startsWith("98");
  };

  const latestDataAll = useMemo(() => {
    if (!rawData.length) return [];
    const anneeMax = Math.max(...rawData.map(s => Number(s.annee)).filter(n => !isNaN(n)));
    return rawData
      .filter(s => Number(s.annee) === anneeMax)
      .map(d => ({ ...d, nom: d.nom_departement || d.nom, code: d.code_departement || d.code }));
  }, [rawData]);

  const latestDataMetropole = useMemo(() => {
    return latestDataAll.filter(d => isMetropole(d.code));
  }, [latestDataAll]);

  // 1. BUBBLE CHART
  const bubbleData = useMemo(() => {
    const points = latestDataMetropole
      .filter(d => !isNaN(Number(d.taux_chomage)) && !isNaN(Number(d.taux_pauvrete)) && !isNaN(Number(d.taux_logements_sociaux)))
      .filter(d => !sansGers || String(d.code) !== "32")
      .map(d => ({
        x: Number(d.taux_chomage),
        y: Number(d.taux_pauvrete),
        r: Number(d.taux_logements_sociaux) / 1.2,
        code: d.code,
        nom: d.nom,
        realR: Number(d.taux_logements_sociaux)
      }));

    return {
      datasets: [{
        label: 'Départements',
        data: points,
        backgroundColor: 'rgba(56, 189, 248, 0.6)',
        borderColor: '#0284c7',
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
    }
  };

  // 2. BAR GROUPÉ : Solde naturel vs migratoire (sans DOM)
  const barNatMigData = useMemo(() => {
    const grouped = {};
    latestDataMetropole.forEach(d => {
      let r = d.nom_region;
      if (!r) return;
      
      if (!grouped[r]) grouped[r] = { nat: [], mig: [], cnt: 0 };
      if (!isNaN(Number(d.contribution_solde_naturel)) && !isNaN(Number(d.contribution_solde_migratoire))) {
        grouped[r].nat.push(Number(d.contribution_solde_naturel));
        grouped[r].mig.push(Number(d.contribution_solde_migratoire));
        grouped[r].cnt++;
      }
    });

    const regionsData = Object.keys(grouped).map(r => {
      const g = grouped[r];
      const natAvg = g.cnt > 0 ? g.nat.reduce((a, b) => a + b, 0) / g.cnt : 0;
      const migAvg = g.cnt > 0 ? g.mig.reduce((a, b) => a + b, 0) / g.cnt : 0;
      return { r, natAvg, migAvg, total: natAvg + migAvg };
    });

    // Score du plus haut au plus bas total
    regionsData.sort((a, b) => {
      return b.total - a.total;
    });

    const natAvgArr = regionsData.map(d => d.natAvg);
    const migAvgArr = regionsData.map(d => d.migAvg);

    return {
      labels: regionsData.map(d => d.r.substring(0, 10) + (d.r.length > 10 ? '.' : '')),
      datasets: [
        {
          label: 'Solde Naturel',
          data: natAvgArr,
          backgroundColor: natAvgArr.map(val => val >= 0 ? '#22c55e' : '#f97316'), 
        },
        {
          label: 'Solde Migratoire',
          data: migAvgArr,
          backgroundColor: '#3b82f6', 
          borderColor: natAvgArr.map((nat, i) => (nat < 0 && (nat + migAvgArr[i]) > 0) ? '#bef264' : 'transparent'),
          borderWidth: natAvgArr.map((nat, i) => (nat < 0 && (nat + migAvgArr[i]) > 0) ? 3 : 0),
        },
        {
          type: 'line',
          label: 'Ligne d\'équilibre (0)',
          data: regionsData.map(() => 0),
          borderColor: '#1e293b',
          borderWidth: 2,
          pointRadius: 0,
          fill: false
        }
      ]
    };
  }, [latestDataMetropole]);

  const natMigPlugin = {
    id: 'scoreNatMig',
    afterDatasetsDraw(chart) {
      const { ctx, data, scales: { x, y } } = chart;
      if(!data.datasets[1]) return;
      ctx.save();
      
      const natSet = data.datasets[0].data;
      const migSet = data.datasets[1].data;
      const meta = chart.getDatasetMeta(1);
      
      meta.data.forEach((bar, index) => {
        const total = natSet[index] + migSet[index];
        const displayScore = total > 0 ? `+${total.toFixed(1)}` : total.toFixed(1);
        
        ctx.fillStyle = (natSet[index] < 0 && total > 0) ? '#65a30d' : '#475569';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        
        const y0 = y.getPixelForValue(0);
        const yNat = y.getPixelForValue(natSet[index]);
        const yMig = y.getPixelForValue(migSet[index]);

        if (total >= 0) {
          ctx.textBaseline = 'bottom';
          let yPos = Math.min(yNat, yMig);
          if (yPos > y0) yPos = y0;
          ctx.fillText(displayScore, x.getPixelForTick(index), yPos - 5);
        } else {
          ctx.textBaseline = 'top';
          let yPos = Math.max(yNat, yMig);
          if (yPos < y0) yPos = y0;
          ctx.fillText(displayScore, x.getPixelForTick(index), yPos + 5);
        }
      });
      ctx.restore();
    }
  };

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

  // 3. BAR + LINE : Pauvreté et Densité
  const barPauvreteDensiteData = useMemo(() => {
    let deps = [...latestDataMetropole]
      .filter(d => !isNaN(Number(d.taux_pauvrete)) && !isNaN(Number(d.densite)))
      .sort((a,b) => {
        if (sortPauvrete === 'asc') return Number(a.taux_pauvrete) - Number(b.taux_pauvrete);
        return Number(b.taux_pauvrete) - Number(a.taux_pauvrete);
      })
      .slice(0, 30);

    return {
      labels: deps.map(d => d.nom.substring(0, 10)),
      datasets: [
        {
          type: 'line',
          label: 'Densité (hab/km²)',
          data: deps.map(d => Number(d.densite)),
          borderColor: '#1e293b',
          borderWidth: 2,
          pointBackgroundColor: '#1e293b',
          pointRadius: 3,
          yAxisID: 'y1'
        },
        {
          type: 'bar',
          label: 'Taux de pauvreté (%)',
          data: deps.map(d => Number(d.taux_pauvrete)),
          backgroundColor: '#fb923c',
          borderRadius: 2,
          yAxisID: 'y'
        }
      ]
    };
  }, [latestDataMetropole, sortPauvrete]);

  const barPauvreteDensiteOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 10 } } },
    scales: {
      y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Pauvreté (%)' } },
      y1: { type: 'logarithmic', display: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Densité (log)' }, ticks: { callback: val => [10, 100, 1000, 10000].includes(val) ? val : '' } }
    }
  };

  // 4A. BAR EMPILÉ : Jeunes vs Seniors
  const barAgesData = useMemo(() => {
    let deps = latestDataMetropole
      .filter(d => !isNaN(Number(d.pct_moins_20ans)) && !isNaN(Number(d.pct_plus_60ans)))
      .map(d => ({
        nom: d.nom,
        m20: Number(d.pct_moins_20ans),
        p60: Number(d.pct_plus_60ans)
      }));

    if (sortJeunes === 'asc') {
      deps.sort((a,b) => b.p60 - a.p60); 
    } else {
      deps.sort((a,b) => b.m20 - a.m20); 
    }

    const sliced = deps.slice(0, 15);

    return {
      labels: sliced.map(d => d.nom.substring(0, 10)),
      datasets: [
        { label: '60 ans et +', data: sliced.map(d=>d.p60), backgroundColor: '#3b82f6' },
        { label: 'Moins 20 ans', data: sliced.map(d=>d.m20), backgroundColor: '#f472b6' }
      ]
    };
  }, [latestDataMetropole, sortJeunes]);

  const barAgesOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } }, tooltip: { mode: 'index', intersect: false } },
    responsive: true,
    scales: { x: { stacked: true }, y: { stacked: true } }
  };

  // 4B. RADAR : Profil socio-économique vs Moyenne Nationale
  const radarSocioEcoData = useMemo(() => {
    const calcAvg = (key) => latestDataAll.reduce((sum, d) => sum + (Number(d[key]) || 0), 0) / latestDataAll.filter(d => !isNaN(Number(d[key]))).length;
    
    const natChomage = calcAvg('taux_chomage');
    const natPauvrete = calcAvg('taux_pauvrete');
    const natJeunes = calcAvg('pct_moins_20ans');
    const natSeniors = calcAvg('pct_plus_60ans');
    const natMigratoire = calcAvg('contribution_solde_migratoire');
    
    const target = latestDataAll.find(d => String(d.code) === String(selectedRadarDept)) || latestDataAll[0];
    
    // Pour éviter une division par zéro si la moyenne est très proche de 0
    const index = (val, nat) => nat ? (val / nat) * 100 : 100;

    return {
      labels: [
        'Chômage (Économie)', 
        'Pauvreté (Social)', 
        'Jeunesse (Démographie - Jeunes)', 
        'Seniors (Démographie - Vieux)', 
        'Attractivité (Solde Migratoire)'
      ],
      datasets: [
        {
          label: `Moyenne Nationale (Base 100)`,
          data: [100, 100, 100, 100, 100],
          backgroundColor: 'rgba(148, 163, 184, 0.2)',
          borderColor: '#94a3b8',
          pointBackgroundColor: '#94a3b8',
          borderWidth: 2,
        },
        {
          label: target ? target.nom : 'Dép.',
          data: target ? [
            index(Number(target.taux_chomage) || 0, natChomage),
            index(Number(target.taux_pauvrete) || 0, natPauvrete),
            index(Number(target.pct_moins_20ans) || 0, natJeunes),
            index(Number(target.pct_plus_60ans) || 0, natSeniors),
            index(Number(target.contribution_solde_migratoire) || 0, natMigratoire)
          ] : [0,0,0,0,0],
          backgroundColor: 'rgba(59, 130, 246, 0.4)',
          borderColor: '#3b82f6',
          pointBackgroundColor: '#2563eb',
          borderWidth: 2,
        }
      ]
    };
  }, [latestDataAll, selectedRadarDept]);

  const radarOptions = {
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: '#e2e8f0' },
        grid: { color: '#e2e8f0' },
        pointLabels: { font: { size: 11, weight: '600' }, color: '#475569' },
        suggestedMin: 0,
        ticks: { display: false } 
      }
    },
    plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } }
  };

  return (
    <div className="flex w-full items-start bg-transparent min-h-screen flex-col xl:flex-row">
      <SidebarPopulation 
        sansGers={sansGers} setSansGers={setSansGers}
        sortJeunes={sortJeunes} setSortJeunes={setSortJeunes}
        sortPauvrete={sortPauvrete} setSortPauvrete={setSortPauvrete}
        selectedRadarDept={selectedRadarDept} setSelectedRadarDept={setSelectedRadarDept}
        depsList={latestDataAll.map(d => ({code: d.code, nom: d.nom})).sort((a,b) => a.nom.localeCompare(b.nom))}
      />

      <div className="flex-1 flex flex-col gap-8 xl:p-8 xl:pt-0 pt-[20px] p-4 xl:ml-[22%] ml-0">
        
        {/* ROW 1 : BUBBLE CHART */}
        <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
          <div className="absolute top-3 left-3 px-1 py-1 z-10 text-md font-semibold text-slate-700">
            <h2 className="text-lg font-bold text-slate-800 leading-tight">Chômage, Pauvreté et Parc Social</h2>
            <div className="text-xs font-normal text-slate-500 mt-0.5">Bulles = Part de logements sociaux. Corrélation entre précarité et hébergement social.</div>
          </div>
          <div className="w-full h-[80vh] min-h-[450px] p-6 pt-20">
            <Bubble data={bubbleData} options={bubbleOptions} />
          </div>
        </div>

        {/* ROW 2 : DYNAMIQUE */}
        <div className="w-full flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/4 flex flex-col justify-center px-2">
            <h4 className="text-xl font-extrabold text-slate-800 mb-3">Dynamique de population</h4>
            <p className="text-sm text-slate-600 mb-3 leading-relaxed">
              La variation repose sur le solde naturel et migratoire.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Quand le solde naturel est négatif mais le total positif, c'est la <strong>migration qui sauve la démographie</strong> locale.
            </p>
          </div>
          <div className="w-full lg:w-3/4 bg-white rounded-xl shadow-sm border border-slate-200 p-5 relative">
             <div className="flex justify-between items-start mb-1 flex-wrap">
               <h3 className="text-md font-bold text-slate-800">Solde naturel vs Solde migratoire</h3>
               <div className="flex items-center gap-2 text-[10px] bg-slate-50 px-2 py-1 rounded border border-slate-200">
                 <div className="w-3 h-3 rounded-full border-[2px] border-[#bef264] bg-[#3b82f6]"></div>
                 <span className="font-semibold text-slate-600">"Sauvé" par la migration</span>
               </div>
             </div>
             <p className="text-xs text-slate-500 mb-4">Contribution à l'évolution démographique par région.</p>
             <div className="h-[280px] w-full">
               <Bar data={barNatMigData} options={barNatMigOptions} plugins={[natMigPlugin]} />
             </div>
          </div>
        </div>

        {/* ROW 3 : PAUVRETE ET DENSITE */}
        <div className="w-full flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-3/4 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
             <h3 className="text-md font-bold text-slate-800 mb-1">Pauvreté et Densité</h3>
             <p className="text-xs text-slate-500 mb-4">L'intuition "Pauvre = peu dense (rural)" n'est pas toujours vraie.</p>
             <div className="h-[280px] w-full">
               <Bar data={barPauvreteDensiteData} options={barPauvreteDensiteOptions} />
             </div>
          </div>
          <div className="w-full lg:w-1/4 flex flex-col justify-center px-2">
            <h4 className="text-xl font-extrabold text-slate-800 mb-3">La fracture territoriale</h4>
            <p className="text-sm text-slate-600 mb-3 leading-relaxed">
              De forts pics de densité dans les zones très touchées par la précarité soulignent l'existence d'une pauvreté urbaine forte.
            </p>
          </div>
        </div>

        {/* ROW 4 : 50/50 */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col">
            <h3 className="text-md font-bold text-slate-800 mb-1 leading-snug">Répartition : Jeunes vs Seniors</h3>
            <p className="text-xs text-slate-500 mb-2">Comparons la part des moins de 20 ans face à celle des plus de 60 ans.</p>
            <div className="h-[280px] w-full mt-auto">
              <Bar data={barAgesData} options={barAgesOptions} />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col relative z-20">
            <h3 className="text-md font-bold text-slate-800 mb-1 leading-snug">Profil socio-économique</h3>
            <p className="text-xs text-slate-500 mb-2">Moyenne Nationale = 100</p>
            <div className="h-[280px] w-full mt-auto">
              <Radar data={radarSocioEcoData} options={radarOptions} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PopulationPage;
