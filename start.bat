@echo off
setlocal

echo ========================================================
echo    Starting Zoho CRM Widget Studio
echo ========================================================

:: Check Node.js installation
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in PATH. Please install Node.js v18 or later.
    pause
    exit /b 1
)

:: Ensure build exists
if not exist "server\dist\index.js" (
    echo [BUILD] Building shared libraries and server...
    call npm run build
)

:: Set default environment
set PORT=3001
set HOST=127.0.0.1
set NODE_ENV=production

echo [INFO] Server starting at http://%HOST%:%PORT%
echo [INFO] Press Ctrl+C to stop the studio.

:: Start server
node server\dist\index.js

pause
