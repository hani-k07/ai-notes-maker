@echo off
title AI Study Suite - Unified Launcher
echo ==========================================
echo     Starting AI Study Suite...
echo ==========================================

:: 1. Clean up existing processes
echo Cleaning up old sessions...
taskkill /f /im ai_notes_server.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1

:: 2. Ensure Backend is built
echo Checking Backend build...
if not exist "backend\\build\\Debug\\ai_notes_server.exe" (
    echo Backend executable not found. Building now...
    cd backend
    if not exist "build" mkdir build
    cd build
    cmake ..
    cmake --build .
    cd ../..
) else (
    echo Backend binary found.
)

:: 3. Launch Backend
echo [1/3] Launching AI Core (Backend)...
start "AI Study Suite - Backend" /min "backend\\build\\Debug\\ai_notes_server.exe"

:: 4. Launch Frontend
echo [2/3] Starting Frontend Server...
start "AI Study Suite - Vite" /min cmd /c "cd frontend && npm run dev"

:: 5. Wait for warm-up
echo [3/3] Waiting for interface to initialize...
timeout /t 10 /nobreak > nul

:: 6. Launch Electron Window
echo Launching Application Window...
cd frontend
start "" npm run electron

echo.
echo ==========================================
echo   Application is now running!
echo   Check http://localhost:5173 in your browser.
echo ==========================================
timeout /t 5 > nul
