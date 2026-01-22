# Hospital Manager 2026 - Build & Deployment Guide

## 1. Prerequisites
- **Node.js** v18+
- **PHP** v8.1+
- **Composer** v2+

## 2. Frontend Build
The frontend is a React application that needs to be compiled into static assets.

```bash
cd frontend
npm install
npm run build
```
*Output*: The compiled files will be in `frontend/dist`.

## 3. Backend Preparation
The backend is a Laravel application. Optimization is key for production.

```bash
cd backend
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 4. Packaging the Release
For an offline-first deployment, we bundle the entire stack.

### Folder Structure
Create a release folder `HospitalManager_v1.0.0/` with:
- `backend/` (The optimized Laravel app)
- `frontend/dist/` (The compiled React assets)
- `php/` (Bundled PHP runtime for Windows, if using portable XAMPP/PHP)
- `launcher.bat` (A script to start PHP server + serve Frontend)

### Launcher Script Example (Windows)
```batch
@echo off
start /B php\php.exe -S localhost:8000 -t backend/public
start http://localhost:8000
```

## 5. Database
- Ensure `backend/database/database.sqlite` is empty or contains only seed data (Roles, Admin User).
- Run migrations on the target machine if needed, or ship with a pre-migrated SQLite file.

## 6. Installer (Inno Setup)
Use Inno Setup to create a single `.exe` file that:
1. Extracts the folder structure to `C:\Program Files\HospitalManager`.
2. Creates a Desktop Shortcut to `launcher.bat`.
3. Sets directory permissions for `storage/` and `database/` to allow writing.

## 7. Updates
For updates:
1. Replace `backend/app`, `backend/resources`, and `frontend/dist`.
2. **DO NOT** replace `database.sqlite` or `.env`.
3. Run `php artisan migrate --force` to apply schema changes.
