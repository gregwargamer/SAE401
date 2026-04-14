import { getCache, loadStaticBundle } from "./mainapi";

const getAll = async () => {
    const cached = getCache();
    if (cached) return cached;
    const { all } = await loadStaticBundle();
    return all;
};

const getByDepartement = (codeDept) => {
    const data = getCache();
    if (!data) return [];
    return data
    .filter(item => item.code_departement === codeDept)
    .sort((a, b) => b.annee - a.annee);
};

const getByRegion = (codeRegion) => {
    const data = getCache();
    if (!data) return [];
    return data
    .filter(item => item.code_region === codeRegion)
    .sort((a, b) => b.annee - a.annee);
};

export { getAll, getByDepartement, getByRegion };
