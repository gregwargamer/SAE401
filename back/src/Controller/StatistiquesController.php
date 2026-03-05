<?php

namespace App\Controller;

use App\Repository\StatistiquesDepartementRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class StatistiquesController extends AbstractController
{
    #[Route('/api/taux_de_logements_vacants', name: 'api_taux_de_logements_vacants', methods: ['GET'])]
    public function tauxLogementsVacants(
        StatistiquesDepartementRepository $statistiquesDepartementRepository
    ): JsonResponse {
        $resultats = $statistiquesDepartementRepository->findTauxLogementsVacantsOverTime();

        return $this->json($resultats);
    }

    #[Route('/api/taux_de_logements_vacants/par_departement', name: 'api_taux_de_logements_vacants_par_departement', methods: ['GET'])]
    public function tauxLogementsVacantsParDepartement(
        StatistiquesDepartementRepository $statistiquesDepartementRepository
    ): JsonResponse {
        $resultats = $statistiquesDepartementRepository->findTauxLogementsVacantsParDepartement();

        return $this->json($resultats);
    }

    #[Route('/api/statistiques/pauvrete_logement_social', name: 'api_statistiques_pauvrete_logement', methods: ['GET'])]
    public function pauvreteLogementSocial(
        StatistiquesDepartementRepository $statistiquesDepartementRepository
    ): JsonResponse {
        return $this->json($statistiquesDepartementRepository->findPauvreteVsLogementSocial());
    }

    #[Route('/api/statistiques/demographie_vacance', name: 'api_statistiques_demographie_vacance', methods: ['GET'])]
    public function demographieVacance(
        StatistiquesDepartementRepository $statistiquesDepartementRepository
    ): JsonResponse {
        return $this->json($statistiquesDepartementRepository->findVieillissementVsVacance());
    }

    #[Route('/api/statistiques/occupation_logements', name: 'api_statistiques_occupation', methods: ['GET'])]
    public function occupationLogements(
        StatistiquesDepartementRepository $statistiquesDepartementRepository
    ): JsonResponse {
        return $this->json($statistiquesDepartementRepository->findOccupationLogements());
    }
}

