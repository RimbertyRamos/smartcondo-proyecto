#!/usr/bin/env bash
# exit on error
set -o errexit

echo "--- Preparando el Backend ---"
pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# --- COMANDO NUEVO Y CRÍTICO ---
# Crea un superusuario usando las variables de entorno si no existe
echo "--- Creando Superusuario ---"
python manage.py createsuperuser --noinput || echo "El superusuario ya existe."