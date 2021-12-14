-- MySQL dump 10.13  Distrib 8.0.17, for Win64 (x86_64)
--
-- Host: 192.168.100.120    Database: mcmap
-- ------------------------------------------------------
-- Server version	8.0.16

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `icons`
--

DROP TABLE IF EXISTS `icons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `icons` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `url` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(45) NOT NULL DEFAULT 'other',
  `published` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

-- Inserts default icon so the emoji picker is not empty
INSERT INTO `icons` (`url`, `name`)
VALUES ('https://www.minecraft.net/etc.clientlibs/minecraft/clientlibs/main/resources/favicon-32x32.png', 'default icon');

--
-- Table structure for table `places`
--

DROP TABLE IF EXISTS `places`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `places` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `coordX` int(6) NOT NULL,
  `coordY` int(6) NOT NULL,
  `coordZ` int(6) NOT NULL,
  `comment` text,
  `dimension` enum('Overworld','Nether', 'The_End') NOT NULL,
  `published` tinyint(4) NOT NULL DEFAULT '1',
  `icon` int(11) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` VARCHAR(45) NOT NULL,
  `username` VARCHAR(45) NOT NULL,
  `avatar` VARCHAR(45) NULL,
  `discriminator` INT NOT NULL,
  `locale` VARCHAR(45) NULL,
  PRIMARY KEY (`id`))
COMMENT = 'Users logged in via Discord. Column names matches the Discord API';

DROP TABLE IF EXISTS `user_flags`;

CREATE TABLE `user_flags` (
  `id` VARCHAR(45) NOT NULL,
  `flag` VARCHAR(45) NOT NULL,
  INDEX `id` (`id` ASC) INVISIBLE,
  INDEX `flag` (`flag` ASC) INVISIBLE,
  UNIQUE KEY `id_flag_pair` (`id`,`flag`)
)
COMMENT = 'Used for perms';


DROP TABLE IF EXISTS `authorized_guilds`;

CREATE TABLE `authorized_guilds` (
  `guild_id` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`guild_id`)
)
COMMENT = 'When a user logs in, we check them against this table. If the user is a member of any of those guilds, we give them the correct perms';