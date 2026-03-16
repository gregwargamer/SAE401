import axios from "axios";

const apiClient = axios.create({
    baseURL: "/api",
    headers: { "Content-Type": "application/json" },
});

const CACHE_KEY = "fulldb";

const getCache = () => {
    const cached = sessionStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
};

const sendToCache = (data) => {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
};

// export const endpoints = {
//     demographie: "/statistiques/demographie",
//     economie: "/statistiques/economie",
//     logement: "/statistiques/logement",
//     parcSocial: "/statistiques/parc-social",
//     global: "/statistiques/global",
// };

export { apiClient, getCache, sendToCache };
