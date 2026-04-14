# SAE401 — Statistiques Départementales

Application web de visualisation de statistiques départementales françaises.

## Stack technique

- **Frontend** : React + Vite + Tailwind CSS + Chart.js (racine du dépôt)
- **Données** : JSON statique dans `public/data/fulldb.json`

## Prérequis

Node.js — [nodejs.org](https://nodejs.org/en/download)

## Développement local

```bash
npm install --legacy-peer-deps
npm run dev
```

Build de production :

```bash
npm run build
```

Sortie dans `dist/` ; `fulldb.json` est copié dans `dist/data/` au build.

## Docker (Coolify / production)

Image nginx servant le build statique :

```bash
docker build -t sae401 .
docker run -p 8080:80 sae401
```

Coolify détecte le `Dockerfile` à la racine ; build context = dépôt, `package.json` à la racine pour un install rapide.

## Données

Archive CSV/SQL dans `data/`. L’app lit `public/data/fulldb.json`.

## Structure

```
SAE401/
├── data/           ← données brutes (CSV, SQL)
├── docker/         ← config nginx pour l’image
├── public/         ← assets statiques + fulldb.json
└── src/            ← application React
```
