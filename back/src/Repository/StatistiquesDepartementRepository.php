<?php


namespace App\Repository;


use App\Entity\StatistiquesDepartement;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;


class StatistiquesDepartementRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, StatistiquesDepartement::class);
    }

    public function findTauxLogementsVacantsOverTime(): array
    {
        $qb = $this->createQueryBuilder('s')
            ->select(
                's.anneePublication AS annee_publication',
                'AVG(s.tauxLogementsVacants) AS taux_de_logements_vacants'
            )
            ->where('s.tauxLogementsVacants IS NOT NULL')
            ->groupBy('s.anneePublication')
            ->orderBy('s.anneePublication', 'ASC');

        return $qb->getQuery()->getArrayResult();
    }
}


