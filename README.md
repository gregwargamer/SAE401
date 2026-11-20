# SAE401 — Statistiques Départementales

Application web de visualisation de statistiques départementales françaises.

## Stack technique

- **Backend** : Symfony (API REST) — dossier `back/`
- **Frontend** : React + Vite + Tailwind CSS + Chart.js — dossier `front/`
- **Base de données** : MySQL (hébergée sur AlwaysData)

## Prérequis pour lancer le projet

Symfony CLI doit être installé — [symfony.com/doc/current/setup.html](https://symfony.com/doc/current/setup.html)

Node.js doit être installé — [nodejs.org](https://nodejs.org/en/download)

### Backend (Symfony)

```bash
cd back
composer install
symfony server:start
```

### puis lancement du frontend (React)

```bash
cd front
npm install --legacy-peer-deps
npm run dev
```

### Ou lancement en une commande

```bash
(cd front && npm install --legacy-peer-deps && npm run dev) & (cd back && composer install && php -S 127.0.0.1:8000 -t public/)
```

## Déploiement avec AlwaysData

### Backend

```bash
cd back
composer install --no-dev --optimize-autoloader
```

Créer un fichier local non versionné `back/.env.local` :

```dotenv
DATABASE_URL="mysql://DB_USER:DB_PASSWORD@DB_HOST:3306/DB_NAME?serverVersion=mariadb-10.4.28&charset=utf8mb4"
```

Puis exécuter les migrations :

```bash
cd back
php bin/console doctrine:migrations:migrate --no-interaction
```

### Frontend

```bash
cd front
npm install --legacy-peer-deps
npm run build
```

### Frontend en conteneur (mode normal, non-dev)

```bash
bash front/run-prod.sh
```

Application disponible sur `https://localhost` (port 443).

Si Docker renvoie `permission denied` sur `/var/run/docker.sock`, lance :

```bash
sudo usermod -aG docker $USER
newgrp docker
```

Ou exécute ponctuellement le script avec `sudo`.

### Tunnel Cloudflare (si 521 persiste)

```bash
bash front/run-tunnel.sh <TOKEN_CLOUDFLARE>
```

Si Docker n'est pas accessible, exécuter :

```bash
sudo bash front/run-tunnel.sh <TOKEN_CLOUDFLARE>
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
