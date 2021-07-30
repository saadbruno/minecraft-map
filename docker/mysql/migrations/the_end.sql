ALTER TABLE `mcmap`.`places` 
CHANGE COLUMN `dimension` `dimension` ENUM('Overworld', 'Nether', 'The_End') CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_unicode_ci' NOT NULL ;
