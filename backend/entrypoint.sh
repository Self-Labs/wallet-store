#!/bin/sh

# Se ocorrer erro, para tudo
set -e

echo "Aguardando Banco de Dados ($DB_HOST)..."
# Loop esperando a porta 5432 (DB_PORT) responder
while ! nc -z $DB_HOST 5432; do
  sleep 0.1
done
echo "PostgreSQL conectado!"

# Aplica Migrations e coleta arquivos estáticos
python manage.py collectstatic --noinput
python manage.py makemigrations
python manage.py migrate

# Executa o comando principal (runserver)
exec "$@"