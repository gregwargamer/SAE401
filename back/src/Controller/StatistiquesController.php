<?php

namespace App\Controller;

use App\Repository\StatistiquesRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/statistiques')]
class StatistiquesController extends AbstractController
{
    /**
     * Endpoint 1 : Démographie
     * GET /api/statistiques/demographie?departement=75&annee=2023
     */
    #[Route('/demographie', name: 'api_statistiques_demographie', methods: ['GET'])]
    public function demographie(
        Request $request,
        StatistiquesRepository $repository
    ): JsonResponse {
        $filters = $this->extractFilters($request);
        $data = $repository->findDemographie($filters);
        
        return $this->json($data);
    }

    /**
     * Endpoint 2 : Économie
     * GET /api/statistiques/economie?region=11&annee_min=2020
     */
    #[Route('/economie', name: 'api_statistiques_economie', methods: ['GET'])]
    public function economie(
        Request $request,
        StatistiquesRepository $repository
    ): JsonResponse {
        $filters = $this->extractFilters($request);
        $data = $repository->findEconomie($filters);
        
        return $this->json($data);
    }

    /**
     * Endpoint 3 : Logement général
     * GET /api/statistiques/logement?departement=59&annee=2023
     */
    #[Route('/logement', name: 'api_statistiques_logement', methods: ['GET'])]
    public function logement(
        Request $request,
        StatistiquesRepository $repository
    ): JsonResponse {
        $filters = $this->extractFilters($request);
        $data = $repository->findLogement($filters);
        
        return $this->json($data);
    }

    /**
     * Endpoint 4 : Parc social
     * GET /api/statistiques/parc-social?annee=2023
     */
    #[Route('/parc-social', name: 'api_statistiques_parc_social', methods: ['GET'])]
    public function parcSocial(
        Request $request,
        StatistiquesRepository $repository
    ): JsonResponse {
        $filters = $this->extractFilters($request);
        $data = $repository->findParcSocial($filters);
        
        return $this->json($data);
    }

    /**
     * Endpoint 5 : Géographie
     * GET /api/statistiques/geographie?annee=2023
     */
    #[Route('/geographie', name: 'api_statistiques_geographie', methods: ['GET'])]
    public function geographie(
        Request $request,
        StatistiquesRepository $repository
    ): JsonResponse {
        $filters = $this->extractFilters($request);
        $data = $repository->findGeographie($filters);
        
        return $this->json($data);
    }

    /**
     * Endpoint 6 : Global (toutes les données)
     * GET /api/statistiques/global?departement=75&annee=2023
     */
    #[Route('/global', name: 'api_statistiques_global', methods: ['GET'])]
    public function global(
        Request $request,
        StatistiquesRepository $repository
    ): JsonResponse {
        $filters = $this->extractFilters($request);
        $data = $repository->findGlobal($filters);
        
        return $this->json($data);
    }

    /**
     * Extrait les filtres depuis les paramètres de requête
     */
    private function extractFilters(Request $request): array
    {
        $filters = [];

        // Filtre par département (peut être unique ou multiple: ?departement=75 ou ?departement[]=75&departement[]=92)
        if ($request->query->has('departement')) {
            $departement = $request->query->get('departement');
            // Si c'est déjà un tableau (departement[]=...), on le garde tel quel
            // Sinon on le transforme en tableau
            $filters['departement'] = is_array($departement) ? $departement : [$departement];
        }

        // Filtre par région (peut être unique ou multiple)
        if ($request->query->has('region')) {
            $region = $request->query->get('region');
            $filters['region'] = is_array($region) ? $region : [$region];
        }

        // Filtre par année exacte
        if ($request->query->has('annee')) {
            $filters['annee'] = $request->query->get('annee');
        }

        // Filtre par plage d'années
        if ($request->query->has('annee_min')) {
            $filters['annee_min'] = $request->query->get('annee_min');
        }

        if ($request->query->has('annee_max')) {
            $filters['annee_max'] = $request->query->get('annee_max');
        }

        return $filters;
    }
}
