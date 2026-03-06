-- ========================================================
-- SCRIPT DE NETTOYAGE - SUPPRESSION DES 5 COLONNES
-- ========================================================
-- Supprime les redondances de logements_sociaux
-- ========================================================

USE `saequatrecentun_db`;

-- ========================================================
-- SUPPRIMER LES 5 COLONNES REDONDANTES
-- ========================================================

  ALTER TABLE `logements_sociaux`
    DROP COLUMN `nom_departement`,
    DROP COLUMN `code_region`,
    DROP COLUMN `nom_region`,
    DROP COLUMN `epci`,
    DROP COLUMN `code_epci`;

-- ========================================================
-- ✅ TERMINÉ !
-- ========================================================
-- Les 5 colonnes redondantes ont été supprimées de logements_sociaux
-- ========================================================
