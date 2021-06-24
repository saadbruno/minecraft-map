.PHONY: setup

# first time setup
setup: redeploy import-schema

# Build commands
build: build-sass build-containers

build-containers:
	docker-compose build
build-nginx:
	docker-compose build nginx
build-php:
	docker-compose build php-fpm
build-sass:
	docker run --rm  -v `pwd`/../code/scss:/usr/src/app/scss  -v `pwd`/../code/public/styles:/usr/src/app/css cscheide/node-sass node-sass -r -o /usr/src/app/css/ /usr/src/app/scss/custom/

# Run commands
run:
	docker-compose up -d
run-nginx:
	docker-compose up -d nginx
run-php:
	docker-compose up -d php-fpm
run-mysql:
	docker-compose up -d mysql
# Stop containers
stop:
	docker-compose down
stop-nginx:
	docker-compose stop nginx
stop-sass:
	docker-compose stop nginx
stop-php:
	docker-compose stop php-fpm
stop-mysql:
	docker-compose stop mysql
# Clean and redeploy
clean:
	docker system prune -f
prune-db:
	rm -rf ../mysql
redeploy: stop clean build run

redeploy-web: stop-nginx stop-php clean build-nginx build-php run-nginx run-php

restart-nginx: stop-nginx run-nginx

redeploy-mysql: stop-mysql clean run-mysql

# Attach to command line inside container
manage-php:
	docker exec -it mcmap_php-fpm bash
manage-nginx:
	docker exec -it mcmap_nginx bash
manage-mysql:
	docker exec -it mcmap_mysql mysql -u admin -p mcmap


# logs
logs:
	docker-compose logs -f
logs-php:
	docker-compose logs -f php-fpm
logs-nginx:
	docker-compose logs -f nginx
logs-mysql:
	docker-compose logs -f mysql

# database management
import-schema:
	cat ./mysql/mcmap.sql | docker exec -i mcmap_mysql mysql -u admin -pOWIwMWI4MTQ3ZmIxNDdmZDU3NDFiMjQ2 mcmap 
backup-mysql:
	docker exec -it mcmap_mysql mysqldump -u admin -pOWIwMWI4MTQ3ZmIxNDdmZDU3NDFiMjQ2 mcmap | tail -n +2 > ./mysql/backup/mcmap_restore.sql;  cp ./mysql/backup/mcmap_restore.sql ./mysql/backup/mcmap_backup_`date +%Y%m%d_%H%M%S`.sql
restore-mysql:
	cat ./mysql/backup/mcmap_restore.sql | docker exec -i mcmap_mysql mysql -u admin -pOWIwMWI4MTQ3ZmIxNDdmZDU3NDFiMjQ2 mcmap 


#### PRODUCTION ####
build-mysql-prod:
	docker-compose -f docker-compose.prod.yml build --no-cache mysql
build-nginx-prod:
	docker-compose -f docker-compose.prod.yml build --no-cache mcmap_nginx
build-php-prod:
	docker-compose -f docker-compose.prod.yml build --no-cache mcmap_php
build-prod:
	docker-compose -f docker-compose.prod.yml build --no-cache

run-mysql-prod:
	docker-compose -f docker-compose.prod.yml up -d mysql
run-nginx-prod:
	docker-compose -f docker-compose.prod.yml up -d mcmap_nginx
run-php-prod:
	docker-compose -f docker-compose.prod.yml up -d mcmap_php
run-prod:
	docker-compose -f docker-compose.prod.yml up -d

stop-mysql-prod:
	docker-compose -f docker-compose.prod.yml stop mysql
stop-nginx-prod:
	docker-compose -f docker-compose.prod.yml stop mcmap_nginx
stop-php-prod:
	docker-compose -f docker-compose.prod.yml stop mcmap_php
stop-prod:
	docker-compose -f docker-compose.prod.yml down

redeploy-prod: build-sass build-nginx-prod build-php-prod stop-nginx-prod stop-php-prod run-php-prod run-nginx-prod clean

redeploy-all-prod: build-sass build-prod stop-prod run-prod clean

redeploy-mysql-prod: build-mysql-prod stop-mysql-prod run-mysql-prod clean

redeploy-nginx-prod: build-nginx-prod stop-nginx-prod run-nginx-prod clean

redeploy-php-prod: build-php-prod stop-php-prod run-php-prod  clean

redeploy-web-prod: redeploy-prod

backup-mysql-prod:
	docker exec mcmap_mysql mysqldump -u admin -p$(P) mcmap | tail -n +2 > ./mysql/backup/mcmap_restore.sql;  cp ./mysql/backup/mcmap_restore.sql ./mysql/backup/mcmap_backup_`date +%Y%m%d_%H%M%S`.sql
restore-mysql-prod:
	cat ./mysql/backup/mcmap_restore.sql | docker exec -i mcmap_mysql mysql -u admin -p$(P) mcmap 

# aliases
sass: build-sass
scss: build-sass
css: build-sass
manage-db: manage-mysql
backup-db: backup-mysql
restore-db: restore-mysql
