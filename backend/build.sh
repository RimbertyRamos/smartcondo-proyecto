#!/usr/bin/env bash
# exit on error
set -o errexit

echo "--- Construyendo el Frontend ---"
# 1. Vamos a la carpeta del frontend
cd ../frontend_web
# 2. Instalamos sus dependencias
npm install
# 3. Creamos la carpeta 'build' con la versión final de React
npm run build
# 4. Volvemos a la carpeta del backend
cd ../backend

echo "--- Preparando el Backend ---"
# 5. Instalamos las dependencias de Python
pip install -r requirements.txt

# 6. Recolectamos todos los archivos estáticos (incluyendo los de React)
python manage.py collectstatic --no-input

# 7. Aplicamos las migraciones a la base de datos de Render
python manage.py migrate

