# SAE401 — Statistiques Départementales

Application web de visualisation de statistiques départementales françaises.

## Stack technique

- **Backend** : Symfony (API REST) — dossier `back/`
- **Frontend** : React + Vite + Tailwind CSS + Chart.js — dossier `front/`
- **Base de données** : MySQL (hébergée sur AlwaysData)

## Lancer le projet

### Backend (Symfony)

```bash
cd back
composer install
symfony server:start
```

### Frontend (React)

```bash
cd front
npm install
npm run dev
```

## Données

Les fichiers de données brutes (CSV source, dump SQL) sont dans le dossier `data/`.

Pour importer les statistiques en base :

```bash
cd back
php bin/console app:import:stats-departement ../data/logements-et-logements-sociaux-dans-les-departements.csv
```

## Structure

```
SAE401/
├── data/          ← données brutes (CSV, SQL)
├── back/          ← API Symfony
└── front/         ← application React
```
