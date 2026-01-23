# Hospital Manager 2026

**Version**: 1.0.0  
**Status**: In Development

## Overview

Hospital Manager 2026 is an offline-first, enterprise-grade Windows desktop application for comprehensive hospital administration and financial accounting. The system operates fully without internet connectivity, with optional synchronization capabilities for multi-site deployments.

> [!IMPORTANT]
> For production installation and deployment, please follow the [Installation & Deployment Guide](docs/INSTALLATION_GUIDE.md).

## Technology Stack

- **Frontend**: React 18+ with Tailwind CSS
- **Desktop Wrapper**: Tauri (Rust-based, Windows target)
- **Backend**: PHP with Laravel 10+
- **Database**: SQLite (single-PC) / SQL Server Express (multi-user LAN)
- **Authentication**: JWT tokens with bcrypt password hashing
- **Reporting**: PDF (TCPDF) and Excel (PhpSpreadsheet)

## Features

### Core Modules

1. **User & Role Management**
   - Secure authentication and authorization
   - Role-based access control (RBAC)
   - 7 predefined roles: Admin, Doctor, Nurse, Pharmacist, Lab Technician, Accountant, Receptionist
   - Complete audit trail

2. **Patient Management**
   - Patient registration with unique patient numbers
   - Advanced search capabilities
   - Visit history tracking
   - Insurance/NHIF integration

3. **Clinical Management**
   - OPD (Outpatient) visits
   - IPD (Inpatient) admissions and discharges
   - Diagnosis recording
   - Treatment notes and prescriptions
   - Vitals tracking

4. **Billing & Financial Accounting**
   - Service and drug billing
   - Invoice generation
   - Payment processing (cash, insurance, card, mobile money)
   - Debtors management
   - Daily cash summaries (Z-reports)
   - Immutable financial records

5. **Pharmacy & Inventory**
   - Drug catalog management
   - Batch and expiry tracking
   - Stock in/out operations
   - Automatic stock deduction on dispensing
   - Supplier management
   - Low-stock and expiry alerts

6. **Laboratory Module**
   - Test catalog
   - Test request management
   - Sample tracking
   - Result entry and verification
   - Patient result history

7. **Reporting & Analytics**
   - Daily revenue reports
   - Patient statistics
   - Drug usage reports
   - Department performance metrics
   - PDF and Excel export

## Project Structure

```
Hosp_Management/
├── src-tauri/              # Tauri desktop wrapper
├── frontend/               # React application
├── backend/                # Laravel backend
├── database/               # Migrations and seeders
├── docs/                   # Documentation
└── installer/              # Windows installer scripts
```

## Prerequisites

- **Node.js**: v18+ (for frontend)
- **PHP**: v8.1+ (for backend)
- **Composer**: Latest version
- **Rust**: Latest stable (for Tauri)
- **Database**: SQLite 3 or SQL Server Express 2022

## Installation

### Development Setup

1. **Clone the repository**
   ```bash
   cd /opt/lampp/htdocs/Hosp_Management
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   composer install
   ```

4. **Configure environment**
   ```bash
   cd backend
   cp .env.example .env
   php artisan key:generate
   ```

5. **Run migrations**
   ```bash
   php artisan migrate --seed
   ```

6. **Start development servers**
   ```bash
   # Terminal 1: Backend
   cd backend
   php artisan serve --port=8080

   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

### Production Deployment

Run the Windows installer: `HospitalManager2026_Setup.exe`

## Default Credentials

- **Username**: `admin`
- **Password**: `Admin@2026`

**⚠️ Change the default password immediately after first login!**

## Architecture Highlights

### Offline-First Design
- All operations work without internet
- Local database as source of truth
- Optional background sync when online

### Security
- JWT-based authentication
- bcrypt password hashing (cost factor 12)
- Role-based permissions
- Complete audit logging
- Session timeouts

### Database Design
- 30+ normalized tables
- UUID primary keys for sync compatibility
- Soft deletes for data preservation
- Immutable financial records
- Comprehensive indexing

## API Documentation

See [API Documentation](docs/api_documentation.md) for complete endpoint reference.

## Database Schema

See [Database Schema](docs/database_schema.md) for complete table structure.

## Contributing

This is an enterprise project. For development guidelines, see [CONTRIBUTING.md](docs/CONTRIBUTING.md).

## License

Proprietary - All Rights Reserved

## Support

For technical support, contact the development team.

---

**Built with ❤️ for healthcare professionals**
