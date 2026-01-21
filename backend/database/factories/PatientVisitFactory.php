<?php

namespace Database\Factories;

use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PatientVisit>
 */
class PatientVisitFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'patient_id' => Patient::factory(),
            'visit_number' => 'VST-' . fake()->unique()->numerify('####'),
            'visit_date' => now(),
            'visit_type' => 'opd',
            'status' => 'active',
        ];
    }
}
