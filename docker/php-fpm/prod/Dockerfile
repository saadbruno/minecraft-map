FROM php:8.0.3-fpm

RUN docker-php-ext-install pdo_mysql

COPY /code /var/www/code
COPY docker/php-fpm/php-ini-overrides.ini /usr/local/etc/php/conf.d/99-overrides.ini

WORKDIR "/var/www"
