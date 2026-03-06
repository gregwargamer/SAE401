<?php

namespace App\Repository;

use App\Entity\StatistiquesGlobales;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\QueryBuilder;
use Doctrine\Persistence\ManagerRegistry;

class StatistiquesRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, StatistiquesGlobales::class);
    }

    /**
     * Endpoint 1 : Démographie
     * Retourne les données démographiques (7 indicateurs)
     */
    public function findDemographie(array $filters = []): array
    {
        $qb = $this->createQueryBuilder('s')
            ->select(
                'd.code AS code_departement',
                'd.nom AS nom_departement',
                'r.code AS code_region',
                'r.nom AS nom_region',
                's.anneePublication AS annee',
                's.nombreHabitants AS nombre_habitants',
                's.densitePopulation AS densite_population',
                's.variationPopulation10Ans AS variation_population_10_ans',
                's.contributionSoldeNaturel AS contribution_solde_naturel',
                's.contributionSoldeMigratoire AS contribution_solde_migratoire',
                's.pourcentageMoins20Ans AS pourcentage_moins_20_ans',
                's.pourcentagePlus60Ans AS pourcentage_plus_60_ans'
            )
            ->join('s.departement', 'd')
            ->join('d.codeRegion', 'r');

        $this->applyFilters($qb, $filters);
        
        return $qb->getQuery()->getArrayResult();
    }

    /**
     * Endpoint 2 : Économie
     * Retourne les données économiques (2 indicateurs)
     */
    public function findEconomie(array $filters = []): array
    {
        $qb = $this->createQueryBuilder('s')
            ->select(
                'd.code AS code_departement',
                'd.nom AS nom_departement',
                'r.code AS code_region',
                'r.nom AS nom_region',
                's.anneePublication AS annee',
                's.tauxChomageT4 AS taux_chomage_t4',
                's.tauxPauvrete AS taux_pauvrete'
            )
            ->join('s.departement', 'd')
            ->join('d.codeRegion', 'r');

        $this->applyFilters($qb, $filters);
        
        return $qb->getQuery()->getArrayResult();
    }

    /**
     * Endpoint 3 : Logement général
     * Retourne les données du parc de logement (7 indicateurs)
     */
    public function findLogement(array $filters = []): array
    {
        $qb = $this->createQueryBuilder('s')
            ->select(
                'd.code AS code_departement',
                'd.nom AS nom_departement',
                'r.code AS code_region',
                'r.nom AS nom_region',
                's.anneePublication AS annee',
                's.nombreLogements AS nombre_logements',
                's.nombreResidencesPrincipales AS nombre_residences_principales',
                's.tauxLogementsSociaux AS taux_logements_sociaux',
                's.tauxLogementsVacants AS taux_logements_vacants',
                's.tauxLogementsIndividuels AS taux_logements_individuels',
                's.moyenneAnnuelleConstructionNeuve10Ans AS moyenne_construction_10_ans',
                's.construction AS construction'
            )
            ->join('s.departement', 'd')
            ->join('d.codeRegion', 'r');

        $this->applyFilters($qb, $filters);
        
        return $qb->getQuery()->getArrayResult();
    }

    /**
     * Endpoint 4 : Parc social
     * Retourne les données du parc locatif social (9 indicateurs)
     */
    public function findParcSocial(array $filters = []): array
    {
        $qb = $this->createQueryBuilder('s')
            ->select(
                'd.code AS code_departement',
                'd.nom AS nom_departement',
                'r.code AS code_region',
                'r.nom AS nom_region',
                's.anneePublication AS annee',
                's.parcSocialNombreLogements AS parc_social_nombre_logements',
                's.parcSocialLogementsMisLocation AS parc_social_logements_mis_location',
                's.parcSocialLogementsDemolis AS parc_social_logements_demolis',
                's.parcSocialVentesPersonnesPhysiques AS parc_social_ventes_personnes_physiques',
                's.parcSocialTauxLogementsVacants AS parc_social_taux_logements_vacants',
                's.parcSocialTauxLogementsIndividuels AS parc_social_taux_logements_individuels',
                's.parcSocialLoyerMoyen AS parc_social_loyer_moyen',
                's.parcSocialAgeMoyen AS parc_social_age_moyen',
                's.parcSocialTauxLogementsEnergivores AS parc_social_taux_logements_energivores'
            )
            ->join('s.departement', 'd')
            ->join('d.codeRegion', 'r');

        $this->applyFilters($qb, $filters);
        
        return $qb->getQuery()->getArrayResult();
    }

    /**
     * Endpoint 5 : Géographie
     * Retourne les coordonnées géographiques pour les cartes
     */
    public function findGeographie(array $filters = []): array
    {
        // Note: geom et dep_centroid ne sont pas dans l'Entity actuellement
        // On retourne juste les infos de base pour le moment
        $qb = $this->createQueryBuilder('s')
            ->select(
                'd.code AS code_departement',
                'd.nom AS nom_departement',
                'r.code AS code_region',
                'r.nom AS nom_region',
                's.anneePublication AS annee'
            )
            ->join('s.departement', 'd')
            ->join('d.codeRegion', 'r');

        $this->applyFilters($qb, $filters);
        
        return $qb->getQuery()->getArrayResult();
    }

    /**
     * Endpoint 6 : Toutes les données (GLOBAL)
     * Retourne l'ensemble des 27 colonnes
     */
    public function findGlobal(array $filters = []): array
    {
        $qb = $this->createQueryBuilder('s')
            ->select(
                'd.code AS code_departement',
                'd.nom AS nom_departement',
                'r.code AS code_region',
                'r.nom AS nom_region',
                's.anneePublication AS annee',
                // Démographie (7)
                's.nombreHabitants AS nombre_habitants',
                's.densitePopulation AS densite_population',
                's.variationPopulation10Ans AS variation_population_10_ans',
                's.contributionSoldeNaturel AS contribution_solde_naturel',
                's.contributionSoldeMigratoire AS contribution_solde_migratoire',
                's.pourcentageMoins20Ans AS pourcentage_moins_20_ans',
                's.pourcentagePlus60Ans AS pourcentage_plus_60_ans',
                // Économie (2)
                's.tauxChomageT4 AS taux_chomage_t4',
                's.tauxPauvrete AS taux_pauvrete',
                // Logement (7)
                's.nombreLogements AS nombre_logements',
                's.nombreResidencesPrincipales AS nombre_residences_principales',
                's.tauxLogementsSociaux AS taux_logements_sociaux',
                's.tauxLogementsVacants AS taux_logements_vacants',
                's.tauxLogementsIndividuels AS taux_logements_individuels',
                's.moyenneAnnuelleConstructionNeuve10Ans AS moyenne_construction_10_ans',
                's.construction AS construction',
                // Parc social (9)
                's.parcSocialNombreLogements AS parc_social_nombre_logements',
                's.parcSocialLogementsMisLocation AS parc_social_logements_mis_location',
                's.parcSocialLogementsDemolis AS parc_social_logements_demolis',
                's.parcSocialVentesPersonnesPhysiques AS parc_social_ventes_personnes_physiques',
                's.parcSocialTauxLogementsVacants AS parc_social_taux_logements_vacants',
                's.parcSocialTauxLogementsIndividuels AS parc_social_taux_logements_individuels',
                's.parcSocialLoyerMoyen AS parc_social_loyer_moyen',
                's.parcSocialAgeMoyen AS parc_social_age_moyen',
                's.parcSocialTauxLogementsEnergivores AS parc_social_taux_logements_energivores'
            )
            ->join('s.departement', 'd')
            ->join('d.codeRegion', 'r');

        $this->applyFilters($qb, $filters);
        
        return $qb->getQuery()->getArrayResult();
    }

    /**
     * Applique les filtres flexibles (département, région, année, plage d'années)
     */
    private function applyFilters(QueryBuilder $qb, array $filters): void
    {
        // Filtre par département(s)
        if (!empty($filters['departement'])) {
            $departements = is_array($filters['departement']) 
                ? $filters['departement'] 
                : [$filters['departement']];
            $qb->andWhere('d.code IN (:departements)')
               ->setParameter('departements', $departements);
        }

        // Filtre par région(s)
        if (!empty($filters['region'])) {
            $regions = is_array($filters['region']) 
                ? $filters['region'] 
                : [$filters['region']];
            $qb->andWhere('r.code IN (:regions)')
               ->setParameter('regions', $regions);
        }

        // Filtre par année exacte
        if (!empty($filters['annee'])) {
            $qb->andWhere('s.anneePublication = :annee')
               ->setParameter('annee', $filters['annee']);
        }

        // Filtre par plage d'années
        if (!empty($filters['annee_min'])) {
            $qb->andWhere('s.anneePublication >= :annee_min')
               ->setParameter('annee_min', $filters['annee_min']);
        }

        if (!empty($filters['annee_max'])) {
            $qb->andWhere('s.anneePublication <= :annee_max')
               ->setParameter('annee_max', $filters['annee_max']);
        }

        // Tri par défaut
        $qb->orderBy('s.anneePublication', 'DESC')
           ->addOrderBy('d.code', 'ASC');
    }
}
