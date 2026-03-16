import { useEffect, useRef } from "react";
import { getAll } from "../service/regiondepartement";

// Hook réutilisable pour tous les graphiques Chart.js
// - buildConfig(data) : fonction qui reçoit les données API et retourne la config Chart.js
// - deps : tableau de dépendances (optionnel) — si une valeur change, le graphique se recrée
const useChart = (buildConfig, deps = []) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    let chart = null;
    let cancelled = false;

    getAll().then((data) => {
      // Si la page a été quittée entre temps, on ne fait rien
      if (cancelled || !window.Chart || !canvasRef.current) return;
      chart = new window.Chart(canvasRef.current, buildConfig(data));
    });

    // Nettoyage : détruit le graphique quand on quitte la page ou quand deps change
    return () => {
      cancelled = true;
      if (chart) chart.destroy();
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return canvasRef;
};

export default useChart;
