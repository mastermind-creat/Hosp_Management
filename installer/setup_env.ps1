# Hospital Manager 2026 Environment Setup Script
# This script is called by the installer after files are extracted.

$AppDir = $PSScriptRoot
$BackendDir = Join-Path $AppDir "backend"
$PhpExe = Join-Path $AppDir "php\php.exe"
$DbFile = Join-Path $BackendDir "database\database.sqlite"
$EnvFile = Join-Path $BackendDir ".env"
$EnvExample = Join-Path $BackendDir ".env.example"

Write-Host "Setting up Hospital Manager 2026 environment..."

# 1. Create .env from .env.example if it doesn't exist
if (-not (Test-Path $EnvFile)) {
    if (Test-Path $EnvExample) {
        Copy-Item $EnvExample $EnvFile
        Write-Host "Created .env file from .env.example"
    } else {
        Write-Error "Error: .env.example not found in $BackendDir"
        exit 1
    }
}

# 2. Update .env for local SQLite
$envContent = Get-Content $EnvFile
$envContent = $envContent -replace '^DB_CONNECTION=.*', 'DB_CONNECTION=sqlite'
$envContent = $envContent -replace '^DB_DATABASE=.*', "DB_DATABASE=$DbFile"
$envContent = $envContent -replace '^APP_URL=.*', 'APP_URL=http://localhost:8000'
$envContent | Set-Content $EnvFile

# 3. Create SQLite database file if it doesn't exist
if (-not (Test-Path $DbFile)) {
    New-Item -Path $DbFile -ItemType File
    Write-Host "Created SQLite database file."
}

# 4. Generate Application Key if not set
if (Test-Path $PhpExe) {
    Write-Host "Generating application key..."
    Start-Process -FilePath $PhpExe -ArgumentList "$BackendDir\artisan key:generate --force" -Wait -NoNewWindow
    
    Write-Host "Running database migrations..."
    Start-Process -FilePath $PhpExe -ArgumentList "$BackendDir\artisan migrate --force" -Wait -NoNewWindow
    
    Write-Host "Seeding database..."
    Start-Process -FilePath $PhpExe -ArgumentList "$BackendDir\artisan db:seed --force" -Wait -NoNewWindow

    # Optimize Laravel
    Write-Host "Optimizing Laravel..."
    Start-Process -FilePath $PhpExe -ArgumentList "$BackendDir\artisan config:cache" -Wait -NoNewWindow
    Start-Process -FilePath $PhpExe -ArgumentList "$BackendDir\artisan route:cache" -Wait -NoNewWindow
    Start-Process -FilePath $PhpExe -ArgumentList "$BackendDir\artisan view:cache" -Wait -NoNewWindow
} else {
    Write-Error "Error: PHP executable not found at $PhpExe. Skipping migrations."
}

Write-Host "Environment setup complete!"
