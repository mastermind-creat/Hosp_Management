<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'admin',
                'display_name' => 'Administrator',
                'description' => 'Full access to all system modules and settings.',
            ],
            [
                'name' => 'doctor',
                'display_name' => 'Medical Doctor',
                'description' => 'Access to clinical records, prescriptions, and patient visits.',
            ],
            [
                'name' => 'nurse',
                'display_name' => 'Nurse',
                'description' => 'Access to patient vitals, admissions, and treatment notes.',
            ],
            [
                'name' => 'pharmacist',
                'display_name' => 'Pharmacist',
                'description' => 'Access to pharmacy inventory and dispensing.',
            ],
            [
                'name' => 'lab_tech',
                'display_name' => 'Lab Technician',
                'description' => 'Access to laboratory test requests and results.',
            ],
            [
                'name' => 'accountant',
                'display_name' => 'Accountant',
                'description' => 'Access to billing, payments, and financial reports.',
            ],
            [
                'name' => 'receptionist',
                'display_name' => 'Receptionist',
                'description' => 'Access to patient registration and appointment scheduling.',
            ],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role['name']], $role);
        }
    }
}
