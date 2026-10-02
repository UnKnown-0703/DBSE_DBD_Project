# Get project root location
$ProjectDir = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }

Write-Host "===============================================" -ForegroundColor Green
Write-Host "  Starting College ERP Dashbord Project...     " -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Read DB_PORT from server/.env to decide if we start local DB
$EnvFile = Join-Path $ProjectDir "server\.env"
$DbPort = "3306"
if (Test-Path $EnvFile) {
    $EnvContent = Get-Content $EnvFile
    foreach ($Line in $EnvContent) {
        if ($Line -match "^DB_PORT\s*=\s*(.*)") {
            $DbPort = $Matches[1].Trim()
        }
    }
}

if ($DbPort -eq "3307") {
    Write-Host "[1/3] Launching MySQL Database on Port 3307..." -ForegroundColor Cyan
    & (Join-Path $ProjectDir "run-db.ps1")
} else {
    Write-Host "[1/3] Using system MySQL service on Port 3306 (Skipping custom database)..." -ForegroundColor Cyan
}

# 2. Launch Backend Node/Express server in a new window
Write-Host "[2/3] Launching Backend Express Server in new window..." -ForegroundColor Cyan
$ServerDir = Join-Path $ProjectDir "server"
Start-Process powershell -WorkingDirectory $ServerDir -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", "node index.js"

# 3. Launch Frontend React/Vite server in a new window
Write-Host "[3/3] Launching Frontend React Client in new window..." -ForegroundColor Cyan
$ClientDir = Join-Path $ProjectDir "client"
Start-Process powershell -WorkingDirectory $ClientDir -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", "node node_modules/vite/bin/vite.js"

Write-Host "-----------------------------------------------" -ForegroundColor Green
Write-Host "All components launched successfully!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "Backend:  http://127.0.0.1:5000" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
