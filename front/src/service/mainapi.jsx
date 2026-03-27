const CACHE_KEY = "fulldb";
const GEO_CACHE_KEY = "geodata";
const STATIC_DATA_URL = "/data/static-data.json";
const STATIC_GEO_URL = "/data/static-geo.json";

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

    // Try to fetch the split files: data and geo. Fall back to single file if needed.
    let all = [];
    let geo = [];

    // fetch data (generatedAt + all)
    const dataResponse = await fetch(STATIC_DATA_URL, { cache: "no-store" });
    if (dataResponse.ok) {
        const dataPayload = await dataResponse.json();
        all = Array.isArray(dataPayload?.all) ? dataPayload.all : [];
    }

    // fetch geo (geo array)
    const geoResponse = await fetch(STATIC_GEO_URL, { cache: "no-store" });
    if (geoResponse.ok) {
        const geoPayload = await geoResponse.json();
        geo = Array.isArray(geoPayload?.geo) ? geoPayload.geo : [];
    }

    // If either fetch failed, attempt to fetch the original combined file as a fallback
    if ((!all.length || !geo.length) && dataResponse?.ok === false) {
        const fallback = await fetch("/data/static-db.json", { cache: "no-store" });
        if (fallback.ok) {
            const payload = await fallback.json();
            all = Array.isArray(payload?.all) ? payload.all : all;
            geo = Array.isArray(payload?.geo) ? payload.geo : geo;
        }
    }

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
