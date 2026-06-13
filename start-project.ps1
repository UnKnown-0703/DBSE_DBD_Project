# Get project root location
$ProjectDir = Get-Location

Write-Host "===============================================" -ForegroundColor Green
Write-Host "  Starting College ERP Dashbord Project...     " -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# 1. Start MySQL Database
Write-Host "[1/3] Launching MySQL Database..." -ForegroundColor Cyan
& (Join-Path $ProjectDir "run-db.ps1")

# 2. Launch Backend Node/Express server in a new window
Write-Host "[2/3] Launching Backend Express Server in new window..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$ProjectDir\server`"; npm run dev"

# 3. Launch Frontend React/Vite server in a new window
Write-Host "[3/3] Launching Frontend React Client in new window..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$ProjectDir\client`"; npm run dev"

Write-Host "-----------------------------------------------" -ForegroundColor Green
Write-Host "All components launched successfully!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "Backend:  http://127.0.0.1:5000" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
