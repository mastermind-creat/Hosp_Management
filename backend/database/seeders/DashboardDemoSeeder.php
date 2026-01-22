<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DashboardDemoSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ensure we have at least one doctor (Role check)
        $admin = User::where('username', 'admin')->first();
        
        // 2. Create some patients
        $patients = [];
        for ($i = 1; $i <= 10; $i++) {
            $patients[] = Patient::firstOrCreate(
                ['email' => "patient{$i}@example.com"],
                [
                    'patient_number' => 'PAT-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                    'first_name' => 'Patient',
                    'last_name' => "Number {$i}",
                    'gender' => $i % 2 == 0 ? 'male' : 'female',
                    'phone' => '070000000' . $i,
                    'date_of_birth' => '1990-01-01',
                    'address' => 'Nairobi, Kenya',
                    'is_active' => true
                ]
            );
        }

        // 3. Create 42 Active Appointments
        $currentCount = Appointment::where('status', 'pending')->count();
        $needed = 42 - $currentCount;
        
        if ($needed > 0) {
            for ($i = 0; $i < $needed; $i++) {
                $startHour = rand(8, 16);
                Appointment::create([
                    'patient_id' => $patients[array_rand($patients)]->id,
                    'doctor_id' => $admin->id,
                    'appointment_date' => now()->addDays(rand(0, 7))->toDateString(),
                    'start_time' => sprintf('%02d:00', $startHour),
                    'end_time' => sprintf('%02d:00', $startHour + 1),
                    'status' => 'pending',
                    'reason' => 'General Checkup'
                ]);
            }
        }

        // 4. Create Revenue Today: Ksh. 2,450.00
        $todayRevenue = Payment::whereDate('payment_date', now()->toDateString())->sum('amount');
        $targetRevenue = 2450.00;
        
        if ($todayRevenue < $targetRevenue) {
            $remaining = $targetRevenue - $todayRevenue;
            
            $invoice = Invoice::create([
                'invoice_number' => 'INV-' . time(),
                'patient_id' => $patients[0]->id,
                'invoice_date' => now(),
                'due_date' => now(),
                'subtotal' => $remaining,
                'total_amount' => $remaining,
                'paid_amount' => $remaining,
                'balance' => 0,
                'status' => 'paid',
                'created_by' => $admin->id
            ]);

            Payment::create([
                'payment_number' => 'PAY-' . time(),
                'invoice_id' => $invoice->id,
                'patient_id' => $patients[0]->id,
                'payment_date' => now(),
                'amount' => $remaining,
                'payment_method' => 'cash',
                'received_by' => $admin->id
            ]);
        }

        // 5. Add some patient visits for activity feed
        if (\App\Models\PatientVisit::count() < 5) {
            foreach ($patients as $idx => $patient) {
                if ($idx >= 5) break;
                \App\Models\PatientVisit::create([
                    'patient_id' => $patient->id,
                    'doctor_id' => $admin->id,
                    'visit_number' => 'VST-' . $idx . '-' . time(),
                    'visit_date' => now()->subMinutes(rand(10, 300)),
                    'visit_type' => ['opd', 'emergency', 'ipd'][rand(0, 2)],
                    'chief_complaint' => 'Consultation',
                    'status' => 'active'
                ]);
            }
        }

        // 6. Historical Data (Last 7 Days)
        for ($i = 1; $i <= 6; $i++) {
            $pastDate = now()->subDays($i);
            $dailyAmount = rand(1500, 5000);
            
            $invoice = Invoice::create([
                'invoice_number' => 'INV-HIST-' . $i . '-' . time(),
                'patient_id' => $patients[rand(0, 9)]->id,
                'invoice_date' => $pastDate,
                'due_date' => $pastDate,
                'subtotal' => $dailyAmount,
                'total_amount' => $dailyAmount,
                'paid_amount' => $dailyAmount,
                'balance' => 0,
                'status' => 'paid',
                'created_by' => $admin->id
            ]);

            Payment::create([
                'payment_number' => 'PAY-HIST-' . $i . '-' . time(),
                'invoice_id' => $invoice->id,
                'patient_id' => $invoice->patient_id,
                'payment_date' => $pastDate,
                'amount' => $dailyAmount,
                'payment_method' => 'cash',
                'received_by' => $admin->id
            ]);

            for ($v = 0; $v < rand(3, 8); $v++) {
                \App\Models\PatientVisit::create([
                    'patient_id' => $patients[rand(0, 9)]->id,
                    'doctor_id' => $admin->id,
                    'visit_number' => 'VST-HIST-' . $i . '-' . $v . '-' . time(),
                    'visit_date' => $pastDate->copy()->addHours(rand(8, 16)),
                    'visit_type' => ['opd', 'emergency', 'ipd'][rand(0, 2)],
                    'chief_complaint' => 'Checkup',
                    'status' => 'active'
                ]);
            }
        }
    }
}
