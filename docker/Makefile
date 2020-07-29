.PHONY: setup

# first time setup
setup: redeploy import-schema

# Build commands
build: build-network build-sass build-containers
build-network:
	docker network create proxy.mcmap
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
redeploy: stop clean build-network build run

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
	docker-compose -f docker-compose.prod.yml build --no-cache nginx
build-php-prod:
	docker-compose -f docker-compose.prod.yml build --no-cache php-fpm
build-prod:
	docker-compose -f docker-compose.prod.yml build --no-cache

run-mysql-prod:
	docker-compose -f docker-compose.prod.yml up -d mysql
run-nginx-prod:
	docker-compose -f docker-compose.prod.yml up -d nginx
run-php-prod:
	docker-compose -f docker-compose.prod.yml up -d php-fpm
run-prod:
	docker-compose -f docker-compose.prod.yml up -d

stop-mysql-prod:
	docker-compose -f docker-compose.prod.yml stop mysql
stop-nginx-prod:
	docker-compose -f docker-compose.prod.yml stop nginx
stop-php-prod:
	docker-compose -f docker-compose.prod.yml stop php-fpm
stop-prod:
	docker-compose -f docker-compose.prod.yml down

redeploy-prod: redeploy-nginx-prod redeploy-php-prod

redeploy-all-prod: build-sass build-prod stop-prod clean build-network run-prod

redeploy-mysql-prod: build-mysql-prod stop-mysql-prod clean run-mysql-prod

redeploy-nginx-prod: build-nginx-prod stop-nginx-prod clean run-nginx-prod

redeploy-php-prod: build-php-prod stop-php-prod clean run-php-prod

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
