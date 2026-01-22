<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            // User & RBAC Management
            ['name' => 'view_users', 'display_name' => 'View Users', 'module' => 'users'],
            ['name' => 'create_users', 'display_name' => 'Create Users', 'module' => 'users'],
            ['name' => 'edit_users', 'display_name' => 'Edit Users', 'module' => 'users'],
            ['name' => 'delete_users', 'display_name' => 'Delete Users', 'module' => 'users'],
            ['name' => 'manage_roles', 'display_name' => 'Manage Roles & Permissions', 'module' => 'users'],

            // Patient Management
            ['name' => 'view_patients', 'display_name' => 'View Patients', 'module' => 'patients'],
            ['name' => 'create_patients', 'display_name' => 'Register Patients', 'module' => 'patients'],
            ['name' => 'edit_patients', 'display_name' => 'Edit Patients', 'module' => 'patients'],
            ['name' => 'delete_patients', 'display_name' => 'Delete Patients', 'module' => 'patients'],

            // Clinical Management
            ['name' => 'view_visits', 'display_name' => 'View Patient Visits', 'module' => 'clinical'],
            ['name' => 'create_visits', 'display_name' => 'Create OPD/IPD Visits', 'module' => 'clinical'],
            ['name' => 'record_vitals', 'display_name' => 'Record Vitals', 'module' => 'clinical'],
            ['name' => 'record_diagnosis', 'display_name' => 'Record Diagnosis', 'module' => 'clinical'],
            ['name' => 'prescribe_drugs', 'display_name' => 'Prescribe Medications', 'module' => 'clinical'],
            ['name' => 'manage_admissions', 'display_name' => 'Manage IPD Admissions', 'module' => 'clinical'],

            // Billing & Financials
            ['name' => 'view_invoices', 'display_name' => 'View Invoices', 'module' => 'billing'],
            ['name' => 'create_invoices', 'display_name' => 'Generate Invoices', 'module' => 'billing'],
            ['name' => 'record_payments', 'display_name' => 'Record Payments', 'module' => 'billing'],
            ['name' => 'void_transactions', 'display_name' => 'Void Invoices/Payments', 'module' => 'billing'],
            ['name' => 'view_financial_reports', 'display_name' => 'View Financial Reports', 'module' => 'billing'],

            // Pharmacy Management
            ['name' => 'view_drugs', 'display_name' => 'View Drug Inventory', 'module' => 'pharmacy'],
            ['name' => 'manage_drugs', 'display_name' => 'Manage Drug Catalog', 'module' => 'pharmacy'],
            ['name' => 'manage_stock', 'display_name' => 'Manage Stock In/Out', 'module' => 'pharmacy'],
            ['name' => 'dispense_drugs', 'display_name' => 'Dispense Medications', 'module' => 'pharmacy'],

            // Laboratory Management
            ['name' => 'view_lab_requests', 'display_name' => 'View Lab Requests', 'module' => 'laboratory'],
            ['name' => 'request_tests', 'display_name' => 'Order Lab Tests', 'module' => 'laboratory'],
            ['name' => 'enter_lab_results', 'display_name' => 'Enter Lab Results', 'module' => 'laboratory'],
            ['name' => 'verify_lab_results', 'display_name' => 'Verify Lab Results', 'module' => 'laboratory'],

            // Reporting
            ['name' => 'view_reports', 'display_name' => 'View System Reports', 'module' => 'reports'],
            ['name' => 'export_reports', 'display_name' => 'Export Reports (PDF/Excel)', 'module' => 'reports'],

            // Audit
            ['name' => 'view_audit_trail', 'display_name' => 'View Audit Trail', 'module' => 'audit'],

            // Staff & HR Management
            ['name' => 'manage_staff', 'display_name' => 'Manage Staff Records', 'module' => 'staff'],
            ['name' => 'manage_departments', 'display_name' => 'Manage Departments', 'module' => 'staff'],
            ['name' => 'manage_designations', 'display_name' => 'Manage Designations', 'module' => 'staff'],

            // Appointment & Scheduling
            ['name' => 'view_appointments', 'display_name' => 'View Appointments', 'module' => 'appointments'],
            ['name' => 'create_appointments', 'display_name' => 'Book Appointments', 'module' => 'appointments'],
            ['name' => 'manage_schedules', 'display_name' => 'Manage Doctor Schedules', 'module' => 'appointments'],

            // Insurance / SHIF Handling
            ['name' => 'manage_insurance', 'display_name' => 'Manage Insurance Providers', 'module' => 'insurance'],
            ['name' => 'view_insurance_claims', 'display_name' => 'View Insurance Claims', 'module' => 'insurance'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission['name']], $permission);
        }
    }
}
