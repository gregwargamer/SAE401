import useChart from "../hooks/useChart";

const ParcSocialPage = () => {
  const canvasRef = useChart((data) => {
    const years = [2021, 2022, 2023];

    const moyenneParAnnee = (year) => {
      const lignes = data.filter(
        (item) => Number(item.annee) === year && item.taux_energivores != null,
      );

      if (!lignes.length) return null;

      let total = 0;
      for (const ligne of lignes) {
        total += Number(ligne.taux_energivores);
      }

      return Number((total / lignes.length).toFixed(2));
    };

    const tauxParAnnee = years.map((year) => moyenneParAnnee(year));

    const debut = tauxParAnnee[0];
    const fin = tauxParAnnee[tauxParAnnee.length - 1];
    const variation = debut != null && fin != null ? Number((fin - debut).toFixed(2)) : null;
    const tendanceTxt =
      variation == null ? "" : variation <= 0 ? `Baisse ${Math.abs(variation)} pts` : `Hausse ${variation} pts`;

    return {
      type: "line",
      data: {
        labels: years.map(String),
        datasets: [
          {
            label: "Taux moyen de logements energivores (%)",
            data: tauxParAnnee,
            borderColor: "#dc2626",
            backgroundColor: "rgba(220,38,38,0.18)",
            tension: 0.25,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: `Evolution du taux de logements energivores (2021-2023)${tendanceTxt ? ` - ${tendanceTxt}` : ""}`,
          },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.raw}%`,
            },
          },
        },
        scales: {
          x: {
            title: { display: true, text: "Annee" },
          },
          y: {
            title: { display: true, text: "Logements energivores (%)" },
            ticks: {
              callback: (value) => `${value}%`,
            },
          },
        },
      },
    };
  });

  return (
    <section className="page">
      <h1>Parc social</h1>
      <canvas ref={canvasRef} style={{ maxWidth: "100%" }} />
    </section>
  );
};

export default ParcSocialPage;
