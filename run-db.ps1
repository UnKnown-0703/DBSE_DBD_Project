# PowerShell script to run a self-contained local MySQL instance

$ProjectDir = Get-Location
$DataDir = Join-Path $ProjectDir "db-data"
$MySQLBinDir = "C:\Program Files\MySQL\MySQL Server 9.6\bin"
$MySQLd = Join-Path $MySQLBinDir "mysqld.exe"
$MySQL = Join-Path $MySQLBinDir "mysql.exe"

Write-Host "Project Directory: $ProjectDir"
Write-Host "Database Directory: $DataDir"

# Create database folder if it doesn't exist
if (-not (Test-Path $DataDir)) {
    New-Item -ItemType Directory -Path $DataDir | Out-Null
    Write-Host "Created db-data directory."
}

# Initialize MySQL data directory if empty (doesn't contain mysql system schema folder)
$SystemDbPath = Join-Path $DataDir "mysql"
if (-not (Test-Path $SystemDbPath)) {
    Write-Host "Initializing MySQL data directory (this may take a few seconds)..."
    & $MySQLd --initialize-insecure --datadir="$DataDir" --console
    Write-Host "MySQL data directory initialized."
} else {
    Write-Host "MySQL database already initialized."
}

# Start MySQL Server on port 3306
Write-Host "Starting MySQL Server on localhost:3306..."
# Run it using Start-Process so it runs in the background and doesn't block the shell
Start-Process -FilePath $MySQLd -ArgumentList "--datadir=`"$DataDir`" --port=3306 --mysqlx=OFF --console" -NoNewWindow

# Wait 3 seconds for it to start
Start-Sleep -Seconds 3

# Test if port is listening
Write-Host "Verifying database connection..."
& $MySQL -h 127.0.0.1 -P 3306 -u root -e "show databases;"

if ($LASTEXITCODE -eq 0) {
    Write-Host "MySQL Server started successfully and is running on 127.0.0.1:3306."
} else {
    Write-Warning "Could not connect to MySQL server. Please check the logs."
}
