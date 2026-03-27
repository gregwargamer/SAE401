const CACHE_KEY = "fulldb";
const GEO_CACHE_KEY = "geodata";
const STATIC_DATA_URL = "/data/static-db.json";

const safeParse = (value) => {
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
};

const getCache = () => {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? safeParse(cached) : null;
};

const sendToCache = (data) => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data || []));
};

const getGeoCache = () => {
    const cached = localStorage.getItem(GEO_CACHE_KEY);
    return cached ? safeParse(cached) : null;
};

const sendGeoToCache = (data) => {
    localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(data || []));
};

const initializeLocalData = async () => {
    const allCached = getCache();
    const geoCached = getGeoCache();
    if (Array.isArray(allCached) && allCached.length && Array.isArray(geoCached) && geoCached.length) {
        return { all: allCached, geo: geoCached };
    }

    const response = await fetch(STATIC_DATA_URL, { cache: "no-store" });
    if (!response.ok) {
        throw new Error("Impossible de charger les donnees statiques");
    }

    const payload = await response.json();
    const all = Array.isArray(payload?.all) ? payload.all : [];
    const geo = Array.isArray(payload?.geo) ? payload.geo : [];

    sendToCache(all);
    sendGeoToCache(geo);
    return { all, geo };
};

const fetchGeoData = async () => {
    const cached = getGeoCache();
    if (Array.isArray(cached) && cached.length) return cached;
    const loaded = await initializeLocalData();
    return loaded.geo;
};

const apiClient = {
    get: async (path) => {
        const loaded = await initializeLocalData();
        if (path === "/all") return { data: loaded.all };
        if (path === "/geo") return { data: loaded.geo };
        throw new Error(`Endpoint non supporte en mode statique: ${path}`);
    },
};

export { apiClient, getCache, sendToCache, fetchGeoData, initializeLocalData };
