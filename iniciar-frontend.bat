@echo off
echo ========================================
echo Iniciando MoveSys Frontend
echo ========================================
echo.

cd /d "%~dp0"
echo Directorio actual: %CD%
echo.

if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: No se pudieron instalar las dependencias
        pause
        exit /b 1
    )
    echo.
)

echo Configurando URL del backend...
set VITE_API_URL=http://localhost:5180

echo.
echo Iniciando el servidor de desarrollo...
echo El frontend estara disponible en: http://localhost:5173
echo Backend configurado en: %VITE_API_URL%
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

call npm run dev

pause

