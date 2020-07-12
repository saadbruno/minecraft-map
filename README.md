# Minecraft map
A self hosted minecraft shareable locations map

Made for personal use, if you wanna deploy it, gl&hf!

## Setup:
### Development:
- Edit your `/etc/hosts` and add the line:
```
127.0.0.1 map.saadbruno.test
```
- Copy `docker/template.env` to `docker/.env` and edit it with your GitHub Token
- `cd` into `./docker` and run `make setup` (if you get a mysql error 2002, wait a bit (mysql is still starting up), and run `make import-schema` again)

You should now be able to acess the page at [http://map.saadbruno.test](http://map.saadbruno.test)

### Prod:
Prod is running on port 4003, so it requires a reverse proxy pointing to that server (example for NGINX is in `docker/nginx/prod/reverse-proxy.conf`)

Aside from that is pretty much the same process:
- Copy `docker/template.env` to `docker/.env` and edit it with your GitHub Token, and also change the MySQL password
- `cd` into `./docker`
- Run `make redeploy-prod`
- Import the DB schema with `make import-schema` (might need to change the password for this one)
- Traefik should automatically install the SSL certificates

## Links:
[Docker LEMP stack](https://github.com/cvaclav/docker-lemp-stack)