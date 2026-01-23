# Hospital Manager 2026 - Installation & Deployment Guide

This guide provides instructions on how to install and deploy the Hospital Manager 2026 application on a Windows environment.

## 1. Prerequisites for Installation
- **Operating System**: Windows 10 or later (64-bit).
- **Disk Space**: At least 500MB of free space.
- **Permissions**: Administrative privileges are required to run the installer.

## 2. Installation Process

### Using the Automated Installer
1. Obtain the `HospitalManager_Setup.exe` installer from the official [GitHub Releases](https://github.com/mastermind-creat/Hosp_Management/releases) page or your organization's distribution channel.
2. Double-click the installer to start the setup wizard.
3. Follow the on-screen instructions:
    - Accept the license agreement (if applicable).
    - Choose the installation directory (default: `C:\Program Files\Hospital Manager 2026`).
    - Select whether to create a desktop shortcut.
4. Click **Install**.
5. During installation, the system will automatically:
    - Extract the application files.
    - Setup the bundled PHP runtime.
    - Initialize the local SQLite database.
    - Run initial migrations and seed basic data.
6. Once complete, click **Finish**.

### Manual Installation (Advanced)
If you prefer to set up the system manually (e.g., for specialized environments):
1. Extract the application files to your desired folder.
2. Ensure a PHP runtime is available in a `php/` subdirectory.
3. Run the `setup_env.ps1` script via PowerShell (Bypass execution policy if necessary):
   ```powershell
   powershell.exe -ExecutionPolicy Bypass -File .\setup_env.ps1
   ```
4. Start the application using `launcher.bat`.

## 3. Running the Application
- Use the **Desktop Shortcut** or the **Start Menu** entry to launch "Hospital Manager 2026".
- Alternatively, run `launcher.bat` directly from the installation folder.
- The launcher will start the backend server and open the desktop interface automatically.

## 4. Troubleshooting

### Application fails to launch
- Check if port **8000** is being used by another application.
- Look for error logs in `backend/storage/logs/laravel.log`.

### Database Errors
- Ensure the `backend/database` folder has write permissions.
- The initial setup script should have handled this, but you can manually verify if `database.sqlite` exists and is writable.

### PHP Runtime Not Found
- Ensure the `php/` folder exists in the installation directory and contains `php.exe`.

## 5. Updates
To update the application:
1. Run the new installer. It will overwrite the application files while preserving your data (as long as `database.sqlite` and `.env` are not manually deleted).
2. The installer will automatically run any new migrations.

---
© 2026 Hospital Manager Team. All rights reserved.
