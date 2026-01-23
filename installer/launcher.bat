@echo off
setlocal

:: Define paths
set APP_DIR=%~dp0
set PHP_EXE=%APP_DIR%php\php.exe
set BACKEND_DIR=%APP_DIR%backend
set FRONTEND_EXE=%APP_DIR%HospitalManager2026.exe

:: Check if PHP exists
if not exist "%PHP_EXE%" (
    echo Error: PHP runtime not found at %PHP_EXE%
    pause
    exit /b 1
)

:: Check if backend exists
if not exist "%BACKEND_DIR%" (
    echo Error: Backend directory not found at %BACKEND_DIR%
    pause
    exit /b 1
)

:: Kill existing PHP processes on port 8000 (optional but recommended for local dev/restarts)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do taskkill /F /PID %%a >nul 2>&1

:: Start Laravel Backend using bundled PHP
echo Starting Backend Server...
start /B "" "%PHP_EXE%" -S localhost:8000 -t "%BACKEND_DIR%\public"

:: Wait for a few seconds to ensure backend is starting
timeout /t 3 /nobreak >nul

:: Start the Tauri Frontend
echo Launching Hospital Manager 2026...
start "" "%FRONTEND_EXE%"

echo Application is running.
exit /b 0
