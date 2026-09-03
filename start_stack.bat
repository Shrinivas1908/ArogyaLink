@echo off
echo ==========================================
echo ArogyaSetu — Local Development Stack
echo ==========================================

:: 1. Start Backend FastAPI
start "ArogyaSetu - Backend" cmd /k "cd backend && uvicorn app.main:app --reload --port 8000"
echo [OK] Started Backend FastAPI on port 8000

:: 2. Start Patient Kiosk React App
start "ArogyaSetu - Kiosk" cmd /k "cd apps/patient-kiosk && npm run dev"
echo [OK] Started Patient Kiosk on port 5173

:: 3. Start Doctor Dashboard React App
start "ArogyaSetu - Dashboard" cmd /k "cd apps/doctor-dashboard && npm run dev"
echo [OK] Started Doctor Dashboard on port 5174

:: 4. Start Doctor-Patient Website Portal
start "ArogyaSetu - Main Portal" cmd /k "cd apps/portal && npm run dev"
echo [OK] Started Doctor-Patient Portal on port 5175

echo ==========================================
echo All services launched in separate windows!
echo Backend health: http://localhost:8000/health
echo Patient Kiosk: http://localhost:5173
echo Doctor Dashboard: http://localhost:5174
echo Main Portal: http://localhost:5175
echo ==========================================
pause
