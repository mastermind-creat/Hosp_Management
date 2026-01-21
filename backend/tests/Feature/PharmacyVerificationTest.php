<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Drug;
use App\Models\DrugBatch;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class PharmacyVerificationTest extends TestCase
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

    public function test_can_create_drug()
    {
        $drugData = [
            'generic_name' => 'Amoxicillin',
            'brand_name' => 'Amoxil',
            'strength' => '500mg',
            'form' => 'Capsule',
            'category' => 'Antibiotics',
            'unit_price' => 10.00,
            'reorder_level' => 100
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/drugs', $drugData);

        $response->assertStatus(201)
            ->assertJsonFragment(['brand_name' => 'Amoxil']);
            
        $this->assertDatabaseHas('drugs', ['generic_name' => 'Amoxicillin']);
    }

    public function test_can_add_stock_batch()
    {
        $drug = Drug::create([
            'generic_name' => 'Paracetamol',
            'brand_name' => 'Panadol',
            'unit_price' => 5.00,
            'reorder_level' => 50
        ]);

        $stockData = [
            'batch_number' => 'BATCH-001',
            'quantity' => 1000,
            'unit_cost' => 2.50,
            'expiry_date' => now()->addYear()->format('Y-m-d')
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson("/api/v1/drugs/{$drug->id}/stock", $stockData);

        $response->assertStatus(201);
        
        $this->assertDatabaseHas('drug_batches', [
            'drug_id' => $drug->id,
            'batch_number' => 'BATCH-001',
            'quantity_remaining' => 1000
        ]);
    }

    public function test_low_stock_alerts()
    {
        // specific drug with low stock
        $drug = Drug::create([
            'generic_name' => 'LowStockDrug',
            'reorder_level' => 50,
            'unit_price' => 10
        ]);
        
        // Add minimal stock
        DrugBatch::create([
            'drug_id' => $drug->id,
            'batch_number' => 'B1',
            'quantity_received' => 20,
            'quantity_remaining' => 20, // 20 < 50
            'expiry_date' => now()->addYear(),
            'unit_cost' => 5,
            'received_by' => $this->user->id,
            'received_at' => now()
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/pharmacy/alerts');

        $response->assertStatus(200)
            ->assertJsonFragment(['generic_name' => 'LowStockDrug']);
    }

    public function test_auto_deduction_on_invoice_creation()
    {
        $drug = Drug::create([
            'generic_name' => 'AutoDeductDrug',
            'unit_price' => 10,
            'reorder_level' => 10
        ]);

        DrugBatch::create([
            'drug_id' => $drug->id,
            'batch_number' => 'BATCH-AUTO',
            'quantity_remaining' => 50,
            'quantity_received' => 50,
            'expiry_date' => now()->addYear(),
            'unit_cost' => 5,
            'received_by' => $this->user->id,
            'received_at' => now(),
        ]);

        $invoiceData = [
            'patient_id' => $this->user->id, // Usually patient model, but user helps for auth
            // Use a real patient
        ];
        
        // Let's create a patient properly
        $patient = \App\Models\Patient::factory()->create();

        $invoiceData = [
            'patient_id' => $patient->id,
            'items' => [
                [
                    'item_type' => 'drug',
                    'item_name' => $drug->generic_name,
                    'reference_id' => $drug->id,
                    'quantity' => 5,
                    'unit_price' => 10
                ]
            ]
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/invoices', $invoiceData);

        $response->assertStatus(201);
        
        $this->assertDatabaseHas('drug_batches', [
            'drug_id' => $drug->id,
            'quantity_remaining' => 45 // 50 - 5
        ]);
        
        $this->assertDatabaseHas('drug_dispensing', [
            'drug_id' => $drug->id,
            'quantity' => 5
        ]);
    }
}
