@echo off
title AI Study Suite - Launcher
echo ==========================================
echo     Launching AI Study Suite App...
echo ==========================================

:: Clean up existing processes to avoid port conflicts
echo Cleaning up old sessions...
taskkill /f /im ai_notes_server.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1

:: 1. Start the C++ Backend
echo [1/3] Launching AI Core (Backend)...
if exist "backend\build\Debug\ai_notes_server.exe" (
    start "AI Study Suite - Backend" /min "backend\build\Debug\ai_notes_server.exe"
) else (
    echo [ERROR] Backend executable not found. Please run setup_app.bat first.
    pause
    exit /b
)

:: 2. Start the Vite Dev Server (Frontend)
echo [2/3] Starting Frontend Server...
start "AI Study Suite - Vite" /min cmd /c "cd frontend && npm run dev"

:: 3. Wait for Vite to warm up
echo [3/3] Waiting for interface to initialize...
timeout /t 10 /nobreak > nul

:: 4. Launch Electron Window
echo Launching Application Window...
cd frontend
start "" npm run electron

echo.
echo ==========================================
echo   Application is now running!
echo   If the window doesn't appear, ensure
echo   you ran setup_app.bat first.
echo ==========================================
timeout /t 3 > nul
