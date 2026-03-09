import { useState, useEffect } from "react";
import { getAll } from "../../sercice/api";

export const TrucDeTri = () => {
    const [regions, setRegions] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState(null);

    //alors on commence par tout charger
    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await getAll();
                const regionsMap = new Map();
                data.forEach((item) => {
                    const regionCode = item.code_region;
                    const regionName = item.nom_region;
                    const deptCode = item.code_departement;
                    const deptName = item.nom_departement;

                    // ajoute region si pas encore vue
                    if (!regionsMap.has(regionCode)) {
                        regionsMap.set(regionCode, {
                            code: regionCode,
                            nom: regionName,
                            departements: new Map(),
                        });
                    }

                    // association departement region
                    const region = regionsMap.get(regionCode);
                    if (!region.departements.has(deptCode)) {
                        region.departements.set(deptCode, {
                            code: deptCode,
                            nom: deptName,
                        });
                    }
                });

                // tableau plus tri alphabetique dans leurs regions
                const regionsArray = Array.from(regionsMap.values()).map(
                    (region) => ({
                        ...region,
                        departements: Array.from(region.departements.values()).sort(
                            (a, b) => a.nom.localeCompare(b.nom)
                        ),
                    })
                );

                //mtn c le tour des regions
                regionsArray.sort((a, b) => a.nom.localeCompare(b.nom));

                setRegions(regionsArray);
            } catch {
                console.error("erreur chargement donnees");
            }
        };

        loadData();
    }, []);

    const handleRegionClick = (region) => {
        setSelectedRegion(region.code === selectedRegion ? null : region.code);
        setSelectedDepartement(null);
    };

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

                        {/* match departement a la region selectionne*/}
                        {selectedRegion === region.code && (
                            <ul>
                                {region.departements.map((dept) => (
                                    <li key={dept.code}>
                                        <button
                                            onClick={() =>
                                                handleDepartementClick(dept)
                                            }>
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
