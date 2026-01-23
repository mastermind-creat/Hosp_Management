# Hospital Manager 2026 - Release Creation Guide

This guide explains how to generate the final `HospitalManager_Setup.exe` installer for Windows. 

> [!IMPORTANT]
> Because this is a Windows desktop application with specific platform dependencies (Tauri, PHP), you MUST perform these steps on a **Windows** machine.

## Prerequisites
- **Node.js**: v18+
- **Rust**: [rustup.rs](https://rustup.rs/) (Stable)
- **PHP for Windows**: Download a thread-safe `.zip` of PHP 8.2+ from [windows.php.net](https://windows.php.net/download/).
- **Inno Setup**: Download and install from [jrsoftware.org](https://jrsoftware.org/isdl.php).
- **Composer**: [getcomposer.org](https://getcomposer.org/)

---

## Step 1: Prepare the PHP Runtime
1. Extract the downloaded PHP `.zip` into a folder named `php/` in the project root.
2. In the `php/` folder, rename `php.ini-production` to `php.ini`.
3. Open `php.ini` and uncomment/enable the following extensions:
   - `extension=curl`
   - `extension=mbstring`
   - `extension=openssl`
   - `extension=pdo_sqlite`
   - `extension=sqlite3`

## Step 2: Build the Frontend & Tauri App
Open a terminal in the project root:
```powershell
# Install frontend dependencies and build Tauri bundle
cd frontend
npm install
npm run tauri build
```
The compiled executable will be located at:
`frontend/src-tauri/target/release/HospitalManager2026.exe`

## Step 3: Prepare the Laravel Backend
From the project root:
```powershell
cd backend
composer install --optimize-autoloader --no-dev
# Clear any development data/configs
php artisan config:clear
php artisan cache:clear
```
Ensure the `backend/database/database.sqlite` file is removed or empty if you want a fresh install for users.

## Step 4: Generate the Installer
1. Open **Inno Setup Compiler**.
2. Open the script: `installer/hospital_manager.iss`.
3. Click `Build` -> `Compile` (or press `Ctrl+F9`).
4. Once finished, the installer will be in the `installer_output/` folder.

## Step 5: Test the Installer
1. Run the generated `HospitalManager_Setup.exe`.
2. Complete the installation.
3. Launch the application from the Desktop shortcut.
4. Verify that the backend starts and the UI loads correctly.

---
### Checklist for Every Release
- [ ] Version number updated in `frontend/src-tauri/tauri.conf.json`.
- [ ] Version number updated in `installer/hospital_manager.iss`.
- [ ] Database migrations are up to date.
- [ ] `backend/.env` is NOT included in the final package (the setup script handles this).
