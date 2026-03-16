import useChart from "../hooks/useChart";

const PopulationPage = () => {
  const canvasRef = useChart((data) => {
    const anneeMax = Math.max(...data.map((item) => Number(item.annee)));

    const clampMin = (value, min) => (value < min ? min : value);

    const lignes = data.filter(
      (item) =>
        Number(item.annee) === anneeMax &&
        item.taux_chomage != null &&
        item.taux_pauvrete != null &&
        item.taux_logements_sociaux != null,
    );

    const bulles = lignes.map((item) => ({
      x: Number(item.taux_chomage),
      y: Number(item.taux_pauvrete),
      r: clampMin(Number(item.taux_logements_sociaux) * 0.9, 4),
      label: item.nom_departement,
    }));

    return {
      type: "bubble",
      data: {
        datasets: [{
          label: "Département",
          data: bulles,
          backgroundColor: "rgba(37,99,235,0.45)",
          borderColor: "#2563eb",
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: true, text: `Chômage × Pauvreté — taille = taux de logements sociaux (${anneeMax})` },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.raw.label} — Chômage: ${ctx.raw.x}%, Pauvreté: ${ctx.raw.y}%`,
            },
          },
        },
        scales: {
          x: { title: { display: true, text: "Taux de chômage (%)" } },
          y: { title: { display: true, text: "Taux de pauvreté (%)" } },
        },
      },
    };
  });

  return (
    <section className="page">
      <h1>Population</h1>
      <canvas ref={canvasRef} style={{ maxWidth: "100%" }} />
    </section>
  );
};

export default PopulationPage;
