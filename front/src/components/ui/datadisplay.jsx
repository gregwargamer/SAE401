import { getByDepartement, getByRegion } from "../../service/regiondepartement";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, LineController, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, LineController, Tooltip, Legend);

const COLORS = ["red", "blue", "green", "yellow", "purple", "orange", "pink"];

const DataDisplay = ({ selectedRegion, selectedDepartement }) => {
    const data = selectedDepartement ? getByDepartement(selectedDepartement) : getByRegion(selectedRegion);
    if (!data || data.length === 0) return <h1>Selectionnez une region ou un departement</h1>;
    if (selectedDepartement) {
        const chartData = {
            labels: data.map(i => i.annee),
            datasets: [{
                label: "Nombre d'habitants",
                data: data.map(i => i.nb_habitants),
                borderColor: COLORS[0],
            }],
        };
        return (
            <>
                <h2>Département : {data[0]?.nom_departement}</h2>
                <Line key={selectedDepartement} data={chartData} />
            </>
        );
    }

    // met sur 100 parce que sinon cest plat
    const depts = [...new Set(data.map(i => i.code_departement))];
    const annees = [...new Set(data.map(i => i.annee))].sort();

    // calcul stats par departement : evolution depuis premiere annee
    const statsByDept = depts.map((code, idx) => {
        const deptData = data.filter(i => i.code_departement === code).sort((a, b) => a.annee - b.annee);
        const base = deptData[0].nb_habitants;
        const last = deptData[deptData.length - 1].nb_habitants;
        const diff = last - base;
        const diffdiv = base ? (diff / base) * 100 : 0; // jsp si il ya des 0 mais au moins ca fera pas de trucs trpo bizarre 
        return { code, name: deptData[0].nom_departement || code, deptData, base, last, diff, diffdiv, color: COLORS[idx % COLORS.length] };
    });

    // met sur 100 parce que sinon cest plat
    const chartData = {
        labels: annees,
        datasets: statsByDept.map((dept) => ({
            label: dept.name,
            data: annees.map(annee => {
                const value = dept.deptData.find(i => i.annee === annee)?.nb_habitants;
                if (!value || !dept.base) return null;
                return Number(((value / dept.base) * 100).toFixed(2));
            }),
            borderColor: dept.color,
        })),
    };

    const options = {
        plugins: { legend: { position: "top" } },
        scales: { y: { title: { display: true, text: "base 100 (premiere annee = 100)" } } },
    };

    return (
        <>
            <h2>Région : {data[0]?.nom_region}</h2>
            <Line key={selectedRegion} data={chartData} options={options} />
            {/* classement departements par evo par rapprot a ans 0 et ans max */}
            <div>
                {statsByDept.sort((a, b) => b.diffdiv - a.diffdiv).map((dept) => (
                    <p key={dept.code} style={{ color: dept.color, margin: "4px 0" }}>
                        {dept.name} : {dept.diff > 0 ? "+" : ""}{dept.diff.toLocaleString("fr-FR")} habitants ({dept.diffdiv > 0 ? "+" : ""}{dept.diffdiv.toFixed(2)}%)
                    </p>
                ))}
            </div>
        </>
    );
};
export { DataDisplay };