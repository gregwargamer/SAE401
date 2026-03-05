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

    public function findTauxLogementsVacantsParDepartement(): array
    {
        $qb = $this->createQueryBuilder('s')
            ->select(
                'd.code AS code_departement',
                'd.nom AS nom_departement',
                's.anneePublication AS annee_publication',
                's.tauxLogementsVacants AS taux_logements_vacants'
            )
            ->join('s.departement', 'd')
            ->where('s.tauxLogementsVacants IS NOT NULL')
            ->orderBy('d.code', 'ASC')
            ->addOrderBy('s.anneePublication', 'DESC');

        return $qb->getQuery()->getArrayResult();
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


