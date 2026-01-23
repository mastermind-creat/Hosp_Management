<?php

namespace Tests\Feature;

use App\Models\Patient;
use App\Models\PatientVisit;
use App\Models\User;
use App\Models\Department;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class QueueCompletionTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $token;
    protected $department;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->seed(\Database\Seeders\PermissionSeeder::class);
        $this->seed(\Database\Seeders\RoleSeeder::class);
        $this->seed(\Database\Seeders\AdminUserSeeder::class);

        $this->user = User::where('username', 'admin')->first();
        $this->token = JWTAuth::fromUser($this->user);

        $this->department = Department::create([
            'name' => 'Consultation',
            'description' => 'Doctor Consultation'
        ]);
    }

    public function test_can_start_and_complete_visit_queue()
    {
        // 1. Create Patient
        $patient = Patient::create([
            'first_name' => 'Test',
            'last_name' => 'Patient',
            'gender' => 'female',
            'date_of_birth' => '1995-05-05',
            'phone' => '0799988877',
            'patient_number' => 'PAT-TEST-001'
        ]);

        // 2. Check-in to department
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/queues/check-in', [
                'patient_id' => $patient->id,
                'department_id' => $this->department->id,
                'priority' => 'normal',
                'chief_complaint' => 'Headache'
            ]);

        $response->assertStatus(201);
        $visitId = $response->json('id');

        $this->assertDatabaseHas('patient_visits', [
            'id' => $visitId,
            'current_department_id' => $this->department->id,
            'queue_status' => 'waiting'
        ]);

        // 3. Start Attending
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson("/api/v1/queues/visits/{$visitId}/start");

        $response->assertStatus(200);
        $this->assertDatabaseHas('patient_visits', [
            'id' => $visitId,
            'queue_status' => 'active'
        ]);

        // 4. Complete Visit
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson("/api/v1/queues/visits/{$visitId}/complete");

        $response->assertStatus(200);
        $this->assertDatabaseHas('patient_visits', [
            'id' => $visitId,
            'queue_status' => 'completed',
            'status' => 'completed',
            'current_department_id' => null
        ]);
    }
}
