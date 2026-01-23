<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Seeder;

class CompositeRoleSeeder extends Seeder
{
    /**
     * Seed composite roles for multi-role mode.
     */
    public function run(): void
    {
        // Hospital Officer - for small clinics (all non-clinical permissions)
        $hospitalOfficer = Role::firstOrCreate(
            ['name' => 'hospital_officer'],
            [
                'display_name' => 'Hospital Officer',
                'description' => 'Multi-role user for small hospitals - handles reception, billing, and admin tasks.',
            ]
        );

        $officerPermissions = Permission::whereIn('name', [
            'view_patients',
            'create_patients',
            'edit_patients',
            'view_visits',
            'create_visits',
            'view_invoices',
            'create_invoices',
            'record_payments',
            'view_appointments',
            'create_appointments',
            'view_reports',
        ])->get();

        $hospitalOfficer->permissions()->sync($officerPermissions);

        // Clinic Manager - for compact mode (all permissions except user management)
        $clinicManager = Role::firstOrCreate(
            ['name' => 'clinic_manager'],
            [
                'display_name' => 'Clinic Manager',
                'description' => 'Full access for small clinic operations - can perform all clinical and administrative tasks.',
            ]
        );

        $managerPermissions = Permission::whereNotIn('name', [
            'manage_roles',
            'delete_users',
        ])->get();

        $clinicManager->permissions()->sync($managerPermissions);

        // Clinical Assistant - nurse + pharmacy + lab
        $clinicalAssistant = Role::firstOrCreate(
            ['name' => 'clinical_assistant'],
            [
                'display_name' => 'Clinical Assistant',
                'description' => 'Multi-role clinical support - handles vitals, pharmacy, and lab tasks.',
            ]
        );

        $assistantPermissions = Permission::whereIn('name', [
            'view_patients',
            'view_visits',
            'record_vitals',
            'dispense_drugs',
            'view_drugs',
            'view_lab_requests',
            'enter_lab_results',
        ])->get();

        $clinicalAssistant->permissions()->sync($assistantPermissions);

        $this->command->info('Composite roles seeded successfully!');
    }
}
