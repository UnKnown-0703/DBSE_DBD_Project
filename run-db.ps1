# PowerShell script to run a self-contained local MySQL instance

$ProjectDir = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
$DataDir = Join-Path $ProjectDir "db-data"

# Auto-detect MySQL binary location
$MySQLBinDir = "C:\Program Files\MySQL\MySQL Server 9.6\bin"
if (-not (Test-Path (Join-Path $MySQLBinDir "mysqld.exe"))) {
    $found = (Get-Command mysqld -ErrorAction SilentlyContinue)
    if ($found) {
        $MySQLBinDir = Split-Path $found.Source
    } else {
        $candidates = Get-ChildItem "C:\Program Files\MySQL" -Directory -Filter "MySQL Server*" -ErrorAction SilentlyContinue
        foreach ($dir in $candidates) {
            $bin = Join-Path $dir.FullName "bin"
            if (Test-Path (Join-Path $bin "mysqld.exe")) {
                $MySQLBinDir = $bin
                break
            }
        }
    }
}
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

# Start MySQL Server on port 3307
Write-Host "Starting MySQL Server on localhost:3307..."
# Run it using Start-Process so it runs in the background and doesn't block the shell
Start-Process -FilePath $MySQLd -ArgumentList "--datadir=`"$DataDir`" --port=3307 --mysqlx=OFF --console" -NoNewWindow

# Wait until MySQL port 3307 is ready (up to 12 seconds)
Write-Host "Waiting for MySQL server to be ready on port 3307..."
for ($i = 0; $i -lt 12; $i++) {
    Start-Sleep -Seconds 1
    if (Test-NetConnection -ComputerName 127.0.0.1 -Port 3307 -InformationLevel Quiet -WarningAction SilentlyContinue) {
        break
    }
}

# Set password to 'root' if it's currently empty
Write-Host "Checking database credentials..."
& $MySQL -h 127.0.0.1 -P 3307 -u root --skip-password -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'root'; FLUSH PRIVILEGES;" 2>$null

# Test connection using the password 'root'
Write-Host "Verifying database connection..."
& $MySQL -h 127.0.0.1 -P 3307 -u root -proot -e "show databases;"

if ($LASTEXITCODE -eq 0) {
    Write-Host "MySQL Server started successfully and is running on 127.0.0.1:3307 (User: root / Password: root)."
} else {
    Write-Warning "Could not connect to MySQL server. Please check the logs."
}
