FROM nginx:1.21.4

COPY /code /var/www/code
COPY docker/nginx/prod/nginx.prod.conf /etc/nginx/conf.d/default.conf

WORKDIR /var/www/code