# Hospital Manager 2026: System Architecture & Documentation

## 1. System Architecture Overview
The system follows a **Decoupled Offline-First Architecture**. It consists of a React-based single-page application (SPA) served by a local PHP Laravel backend, all packaged within a **Tauri** desktop wrapper for Windows.

### Tech Stack
- **Frontend**: React + Tailwind CSS + Framer Motion.
- **Backend**: PHP 8.3 + Laravel (MVC).
- **Desktop Wrapper**: Tauri (Rust-based, native Windows webview).
- **Database**: 
  - **Primary**: SQLite (Zero-configuration, single-file database for offline reliability).
  - **Enterprise**: SQL Server Express support via Laravel's database abstraction layer.
- **Reporting**: PDF generation using TCPDF.

## 2. Module Breakdown
### Core Modules
1.  **User & RBAC**: Manage staff accounts with fixed roles (Admin, Doctor, Nurse, etc.) and granular permissions.
2.  **Patient Management**: Centralized registration with unique UUIDs for global data integrity.
3.  **Clinical Management**: Unified encounter flow (OPD/IPD), vitals tracking, and diagnostic history.
4.  **Billing & Finance**: (Critical) Invoice generation, inventory-linked drug billing, and automated payment reconciliation.
5.  **Pharmacy & Inventory**: Batch-level stock management with automatic deduction and reorder alerts.
6.  **Laboratory**: Test request lifecycle management from sampling to results entry.
7.  **Reporting**: Daily revenue, drug usage, and patient traffic analytics.

## 3. Database Schema (Highlights)
Transactions use **UUIDs (v4)** to ensure that when local databases eventually sync with a central server, no primary key collisions occur.

### Key Tables
- `users`: Staff credentials and metadata.
- `patients`: Master patient index.
- `invoices` & `invoice_items`: Immutable financial records.
- `drug_batches`: Inventory tracking at the lot/batch level.
- `test_requests`: Lab workflow coordination.
- `audit_logs`: Detailed trail of all state-changing operations.

## 4. Security & Permission Model
- **Authentication**: JWT (JSON Web Tokens) for stateless, secure local communication.
- **Auth Flow**: Secure bcrypt password hashing.
- **RBAC**: Middleware-enforced permissions on every API route.
- **Audit Logging**: Catch-all middleware logs the `Who, What, When, and Where` of every transaction.

## 5. Sync Mechanism Design (Optional Agent)
The system is designed for a **Pull-summarize, Push-detailed** sync strategy:
- **Local Source of Truth**: The local SQLite database is always right.
- **Sync Agent**: A background worker that periodically pushes transaction logs and pulls configuration/pricing updates via a REST API.
- **Conflict Resolution**: Local clinical data always wins to prioritize patient safety over server consistency.

## 6. Deployment Strategy
- **Format**: All-in-one `.exe` Windows Installer.
- **Components**: The installer bundles the PHP runtime, the SQLite engine, and the Tauri binary.
- **Updates**: Tauri's built-in updater handles frontend patches, while Laravel migrations handle schema evolutions.

## 7. Quality Standards
- **Production-Ready**: Strictly typed models, comprehensive E2E tests, and modular service-layer logic.
- **Offline Reliability**: No external font/CSS/JS CDNs; all assets are bundled locally.
