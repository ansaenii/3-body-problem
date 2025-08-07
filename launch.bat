@echo off
echo Starting 3-Body Problem Simulation...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed or not in PATH.
    echo Please install Python from https://python.org
    echo.
    pause
    exit /b 1
)

REM Check if we're in the correct directory
if not exist "index.html" (
    echo Error: index.html not found in current directory.
    echo Please run this script from the 3-body-problem folder.
    echo.
    pause
    exit /b 1
)

echo Starting local server on http://localhost:8000
echo.
echo The simulation will open automatically in your browser.
echo To stop the server, press Ctrl+C in this window.
echo.

REM Start Python HTTP server in background and open browser
start "" http://localhost:8000
python -m http.server 8000

echo.
echo Server stopped.
pause
