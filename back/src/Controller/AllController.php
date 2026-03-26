<?php

namespace App\Controller;

use App\Util\GeoNameResolver;
use Doctrine\DBAL\Connection;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class AllController extends AbstractController
{
    // retourne tout sauf geom et dep_centroid
    #[Route('/all', name: 'api_all', methods: ['GET'])]
    public function all(Connection $connection): JsonResponse
    {
        $sql = "
            SELECT
                d.code AS code_departement,
                d.nom AS nom_departement,
                r.code AS code_region,
                r.nom AS nom_region,
                p.annee,
                p.nb_habitants, p.densite, p.variation_population,
                p.contribution_solde_naturel, p.contribution_solde_migratoire,
                p.pct_moins_20ans, p.pct_plus_60ans,
                p.taux_chomage, p.taux_pauvrete,
                l.nb_logements, l.nb_residences_principales,
                l.taux_logements_sociaux, l.taux_logements_vacants,
                l.taux_logements_individuels, l.moyenne_construction_neuve, l.construction,
                ps.nb_logements AS parc_social_nb_logements,
                ps.logements_mis_en_location, ps.logements_demolis,
                ps.ventes_personnes_physiques, ps.taux_vacants AS parc_social_taux_vacants,
                ps.taux_individuels AS parc_social_taux_individuels,
                ps.loyer_moyen, ps.age_moyen_parc, ps.taux_energivores
            FROM statistique_population p
            JOIN departement d ON d.code = p.code_departement
            JOIN region r ON r.code = d.code_region
            LEFT JOIN statistique_logement l ON l.code_departement = p.code_departement AND l.annee = p.annee
            LEFT JOIN parc_social ps ON ps.code_departement = p.code_departement AND ps.annee = p.annee
            ORDER BY p.annee DESC, d.code ASC
        ";

        $data = $connection->fetchAllAssociative($sql);

        foreach ($data as &$row) {
            $depCode = (string) ($row['code_departement'] ?? '');
            $regionCode = (string) ($row['code_region'] ?? '');

            $row['nom_departement'] = GeoNameResolver::departmentName($depCode, $row['nom_departement'] ?? null);
            $row['nom_region'] = GeoNameResolver::regionName($regionCode, $row['nom_region'] ?? null);
        }

        return $this->json($data);
    }

}
