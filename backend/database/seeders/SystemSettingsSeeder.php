<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SystemSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            [
                'key' => 'system_language',
                'value' => 'en',
                'type' => 'select',
                'group' => 'system',
                'label' => 'System Language',
                'description' => 'Default language for the application.',
                'options' => json_encode([
                    ['label' => 'English', 'value' => 'en'],
                    ['label' => 'Swahili', 'value' => 'sw'],
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'timezone',
                'value' => 'Africa/Nairobi',
                'type' => 'select',
                'group' => 'system',
                'label' => 'Timezone',
                'description' => 'Global timezone for the hospital.',
                'options' => json_encode([
                    ['label' => 'Africa/Nairobi', 'value' => 'Africa/Nairobi'],
                    ['label' => 'UTC', 'value' => 'UTC'],
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];

        foreach ($settings as $setting) {
            \Illuminate\Support\Facades\DB::table('settings')->updateOrInsert(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
