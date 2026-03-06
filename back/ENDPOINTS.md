# 📡 API Statistiques - Documentation des Endpoints

## 🎯 Vue d'ensemble

L'API propose **6 endpoints thématiques** pour récupérer les statistiques départementales de manière flexible et performante.

**Base URL :** `http://localhost:8000/api/statistiques`

---

## 🔧 Filtres disponibles (tous les endpoints)

Tous les endpoints acceptent les mêmes paramètres de filtrage en **query string** :

| Paramètre     | Type         | Description           | Exemple                                                   |
| ------------- | ------------ | --------------------- | --------------------------------------------------------- |
| `departement` | string/array | Code(s) département   | `?departement=75` ou `?departement[]=75&departement[]=92` |
| `region`      | string/array | Code(s) région        | `?region=11` ou `?region[]=11&region[]=84`                |
| `annee`       | int          | Année exacte          | `?annee=2023`                                             |
| `annee_min`   | int          | Année minimum (plage) | `?annee_min=2020`                                         |
| `annee_max`   | int          | Année maximum (plage) | `?annee_max=2023`                                         |

**💡 Astuce :** Les filtres sont cumulables : `?departement=75&annee=2023`

---

## 📊 Endpoint 1 : Démographie

**Route :** `GET /api/statistiques/demographie`

**Description :** Retourne les **7 indicateurs démographiques** pour chaque département/année.

### Données retournées :

- `code_departement`, `nom_departement`, `code_region`, `nom_region`, `annee`
- `nombre_habitants`
- `densite_population` (habitants/km²)
- `variation_population_10_ans` (%)
- `contribution_solde_naturel` (%)
- `contribution_solde_migratoire` (%)
- `pourcentage_moins_20_ans` (%)
- `pourcentage_plus_60_ans` (%)

### Exemples :

```bash
# Tous les départements, toutes les années
GET /api/statistiques/demographie

# Paris uniquement, année 2023
GET /api/statistiques/demographie?departement=75&annee=2023

# Île-de-France (région 11), plage 2020-2023
GET /api/statistiques/demographie?region=11&annee_min=2020&annee_max=2023

# Plusieurs départements
GET /api/statistiques/demographie?departement[]=75&departement[]=92&departement[]=93
```

---

## 💰 Endpoint 2 : Économie

**Route :** `GET /api/statistiques/economie`

**Description :** Retourne les **2 indicateurs économiques** pour chaque département/année.

### Données retournées :

- `code_departement`, `nom_departement`, `code_region`, `nom_region`, `annee`
- `taux_chomage_t4` (% au T4)
- `taux_pauvrete` (%)

### Exemples :

```bash
# Tous les départements, année 2023
GET /api/statistiques/economie?annee=2023

# Hauts-de-France (région 32)
GET /api/statistiques/economie?region=32

# Nord (département 59), dernières années
GET /api/statistiques/economie?departement=59&annee_min=2020
```

---

## 🏠 Endpoint 3 : Logement général

**Route :** `GET /api/statistiques/logement`

**Description :** Retourne les **7 indicateurs du parc de logement** pour chaque département/année.

### Données retournées :

- `code_departement`, `nom_departement`, `code_region`, `nom_region`, `annee`
- `nombre_logements`
- `nombre_residences_principales`
- `taux_logements_sociaux` (%)
- `taux_logements_vacants` (%)
- `taux_logements_individuels` (%)
- `moyenne_construction_10_ans` (nb logements/an)
- `construction` (nb logements construits)

### Exemples :

```bash
# Tous les départements, année 2023
GET /api/statistiques/logement?annee=2023

# Paris et petite couronne
GET /api/statistiques/logement?departement[]=75&departement[]=92&departement[]=93&departement[]=94

# Provence-Alpes-Côte d'Azur (région 93)
GET /api/statistiques/logement?region=93&annee_min=2021
```

---

## 🏢 Endpoint 4 : Parc social

**Route :** `GET /api/statistiques/parc-social`

**Description :** Retourne les **9 indicateurs du parc locatif social** pour chaque département/année.

### Données retournées :

- `code_departement`, `nom_departement`, `code_region`, `nom_region`, `annee`
- `parc_social_nombre_logements`
- `parc_social_logements_mis_location` (nouveaux)
- `parc_social_logements_demolis`
- `parc_social_ventes_personnes_physiques`
- `parc_social_taux_logements_vacants` (%)
- `parc_social_taux_logements_individuels` (%)
- `parc_social_loyer_moyen` (€/m²)
- `parc_social_age_moyen` (années)
- `parc_social_taux_logements_energivores` (%)

### Exemples :

```bash
# Tous les départements, année 2023
GET /api/statistiques/parc-social?annee=2023

# Gironde (33)
GET /api/statistiques/parc-social?departement=33

# Évolution Occitanie (région 76) sur 5 ans
GET /api/statistiques/parc-social?region=76&annee_min=2019&annee_max=2023
```

---

## 🗺️ Endpoint 5 : Géographie

**Route :** `GET /api/statistiques/geographie`

**Description :** Retourne les **coordonnées géographiques** pour les cartes interactives (Leaflet.js).

### Données retournées :

- `code_departement`, `nom_departement`, `code_region`, `nom_region`, `annee`

**⚠️ Note :** Les colonnes `geom` (polygones) et `dep_centroid` (coordonnées) ne sont pas encore mappées dans l'Entity. À ajouter si besoin pour les cartes choroplèthes/bulles.

### Exemples :

```bash
# Tous les départements
GET /api/statistiques/geographie?annee=2023
```

---

## 🌍 Endpoint 6 : Global (toutes les données)

**Route :** `GET /api/statistiques/global`

**Description :** Retourne **l'ensemble des 27 colonnes** (démographie + économie + logement + parc social).

### Données retournées :

**TOUT** : les 7 indicateurs démographie + 2 économie + 7 logement + 9 parc social + métadonnées.

### Exemples :

```bash
# Paris, année 2023 (toutes les stats)
GET /api/statistiques/global?departement=75&annee=2023

# Tous les départements, toutes les années (ATTENTION : gros volume !)
GET /api/statistiques/global

# Île-de-France, dernière année disponible
GET /api/statistiques/global?region=11&annee=2023
```

---

## 📝 Format de réponse JSON

Tous les endpoints retournent un tableau JSON :

```json
[
  {
    "code_departement": "75",
    "nom_departement": "Paris",
    "code_region": "11",
    "nom_region": "ÎLE-DE-FRANCE",
    "annee": 2023,
    "nombre_habitants": 2133111,
    "densite_population": "20268.00",
    "variation_population_10_ans": "-3.67",
    "contribution_solde_naturel": "2.15",
    "contribution_solde_migratoire": "-5.82",
    "pourcentage_moins_20_ans": "19.23",
    "pourcentage_plus_60_ans": "23.45"
  },
  {
    "code_departement": "92",
    "nom_departement": "Hauts-de-Seine",
    "code_region": "11",
    "nom_region": "ÎLE-DE-FRANCE",
    "annee": 2023,
    ...
  }
]
```

---

## 🚀 Cas d'usage typiques

### Pour Chart.js (graphiques)

```javascript
// Récupérer les données démographiques de Paris (2020-2023)
fetch(
    "/api/statistiques/demographie?departement=75&annee_min=2020&annee_max=2023",
)
    .then((r) => r.json())
    .then((data) => {
        // Créer un graphique d'évolution de la population
        const labels = data.map((d) => d.annee);
        const values = data.map((d) => d.nombre_habitants);
        // ... Chart.js code
    });
```

### Pour Leaflet.js (cartes)

```javascript
// Récupérer tous les départements avec taux de logements vacants (2023)
fetch("/api/statistiques/logement?annee=2023")
    .then((r) => r.json())
    .then((data) => {
        // Créer une carte choroplèthe (couleur par taux de vacance)
        data.forEach((dept) => {
            const color = getColorByRate(dept.taux_logements_vacants);
            // ... Leaflet.js code pour colorier le polygone du département
        });
    });
```

### Comparaison multi-départements

```javascript
// Comparer Paris, Lyon, Marseille (parc social 2023)
fetch(
    "/api/statistiques/parc-social?departement[]=75&departement[]=69&departement[]=13&annee=2023",
)
    .then((r) => r.json())
    .then((data) => {
        // Créer un bar chart comparatif
        // ...
    });
```

---

## ✅ Tests rapides

Lance ton serveur Symfony :

```bash
cd back
symfony serve
```

Ensuite teste dans ton navigateur ou avec curl :

```bash
# Test endpoint démographie (tous les départements)
http://localhost:8000/api/statistiques/demographie

# Test endpoint économie (Paris 2023)
http://localhost:8000/api/statistiques/economie?departement=75&annee=2023

# Test endpoint logement (Île-de-France)
http://localhost:8000/api/statistiques/logement?region=11

# Test endpoint parc social (dernière année)
http://localhost:8000/api/statistiques/parc-social?annee=2023

# Test endpoint global (Paris, toutes les données)
http://localhost:8000/api/statistiques/global?departement=75&annee=2023
```

---

## 🎓 Bonnes pratiques

1. **Filtrer systématiquement** : Évite d'appeler `/global` sans filtres (trop de données)
2. **Utiliser les endpoints thématiques** : Plus rapide et léger que `/global`
3. **Mettre en cache** côté front : Les données changent peu, cache les réponses
4. **Paginer si besoin** : Pour de grosses requêtes, implémenter la pagination côté Symfony

---

## 🔮 Prochaines étapes

- [ ] Ajouter CORS pour permettre les appels depuis le front React
- [ ] Ajouter `geom` et `dep_centroid` dans l'Entity pour les cartes
- [ ] Implémenter la pagination (limite + offset)
- [ ] Ajouter un endpoint `/regions` pour récupérer la liste des régions
- [ ] Ajouter un endpoint `/departements` pour récupérer la liste des départements

---

**Créé le :** 5 mars 2026  
**Auteur :** GitHub Copilot  
**Stack :** Symfony 7 + Doctrine ORM + MySQL
