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

    public function findPauvreteVsLogementSocial(): array
    {
        $qb = $this->createQueryBuilder('s')
            ->select(
                'd.code AS code_departement',
                'd.nom AS nom_departement',
                's.anneePublication AS annee_publication',
                's.tauxPauvrete AS taux_pauvrete',
                's.tauxLogementsSociaux AS taux_logements_sociaux'
            )
            ->join('s.departement', 'd')
            ->where('s.tauxPauvrete IS NOT NULL')
            ->andWhere('s.tauxLogementsSociaux IS NOT NULL')
            ->orderBy('s.anneePublication', 'DESC');

        return $qb->getQuery()->getArrayResult();
    }

    public function findVieillissementVsVacance(): array
    {
        $qb = $this->createQueryBuilder('s')
            ->select(
                'd.code AS code_departement',
                'd.nom AS nom_departement',
                's.anneePublication AS annee_publication',
                's.pourcentagePlus60Ans AS plus_60_ans',
                's.tauxLogementsVacants AS taux_vacants',
                's.nombreLogements AS total_logements'
            )
            ->join('s.departement', 'd')
            ->where('s.pourcentagePlus60Ans IS NOT NULL')
            ->andWhere('s.tauxLogementsVacants IS NOT NULL')
            ->orderBy('s.anneePublication', 'DESC');

        return $qb->getQuery()->getArrayResult();
    }

    public function findOccupationLogements(): array
    {
        $qb = $this->createQueryBuilder('s')
            ->select(
                'd.code AS code_departement',
                'd.nom AS nom_departement',
                's.anneePublication AS annee_publication',
                's.nombreLogements AS total_logements',
                's.nombreResidencesPrincipales AS residences_principales',
                's.tauxLogementsVacants AS taux_vacants'
            )
            ->join('s.departement', 'd')
            ->where('s.nombreLogements IS NOT NULL')
            ->orderBy('s.anneePublication', 'DESC');

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


