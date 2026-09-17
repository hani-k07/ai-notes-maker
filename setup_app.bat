@echo off
title AI Study Suite - Setup
echo ==========================================
echo     Setting up AI Study Suite...
echo ==========================================

echo [1/2] Installing Frontend Dependencies...
cd frontend
call npm install
call npm install electron --save-dev

echo [2/2] Ensuring Backend is build...
cd ..
if not exist "backend\build\Debug\ai_notes_server.exe" (
    echo Backend not found. Attempting to build...
    cd backend
    mkdir build 2>nul
    cd build
    cmake ..
    cmake --build .
    cd ../..
)

echo.
echo ==========================================
echo   Setup Complete! You can now run run_app.bat
echo ==========================================
pause
