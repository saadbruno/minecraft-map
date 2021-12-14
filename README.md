# Minecraft map
A self hosted minecraft shareable locations map

Made for personal use, if you wanna deploy it, gl&hf!

## Setup:

### Environment:
- Copy `template.env` to `.env` and edit the MySQL password

### Discord Oauth:
- Go to the [Discord Developer Portal](https://discord.com/developers/applications) and create a new application
- Copy the Client ID and Client Secret to the `.env` file
- Create an Oauth Redirect URI and add it to teh `.env` file
- Copy your Discord User ID and add it as an admin in the `.env` file

### Development:
- Edit your `/etc/hosts` and add the line:
```
127.0.0.1 mcmap.test
```
- Edit `.env` with the necessay information
- Run `make setup` (if you get a mysql error 2002, wait a bit (mysql is still starting up), and run `make import-schema` again)

You should now be able to acess the page at [http://mcmap.test](http://mcmap.test)

### Prod:
#### Option 1: Docker Hub
You can pull pre-build images from Docker Hub and run everything with a single docker-compose file.
You basically need the `docker-compose.yml`, `.env`, and `mcmap.sql` all in the same directory.

- Create a `.env` file based on [template.env](https://raw.githubusercontent.com/saadbruno/minecraft-map/master/template.env)
- Download the [DB schema](https://raw.githubusercontent.com/saadbruno/minecraft-map/master/docker/mysql/mcmap.sql)
- Optional: if you're going to use MinedMap's tiles, create a `minedmap` directory with all the needed data.
- Create a `docker-compose.yml` file with mcmap_nginx, mcmap_php and mysql. Here's one you can use:
```
version: '3.4'
services:
    mcmap_nginx:
        container_name: mcmap_nginx
        image: saadbruno/mcmap_nginx:latest
        ports:
            - "${HTTP_PORT}:80"
        volumes:
            - ./minedmap:/var/www/code/public/minedmap:ro
        env_file:
            - .env
        links:
            - mcmap_php
        depends_on:
            - mysql
        restart: unless-stopped
        logging:
            options:
                max-size: 10m
    mcmap_php:
        image: saadbruno/mcmap_php:latest
        container_name: mcmap_php
        expose:
            - "9000"
        env_file:
            - .env
        links:
            - mysql
        depends_on:
            - mysql
        restart: unless-stopped
        logging:
            options:
                max-size: 10m
    mysql:
        container_name: mcmap_mysql
        image: mysql:8.0.16
        expose:
            - "3306"
        volumes:
            - mcmap_mysql:/var/lib/mysql
            - ./mcmap.sql:/docker-entrypoint-initdb.d/mcmap.sql:ro
        env_file: .env
        restart: unless-stopped
        logging:
            options:
                max-size: 10m

volumes:
  mcmap_mysql:
```

#### Option 2: Build the images from this repo
- Clone the repo
- Edit `.env` with the necessay information
- Run `make redeploy-prod`
- Import the DB schema with `make import-schema` (might need to change the password for this one)

#### NGINX Reverse proxy
If you need an nginx reverse proxy to run this, you can find an example [here](https://github.com/saadbruno/minecraft-map/blob/master/docker/nginx/prod/reverse-proy.conf)

### Minedmap:
This system supports [Minedmap](https://github.com/NeoRaider/MinedMap) to insert background tiles. To do it, just place your minedmap export data into `/code/public/minedmap/data` and it should load automatically.

## Links:
- [Minedmap](https://github.com/NeoRaider/MinedMap)
- [Emoji-Button](https://github.com/joeattardi/emoji-button)
