# SAE401 — Statistiques Départementales

Application web de visualisation de statistiques départementales françaises.

## Stack technique

- **Frontend** : React + Vite + Tailwind CSS + Chart.js — dossier `front/`
- **Données** : JSON statique servi depuis `front/public/data/fulldb.json` (plus d’API dédiée dans ce dépôt)

## Prérequis

Node.js — [nodejs.org](https://nodejs.org/en/download)

## Lancer le projet

```bash
cd front
npm install --legacy-peer-deps
npm run dev
```

Build de production :

```bash
cd front
npm run build
```

Les assets générés sont dans `front/dist/` ; le fichier `fulldb.json` est copié dans `dist/data/` au build.

## Données

Les fichiers de données brutes (CSV source, dump SQL) restent dans le dossier `data/` à titre d’archive. L’application utilise le bundle `front/public/data/fulldb.json` pour les écrans.

## Structure

```
SAE401/
├── data/          ← données brutes (CSV, SQL)
└── front/         ← application React + json statique
```
