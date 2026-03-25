import axios from "axios";

const apiClient = axios.create({
    baseURL: "/api",
    headers: { "Content-Type": "application/json" },
});

const CACHE_KEY = "fulldb";
const GEO_CACHE_KEY = "geodata";

const getCache = () => {
    const cached = sessionStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
};

const sendToCache = (data) => {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
};


const fetchGeoData = async () => {
    const cached = sessionStorage.getItem(GEO_CACHE_KEY);
    if (cached) return JSON.parse(cached);
    const response = await apiClient.get("/geo");
    const data = response.data || [];
    sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(data));
    return data;
};

// export const endpoints = {
//     demographie: "/statistiques/demographie",
//     economie: "/statistiques/economie",
//     logement: "/statistiques/logement",
//     parcSocial: "/statistiques/parc-social",
//     global: "/statistiques/global",
// };

export { apiClient, getCache, sendToCache, fetchGeoData };
