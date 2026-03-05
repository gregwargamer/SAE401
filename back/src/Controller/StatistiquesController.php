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
}

