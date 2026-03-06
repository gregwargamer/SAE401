<?php

namespace App\Entity;

use App\Repository\StatistiquesRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: StatistiquesRepository::class)]
#[ORM\Table(
   name: "statistiques_departement",
   uniqueConstraints: [
       new ORM\UniqueConstraint(
           name: "unique_departement_annee",
           columns: ["code_departement", "annee_publication"]
       )
   ]
)]
class StatistiquesGlobales
{
   #[ORM\Id]
   #[ORM\GeneratedValue]
   #[ORM\Column]
   private ?int $id = null;

   #[ORM\Column(type: "smallint")]
   private ?int $anneePublication = null;

   #[ORM\ManyToOne]
   #[ORM\JoinColumn(
       name: "code_departement",
       referencedColumnName: "code",
       nullable: false,
       onDelete: "CASCADE"
   )]
   private ?Departement $departement = null;

   #[ORM\Column(nullable: true)]
   private ?int $nombreHabitants = null;

   #[ORM\Column(type: "decimal", precision: 10, scale: 2, nullable: true)]
   private ?string $densitePopulation = null;

   #[ORM\Column(name: "variation_population_10_ans", type: "decimal", precision: 6, scale: 2, nullable: true)]
   private ?string $variationPopulation10Ans = null;

   #[ORM\Column(type: "decimal", precision: 6, scale: 2, nullable: true)]
   private ?string $contributionSoldeNaturel = null;

   #[ORM\Column(type: "decimal", precision: 6, scale: 2, nullable: true)]
   private ?string $contributionSoldeMigratoire = null;

   #[ORM\Column(name: "pourcentage_moins_20_ans", type: "decimal", precision: 5, scale: 2, nullable: true)]
   private ?string $pourcentageMoins20Ans = null;

   #[ORM\Column(name: "pourcentage_plus_60_ans", type: "decimal", precision: 5, scale: 2, nullable: true)]
   private ?string $pourcentagePlus60Ans = null;

   #[ORM\Column(type: "decimal", precision: 5, scale: 2, nullable: true)]
   private ?string $tauxChomageT4 = null;

   #[ORM\Column(type: "decimal", precision: 5, scale: 2, nullable: true)]
   private ?string $tauxPauvrete = null;

   #[ORM\Column(nullable: true)]
   private ?int $nombreLogements = null;

   #[ORM\Column(nullable: true)]
   private ?int $nombreResidencesPrincipales = null;

   #[ORM\Column(type: "decimal", precision: 5, scale: 2, nullable: true)]
   private ?string $tauxLogementsSociaux = null;

   #[ORM\Column(type: "decimal", precision: 5, scale: 2, nullable: true)]
   private ?string $tauxLogementsVacants = null;

   #[ORM\Column(type: "decimal", precision: 5, scale: 2, nullable: true)]
   private ?string $tauxLogementsIndividuels = null;

   #[ORM\Column(name: "moyenne_annuelle_construction_neuve_10_ans", nullable: true)]
   private ?int $moyenneAnnuelleConstructionNeuve10Ans = null;

   #[ORM\Column(type: "decimal", precision: 8, scale: 2, nullable: true)]
   private ?string $construction = null;

   #[ORM\Column(nullable: true)]
   private ?int $parcSocialNombreLogements = null;

   #[ORM\Column(nullable: true)]
   private ?int $parcSocialLogementsMisLocation = null;

   #[ORM\Column(nullable: true)]
   private ?int $parcSocialLogementsDemolis = null;

   #[ORM\Column(nullable: true)]
   private ?int $parcSocialVentesPersonnesPhysiques = null;

   #[ORM\Column(type: "decimal", precision: 5, scale: 2, nullable: true)]
   private ?string $parcSocialTauxLogementsVacants = null;

   #[ORM\Column(type: "decimal", precision: 5, scale: 2, nullable: true)]
   private ?string $parcSocialTauxLogementsIndividuels = null;

   #[ORM\Column(type: "decimal", precision: 6, scale: 2, nullable: true)]
   private ?string $parcSocialLoyerMoyen = null;

   #[ORM\Column(type: "decimal", precision: 5, scale: 2, nullable: true)]
   private ?string $parcSocialAgeMoyen = null;

   #[ORM\Column(type: "decimal", precision: 5, scale: 2, nullable: true)]
   private ?string $parcSocialTauxLogementsEnergivores = null;

   // ...getters/setters identiques à l'ancienne classe...
}
