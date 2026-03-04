<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260218110145 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE departement (code VARCHAR(3) NOT NULL, nom VARCHAR(255) NOT NULL, code_region VARCHAR(3) NOT NULL, INDEX IDX_C1765B6370E4A9D4 (code_region), PRIMARY KEY (code)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE region (code VARCHAR(3) NOT NULL, nom VARCHAR(255) NOT NULL, PRIMARY KEY (code)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE departement ADD CONSTRAINT FK_C1765B6370E4A9D4 FOREIGN KEY (code_region) REFERENCES region (code)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE departement DROP FOREIGN KEY FK_C1765B6370E4A9D4');
        $this->addSql('DROP TABLE departement');
        $this->addSql('DROP TABLE region');
    }
}
