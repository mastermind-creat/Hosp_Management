<?php

namespace Tests\Feature;

use App\Models\Patient;
use App\Models\PatientVisit;
use App\Models\User;
use App\Models\Drug;
use App\Models\DrugBatch;
use App\Models\LabTest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class E2EFlowTest extends TestCase
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

        // Fetch the admin user seeded
        $this->user = User::where('username', 'admin')->first();
        $this->token = JWTAuth::fromUser($this->user);
    }

    public function test_complete_patient_journey_flow()
    {
        // 1. Patient Registration
        $patientData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'gender' => 'male',
            'date_of_birth' => '1990-01-01',
            'phone' => '0712345678',
            'insurance_type' => 'none',
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/patients', $patientData);

        $response->assertStatus(201);
        $patientId = $response->json('id');
        $this->assertDatabaseHas('patients', ['first_name' => 'John', 'id' => $patientId]);

        // 2. Clinical Visit & Vitals
        $visitData = [
            'patient_id' => $patientId,
            'visit_type' => 'opd',
        ];

        // Assuming there's a visit creation endpoint or we create it manually for the flow
        $visit = PatientVisit::create([
            'patient_id' => $patientId,
            'visit_number' => 'VST-E2E-001',
            'visit_date' => now(),
            'visit_type' => 'opd',
            'status' => 'active'
        ]);

        $vitalsData = [
            'temperature' => 38.2,
            'blood_pressure' => '130/90',
            'pulse_rate' => 85,
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson("/api/v1/clinical/visits/{$visit->id}/vitals", $vitalsData);

        $response->assertStatus(201);

        // 3. Prep Pharmacy & Lab Data
        $drug = Drug::create([
            'generic_name' => 'Amoxicillin',
            'brand_name' => 'Amoxil',
            'unit_price' => 50.00,
            'reorder_level' => 10
        ]);

        DrugBatch::create([
            'drug_id' => $drug->id,
            'batch_number' => 'E2E-BATCH-01',
            'quantity_received' => 100,
            'quantity_remaining' => 100,
            'expiry_date' => now()->addYear(),
            'unit_cost' => 20,
            'received_by' => $this->user->id,
            'received_at' => now(),
        ]);

        $labTest = LabTest::create([
            'test_code' => 'TEST-FBC',
            'test_name' => 'Full Blood Count',
            'category' => 'Haematology',
            'price' => 1200.00,
            'is_active' => true
        ]);

        // 4. Invoicing (Integrated)
        $invoiceData = [
            'patient_id' => $patientId,
            'visit_id' => $visit->id,
            'items' => [
                [
                    'item_type' => 'service',
                    'item_name' => 'Consultation Fee',
                    'quantity' => 1,
                    'unit_price' => 1000.00
                ],
                [
                    'item_type' => 'drug',
                    'item_name' => 'Amoxicillin (Amoxil)',
                    'reference_id' => $drug->id,
                    'quantity' => 2,
                    'unit_price' => 50.00
                ],
                [
                    'item_type' => 'test',
                    'item_name' => 'Full Blood Count',
                    'reference_id' => $labTest->id,
                    'quantity' => 1,
                    'unit_price' => 1200.00
                ]
            ]
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/invoices', $invoiceData);

        $response->assertStatus(201);
        $invoiceId = $response->json('id');
        
        // Expected total: 1000 + (2 * 50) + 1200 = 2300
        $this->assertEquals(2300.00, (float)$response->json('total_amount'));

        // 5. Verify Side Effects
        // Verify Pharmacy Stock reduction (100 - 2 = 98)
        $this->assertDatabaseHas('drug_batches', [
            'id' => DrugBatch::where('batch_number', 'E2E-BATCH-01')->first()->id,
            'quantity_remaining' => 98
        ]);

        // 6. Record Payment
        $paymentData = [
            'invoice_id' => $invoiceId,
            'amount' => 2300.00,
            'payment_method' => 'mobile_money',
            'reference_number' => 'MPESA12345'
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/payments', $paymentData);

        $response->assertStatus(201);

        // 7. Final Verification
        $this->assertDatabaseHas('invoices', [
            'id' => $invoiceId,
            'status' => 'paid',
            'balance' => 0,
            'paid_amount' => 2300.00
        ]);
        
        $this->assertDatabaseHas('payments', [
            'invoice_id' => $invoiceId,
            'amount' => 2300.00,
            'reference_number' => 'MPESA12345'
        ]);
    }
}
