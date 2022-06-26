-- ----------------------------------------------------------------------------
-- MySQL Workbench Migration
-- Migrated Schemata: handyhandphone1234
-- Source Schemata: handyhandphone
-- Created: Sun Jun 26 15:45:25 2022
-- Workbench Version: 8.0.29
-- ----------------------------------------------------------------------------

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- Schema handyhandphone1234
-- ----------------------------------------------------------------------------
DROP SCHEMA IF EXISTS `handyhandphone1234` ;
CREATE SCHEMA IF NOT EXISTS `handyhandphone1234` ;

-- ----------------------------------------------------------------------------
-- Table handyhandphone1234.sessions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `handyhandphone1234`.`sessions` (
  `session_id` VARCHAR(128) CHARACTER SET 'utf8mb4' NOT NULL,
  `expires` INT UNSIGNED NOT NULL,
  `data` MEDIUMTEXT CHARACTER SET 'utf8mb4' NULL DEFAULT NULL,
  PRIMARY KEY (`session_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------------------
-- Table handyhandphone1234.users
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `handyhandphone1234`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NULL DEFAULT NULL,
  `email` VARCHAR(255) NULL DEFAULT NULL,
  `verified` TINYINT(1) NULL DEFAULT NULL,
  `password` VARCHAR(255) NULL DEFAULT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 9
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------------------
-- Table handyhandphone1234.videos
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `handyhandphone1234`.`videos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NULL DEFAULT NULL,
  `story` VARCHAR(2000) NULL DEFAULT NULL,
  `starring` VARCHAR(255) NULL DEFAULT NULL,
  `posterURL` VARCHAR(255) NULL DEFAULT NULL,
  `language` VARCHAR(255) NULL DEFAULT NULL,
  `subtitles` VARCHAR(255) NULL DEFAULT NULL,
  `classification` VARCHAR(255) NULL DEFAULT NULL,
  `dateRelease` DATETIME NULL DEFAULT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  `userId` INT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `userId` (`userId` ASC) VISIBLE,
  CONSTRAINT `videos_ibfk_1`
    FOREIGN KEY (`userId`)
    REFERENCES `handyhandphone1234`.`users` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;
SET FOREIGN_KEY_CHECKS = 1;
