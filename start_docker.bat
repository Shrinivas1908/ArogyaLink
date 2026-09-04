@echo off
echo ========================================================
echo   ArogyaSetu — Production Docker Stack Launch
echo ========================================================
echo.
echo 1. Checking Docker engine status...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker daemon is not running. Please start Docker Desktop and retry.
    pause
    exit /b 1
)

echo [OK] Docker daemon is active.
echo.
echo 2. Building images and spinning up all containers...
docker compose up --build -d

echo.
echo ========================================================
echo  All ArogyaSetu services are starting up!
echo ========================================================
echo  - PostgreSQL Database:  localhost:5432
echo  - FastAPI Backend:       http://localhost:8000
echo  - Backend Docs:          http://localhost:8000/docs
echo  - Patient Kiosk:         http://localhost:5173
echo  - Doctor Dashboard:      http://localhost:5174
echo  - Main Web Portal:       http://localhost:5175
echo ========================================================
echo.
echo Use 'docker compose logs -f' to follow container logs.
echo Use 'docker compose down' to stop all services.
echo.
pause
