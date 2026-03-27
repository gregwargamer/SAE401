# SAE401 — guide version hébergée (front seulement)

Ce fichier explique rapidement comment lancer uniquement la partie front après avoir cloné le dépôt.

Installation et lancement (front)

1. Ouvrir un terminal et se placer dans le dossier front :

```bash
cd SAE401/front
```

2. Installer les dépendances :

```bash
# Si vous avez des erreurs de peer-deps, utilisez --legacy-peer-deps
npm install --legacy-peer-deps
# ou si tout fonctionne :
# npm install
```

3. Lancer le serveur de développement (Vite) :

```bash
npm run dev
```

4. Ouvrir le navigateur sur l'adresse indiquée (par défaut http://localhost:5173 ou une autre port affichée).

Remarques

- Le projet contient des données statiques dans `front/public/data/static-db.json` utilisées en mode statique.
- Si vous rencontrez des conflits de versions de `react` avec certains paquets (`react-simple-maps`), `--legacy-peer-deps` résout généralement l'installation.
