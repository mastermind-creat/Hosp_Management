<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create or get Admin Role
        $adminRole = Role::where('name', 'admin')->first();

        // 2. Create Default Admin User
        $adminUser = User::firstOrCreate(
            ['username' => 'admin'],
            [
                'name' => 'System Administrator',
                'email' => 'admin@hospmanager.com',
                'password' => Hash::make('Admin@2026'),
                'employee_id' => 'EMP-2026-001',
                'is_active' => true,
            ]
        );

        // 4. Assign Admin Role to User
        $adminUser->roles()->sync([$adminRole->id]);
    }
}
