Write-Host "Starting 3-Body Problem Simulation..." -ForegroundColor Green
Write-Host ""

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Found Python: $pythonVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Python is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Python from https://python.org" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if we're in the correct directory
if (-not (Test-Path "index.html")) {
    Write-Host "Error: index.html not found in current directory." -ForegroundColor Red
    Write-Host "Please run this script from the 3-body-problem folder." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Starting local server on http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "The simulation will open automatically in your browser." -ForegroundColor Green
Write-Host "To stop the server, press Ctrl+C in this window." -ForegroundColor Yellow
Write-Host ""

# Start Python HTTP server and open browser
Start-Process "http://localhost:8000"
python -m http.server 8000

Write-Host ""
Write-Host "Server stopped." -ForegroundColor Green
Read-Host "Press Enter to exit"
