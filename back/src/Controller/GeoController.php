<?php

namespace App\Controller;

use Doctrine\DBAL\Connection;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class GeoController extends AbstractController
{
    //code nom et geom de chaque departement pour les cartes
    #[Route('/geo', name: 'api_geo', methods: ['GET'])]
    public function geo(Connection $connection): JsonResponse
    {
        $sql = "SELECT code, nom, geom, dep_centroid FROM departement ORDER BY code ASC";
        $data = $connection->fetchAllAssociative($sql);
        return $this->json($data);
    }
}
