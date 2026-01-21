<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Patient;
use App\Models\Drug;
use App\Models\LabTest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class BillingVerificationTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $patient;
    protected $drug;
    protected $test;

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

        $this->patient = Patient::factory()->create();
        
        $this->drug = Drug::create([
            'generic_name' => 'Paracetamol',
            'brand_name' => 'Panadol',
            'unit_price' => 5.00,
            'is_active' => true
        ]);

        $this->test = LabTest::create([
            'test_code' => 'CBC',
            'test_name' => 'Complete Blood Count',
            'price' => 150.00,
            'is_active' => true
        ]);
    }

    public function test_can_create_invoice_with_mixed_items()
    {
        $invoiceData = [
            'patient_id' => $this->patient->id,
            'invoice_date' => now()->toISOString(),
            'due_date' => now()->addDays(30)->toISOString(),
            'discount_amount' => 10,
            'tax_amount' => 5,
            'items' => [
                [
                    'item_type' => 'drug',
                    'item_name' => $this->drug->brand_name,
                    'quantity' => 2,
                    'unit_price' => 5.00
                ],
                [
                    'item_type' => 'test',
                    'item_name' => $this->test->test_name,
                    'quantity' => 1,
                    'unit_price' => 150.00
                ],
                [
                    'item_type' => 'service',
                    'item_name' => 'Consultation Fee',
                    'quantity' => 1,
                    'unit_price' => 50.00
                ]
            ],
            'notes' => 'Test invoice generation'
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/invoices', $invoiceData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'invoice_number',
                'total_amount',
                'balance'
            ]);

        // Calculation Check:
        // Drug: 2 * 5 = 10
        // Test: 1 * 150 = 150
        // Service: 1 * 50 = 50
        // Subtotal: 210
        // Tax: +5
        // Discount: -10
        // Total: 205
        
        $this->assertEquals(205.00, $response->json('total_amount'));
        $this->assertEquals(205.00, $response->json('balance'));
        $this->assertEquals('pending', $response->json('status'));
    }

    public function test_can_search_drugs_catalog()
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/drugs?search=Panadol');

        $response->assertStatus(200)
            ->assertJsonFragment(['brand_name' => 'Panadol']);
    }

    public function test_can_search_lab_tests_catalog()
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/lab/tests?search=Blood');

        $response->assertStatus(200)
            ->assertJsonFragment(['test_name' => 'Complete Blood Count']);
    }
}
