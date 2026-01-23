<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DoctorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $doctorRole = Role::where('name', 'doctor')->first();

        if (!$doctorRole) {
            $this->command->error('Doctor role not found!');
            return;
        }

        $doctors = [
            [
                'name' => 'Dr. Jane Smith',
                'email' => 'jane.smith@hospital.com',
                'username' => 'jsmith',
                'employee_id' => 'DOC001',
            ],
            [
                'name' => 'Dr. John Doe',
                'email' => 'john.doe@hospital.com',
                'username' => 'jdoe',
                'employee_id' => 'DOC002',
            ],
            [
                'name' => 'Dr. Sarah Wilson',
                'email' => 'sarah.wilson@hospital.com',
                'username' => 'swilson',
                'employee_id' => 'DOC003',
            ],
        ];

        foreach ($doctors as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'username' => $data['username'],
                    'employee_id' => $data['employee_id'],
                    'password' => Hash::make('password123'),
                    'is_active' => true,
                ]
            );

            // Ensure the user has the doctor role
            if (!$user->roles->contains($doctorRole->id)) {
                $user->roles()->attach($doctorRole->id);
            }

            $this->command->info("Doctor seeded: {$data['name']}");
        }
    }
}
