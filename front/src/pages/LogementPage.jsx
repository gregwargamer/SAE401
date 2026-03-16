import useChart from "../hooks/useChart";

const LogementPage = () => {
  const canvasRef = useChart((data) => {
    const anneeMax = Math.max(...data.map((item) => Number(item.annee)));

    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

    const lignes = data.filter(
      (item) =>
        Number(item.annee) === anneeMax &&
        item.moyenne_construction_neuve != null &&
        item.taux_logements_vacants != null &&
        item.taux_logements_sociaux != null,
    );

    const bulles = lignes.map((item) => ({
      x: Number(item.moyenne_construction_neuve),
      y: Number(item.taux_logements_vacants),
      r: clamp(Number(item.taux_logements_sociaux) * 0.5, 4, 20),
      label: item.nom_departement,
      tauxSociaux: Number(item.taux_logements_sociaux),
    }));

    return {
      type: "bubble",
      data: {
        datasets: [{
          label: "Département",
          data: bulles,
          backgroundColor: "rgba(220,38,38,0.45)",
          borderColor: "#dc2626",
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: true, text: `Construction neuve × Taux de logements vacants (${anneeMax})` },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                `${ctx.raw.label} — Construction: ${ctx.raw.x} log./an, Vacance: ${ctx.raw.y}%, Sociaux: ${ctx.raw.tauxSociaux}%`,
            },
          },
        },
        scales: {
          x: { title: { display: true, text: "Construction neuve moyenne (logements/an)" } },
          y: { title: { display: true, text: "Taux de logements vacants (%)" } },
        },
      },
    };
  });

  return (
    <section className="page">
      <h1>Stat logement</h1>
      <canvas ref={canvasRef} style={{ maxWidth: "100%" }} />
    </section>
  );
};

export default LogementPage;
