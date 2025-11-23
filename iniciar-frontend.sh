#!/bin/bash

echo "========================================"
echo "Iniciando MoveSys Frontend"
echo "========================================"
echo ""

cd "$(dirname "$0")"
echo "Directorio actual: $(pwd)"
echo ""

if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: No se pudieron instalar las dependencias"
        exit 1
    fi
    echo ""
fi

echo "Configurando URL del backend..."
export VITE_API_URL=http://localhost:5180

echo ""
echo "Iniciando el servidor de desarrollo..."
echo "El frontend estará disponible en: http://localhost:5173"
echo "Backend configurado en: $VITE_API_URL"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""

npm run dev

