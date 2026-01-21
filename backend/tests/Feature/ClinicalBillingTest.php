<?php

namespace Tests\Feature;

use App\Models\Patient;
use App\Models\PatientVisit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class ClinicalBillingTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $token;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->seed(\Database\Seeders\PermissionSeeder::class);
        $this->seed(\Database\Seeders\RoleSeeder::class);
        $this->seed(\Database\Seeders\AdminUserSeeder::class);

        $this->user = User::factory()->create();
        $adminRole = \App\Models\Role::where('name', 'admin')->first();
        $this->user->roles()->attach($adminRole->id);

        $this->token = JWTAuth::fromUser($this->user);
    }

    public function test_can_record_vitals_and_diagnosis()
    {
        $patient = Patient::factory()->create();
        $visit = PatientVisit::create([
            'patient_id' => $patient->id,
            'visit_number' => 'VST-001',
            'visit_date' => now(),
            'visit_type' => 'opd',
            'status' => 'active'
        ]);

        $vitalsData = [
            'temperature' => 37.5,
            'blood_pressure' => '120/80',
            'pulse_rate' => 72,
            'weight' => 70,
            'height' => 175,
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson("/api/v1/clinical/visits/{$visit->id}/vitals", $vitalsData);

        $response->assertStatus(201);
        $this->assertDatabaseHas('vitals', ['visit_id' => $visit->id, 'temperature' => 37.5]);

        $diagnosisData = [
            'diagnosis' => 'Normal condition',
            'treatment_plan' => 'Rest and fluids',
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson("/api/v1/clinical/visits/{$visit->id}/diagnosis", $diagnosisData);

        $response->assertStatus(200);
        $this->assertDatabaseHas('patient_visits', ['id' => $visit->id, 'diagnosis' => 'Normal condition']);
    }

    public function test_can_create_invoice_and_record_payment()
    {
        $patient = Patient::factory()->create();
        
        $invoiceData = [
            'patient_id' => $patient->id,
            'items' => [
                [
                    'item_type' => 'service',
                    'item_name' => 'Consultation',
                    'quantity' => 1,
                    'unit_price' => 500.00
                ]
            ]
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/invoices', $invoiceData);

        $response->assertStatus(201);
        $invoiceId = $response->json('id');

        $paymentData = [
            'invoice_id' => $invoiceId,
            'amount' => 500.00,
            'payment_method' => 'cash'
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/payments', $paymentData);

        $response->assertStatus(201);
        $this->assertDatabaseHas('invoices', ['id' => $invoiceId, 'status' => 'paid', 'balance' => 0]);
    }
}
