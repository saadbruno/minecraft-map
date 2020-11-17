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
  INDEX `id` (`id`),
  INDEX `flag` (`flag`),
  UNIQUE KEY `id_flag_pair` (`id`,`flag`)
)
COMMENT = 'Used for perms';


DROP TABLE IF EXISTS `authorized_guilds`;

CREATE TABLE `authorized_guilds` (
  `guild_id` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`guild_id`)
)
COMMENT = 'When a user logs in, we check them against this table. If the user is a member of any of those guilds, we give them the correct perms';
