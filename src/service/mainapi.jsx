const STATIC_DB_URL = "/data/fulldb.json";

const CACHE_KEY = "fulldb";
const GEO_CACHE_KEY = "geodata";

let bundleInflight = null;

const getCache = () => {
    const cached = sessionStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
};

// charge all+geo une seule fois (une seule requete http meme en parallele)
const loadStaticBundle = async () => {
    const cachedAll = sessionStorage.getItem(CACHE_KEY);
    const cachedGeo = sessionStorage.getItem(GEO_CACHE_KEY);
    if (cachedAll && cachedGeo) {
        return { all: JSON.parse(cachedAll), geo: JSON.parse(cachedGeo) };
    }
    if (!bundleInflight) {
        bundleInflight = (async () => {
            const res = await fetch(STATIC_DB_URL);
            if (!res.ok) throw new Error(`fulldb: ${res.status}`);
            const bundle = await res.json();
            const all = bundle.all || [];
            const geo = bundle.geo || [];
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(all));
            sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(geo));
            return { all, geo };
        })().finally(() => { bundleInflight = null; });
    }
    return bundleInflight;
};

const fetchGeoData = async () => {
    const cached = sessionStorage.getItem(GEO_CACHE_KEY);
    if (cached) return JSON.parse(cached);
    const { geo } = await loadStaticBundle();
    return geo;
};

export { getCache, fetchGeoData, loadStaticBundle, STATIC_DB_URL };
