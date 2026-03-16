import { useState } from "react";
import useChart from "../hooks/useChart";

const SRU = 25;

const HomePage = () => {
  const [ordre, setOrdre] = useState("desc");

  const canvasRef = useChart((data) => {
    const anneeMax = Math.max(...data.map((item) => Number(item.annee)));

    const lignes = data.filter(
      (item) => Number(item.annee) === anneeMax && item.taux_logements_sociaux != null,
    );

    const departements = lignes.map((item) => ({
      nom: item.nom_departement,
      val: Number(item.taux_logements_sociaux),
    }));

    departements.sort((a, b) => {
      if (ordre === "desc") return b.val - a.val;
      return a.val - b.val;
    });

    const top20 = departements.slice(0, 20);

    return {
      type: "bar",
      data: {
        labels: top20.map((d) => d.nom),
        datasets: [{
          label: "Taux de logements sociaux (%)",
          data: top20.map((d) => d.val),
          backgroundColor: top20.map((d) => d.val >= SRU ? "#16a34a" : "#c1ff06"),
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: true, text: `Top 20 departements - Taux de logements sociaux (${anneeMax})` },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.raw}% - ${ctx.raw >= SRU ? "Seuil SRU atteint" : "Sous le seuil SRU (25%)"}`,
            },
          },
        },
        scales: { x: { title: { display: true, text: "%" }, max: 50 } },
      },
    };
  }, [ordre]);

  return (
    <section className="page">
      <h1>Accueil</h1>
      <div className="mb-3 flex flex-wrap items-center gap-4">
        <p className="m-0 text-slate-600">
          <span className="font-bold text-green-600">■</span>{" ≥ 25% (seuil SRU atteint) "}
          <span className="font-bold text-yellow-700">■</span>{" < 25% (sous le seuil légal)"}
        </p>
        <button
          onClick={() => setOrdre(ordre === "desc" ? "asc" : "desc")}
          className="cursor-pointer rounded-full border border-slate-300 bg-stone-100 px-4 py-1.5 font-semibold transition hover:bg-stone-200"
        >
          {ordre === "desc" ? "↓ Décroissant" : "↑ Croissant"}
        </button>
      </div>
      <canvas ref={canvasRef} className="max-w-full" />
    </section>
  );
};

export default HomePage;
