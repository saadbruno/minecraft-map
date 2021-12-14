FROM nginx:1.19.9

COPY /code /var/www/code
COPY docker/nginx/prod/nginx.prod.conf /etc/nginx/conf.d/default.conf

WORKDIR /var/www/code