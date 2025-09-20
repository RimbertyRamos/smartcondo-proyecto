#!/usr/bin/env bash
# exit on error
set -o errexit

# --- PASOS NUEVOS Y CRÍTICOS ---
echo "--- Construyendo el Frontend ---"
cd ../frontend_web  # 1. Ve a la carpeta de React
npm install         # 2. Instala sus dependencias (React, Bootstrap, etc.)
npm run build       # 3. Compila el frontend y crea la carpeta 'build'
cd ../backend       # 4. Vuelve a la carpeta de Django

# --- PASOS ANTIGUOS (SIGUEN SIENDO NECESARIOS) ---
echo "--- Preparando el Backend ---"
pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate