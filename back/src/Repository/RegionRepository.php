<?php

namespace App\Repository;

use App\Entity\Region;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class RegionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Region::class);
    }

    // Exemple de méthode personnalisée
    public function findAllRegions(): array
    {
        return $this->createQueryBuilder('r')
            ->select('r.code, r.nom')
            ->orderBy('r.nom', 'ASC')
            ->getQuery()
            ->getArrayResult();
    }
}
