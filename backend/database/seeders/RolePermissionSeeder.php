<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define Role -> Permission mappings based on PRD
        $mappings = [
            'admin' => null, // Special case: gets everything
            
            'receptionist' => [
                'view_patients', 'create_patients', 'edit_patients',
                'view_appointments', 'create_appointments', 'view_users',
                'create_visits', 'view_visits', 'view_reports'
            ],
            
            'doctor' => [
                'view_patients', 'view_visits', 'view_users',
                'record_vitals', 'record_diagnosis', 'prescribe_drugs',
                'request_tests', 'view_lab_requests', 'manage_admissions',
                'view_reports'
            ],
            
            'nurse' => [
                'view_patients', 'view_visits',
                'record_vitals', 'manage_admissions', 'view_reports'
            ],
            
            'lab_tech' => [
                'view_lab_requests', 'enter_lab_results', 'verify_lab_results',
                'view_patients', 'view_reports'
            ],
            
            'pharmacist' => [
                'view_drugs', 'dispense_drugs', 'manage_stock',
                'view_patients', 'view_visits', 'view_reports'
            ],
            
            'accountant' => [
                'view_invoices', 'record_payments', 'view_financial_reports',
                'view_reports', 'view_patients', 'view_visits'
            ],
        ];

        foreach ($mappings as $roleName => $permissionNames) {
            $role = Role::where('name', $roleName)->first();
            if (!$role) continue;

            if ($roleName === 'admin') {
                // Admin gets everything EXCEPT clinical participation, dispensing, and entering lab results
                $excluded = [
                    'record_vitals', 'record_diagnosis', 'prescribe_drugs',
                    'dispense_drugs', 'enter_lab_results', 'verify_lab_results'
                ];
                $permissions = Permission::whereNotIn('name', $excluded)->get();
                $role->permissions()->sync($permissions->pluck('id'));
            } else {
                $permissions = Permission::whereIn('name', $permissionNames)->get();
                $role->permissions()->sync($permissions->pluck('id'));
            }
        }
    }
}
