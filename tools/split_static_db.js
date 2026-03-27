const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "front", "public", "data", "static-db.json");
const OUT_DATA = path.join(ROOT, "front", "public", "data", "static-data.json");
const OUT_GEO = path.join(ROOT, "front", "public", "data", "static-geo.json");

function run() {
  if (!fs.existsSync(SRC)) {
    console.error("Source file not found:", SRC);
    process.exit(2);
  }

  const raw = fs.readFileSync(SRC, "utf8");
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse JSON:", e.message);
    process.exit(3);
  }

  const data = {
    generatedAt: payload.generatedAt || new Date().toISOString(),
    all: Array.isArray(payload.all) ? payload.all : [],
  };

  const geo = {
    geo: Array.isArray(payload.geo) ? payload.geo : [],
  };

  fs.writeFileSync(OUT_DATA, JSON.stringify(data, null, 2), "utf8");
  fs.writeFileSync(OUT_GEO, JSON.stringify(geo, null, 2), "utf8");

  console.log("Wrote:", OUT_DATA);
  console.log("Wrote:", OUT_GEO);
}

run();
