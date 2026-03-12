import { useState, useEffect } from "react";
import { getAll } from "../../service/regiondepartement";

const Sidebar = ({ selectedRegion, setSelectedRegion, setSelectedDepartement }) => {
    const [regions, setRegions] = useState([]);

    // alors on commence par tout charger
    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await getAll();
                const regionsMap = new Map();
                data.forEach((item) => {
                    // ajoute region si pas encore vue
                    if (!regionsMap.has(item.code_region)) { regionsMap.set(item.code_region, { code: item.code_region, nom: item.nom_region, departements: new Map() }); }
                    const region = regionsMap.get(item.code_region);
                    // association departement region
                    if (!region.departements.has(item.code_departement)) { region.departements.set(item.code_departement, { code: item.code_departement, nom: item.nom_departement }); }
                });

                // tableau plus tri alphabetique dans leurs regions
                const regionsArray = Array.from(regionsMap.values()).map((region) => ({
                    ...region,
                    departements: Array.from(region.departements.values()).sort(
                        (a, b) => a.nom.localeCompare(b.nom)
                    ),
                })).sort((a, b) => a.nom.localeCompare(b.nom));
                // mtn c le tour des regions
                setRegions(regionsArray);
            } catch {
                console.error("erreur chargement donnees");
            }
        };
        loadData();
    }, []);

    const handleRegionClick = (region) => { setSelectedRegion(region.code === selectedRegion ? null : region.code); setSelectedDepartement(null); };
    const handleDepartementClick = (dept) => { setSelectedDepartement(dept.code); setSelectedRegion(null); };

    // enfin de l'affichage apres 6 mois de logique
    return (
        <nav>
            <h2>regions</h2>
            <ul>
                {regions.map((region) => (
                    <li key={region.code}>
                        <button onClick={() => handleRegionClick(region)}>
                            {region.nom}
                        </button>
                        {/* match departement a la region selectionne */}
                        {selectedRegion === region.code && (
                            <ul>
                                {region.departements.map((dept) => (
                                    <li key={dept.code}>
                                        <button onClick={() => handleDepartementClick(dept)}>
                                            {dept.nom} ({dept.code})
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    );
};
export { Sidebar };