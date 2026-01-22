<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Reset admin password
$user = App\Models\User::where('email', 'admin@hospmanager.com')->first();
if ($user) {
    $user->password = Hash::make('password');
    $user->save();
    echo "✓ Admin password reset\n";
}

// Create a test patient
$patient = App\Models\Patient::create([
    'first_name' => 'John',
    'last_name' => 'Doe',
    'date_of_birth' => '1990-01-01',
    'gender' => 'male',
    'phone' => '0700123456',
    'patient_number' => 'PAT-' . strtoupper(Str::random(8)),
    'insurance_type' => 'none',
]);

echo "✓ Created patient: {$patient->first_name} {$patient->last_name} (#{$patient->patient_number})\n";
echo "✓ Total patients in DB: " . App\Models\Patient::count() . "\n";
