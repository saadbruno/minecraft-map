# Minecraft map
A self hosted minecraft shareable locations map

Made for personal use, if you wanna deploy it, gl&hf!

## Setup:

### Environment:
- Copy `docker/template.env` to `docker/.env` and edit the MySQL password

### Discord Oauth:
- Go to the [Discord Developer Portal](https://discord.com/developers/applications) and create a new application
- Copy the Client ID and Client Secret to the `.env` file
- Create an Oauth Redirect URI and add it to teh `.env` file
- Copy your Discord User ID and add it as an admin in the `.env` file

### Development:
- Edit your `/etc/hosts` and add the line:
```
127.0.0.1 map.saadbruno.test
```
- Edit `docker/.env` with the necessay information
- `cd` into `./docker` and run `make setup` (if you get a mysql error 2002, wait a bit (mysql is still starting up), and run `make import-schema` again)

You should now be able to acess the page at [http://map.saadbruno.test](http://map.saadbruno.test)

### Prod:
Prod is running on port 4003, so it requires a reverse proxy pointing to that server (example for NGINX is in `docker/nginx/prod/reverse-proxy.conf`)

Aside from that is pretty much the same process:
- Edit `docker/.env` with the necessay information
- `cd` into `./docker`
- Run `make redeploy-prod`
- Import the DB schema with `make import-schema` (might need to change the password for this one)
- Traefik should automatically install the SSL certificates

### Minedmap:
This system supports [Minedmap](https://github.com/NeoRaider/MinedMap) to insert background tiles. To do it, just place your minedmap export data into `/code/public/minedmap/data` and it should load automatically.

## Links:
- [Docker LEMP stack](https://github.com/cvaclav/docker-lemp-stack)
- [Minedmap](https://github.com/NeoRaider/MinedMap)
- [Emoji-Button](https://github.com/joeattardi/emoji-button)