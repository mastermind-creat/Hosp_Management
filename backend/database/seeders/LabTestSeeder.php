<?php

namespace Database\Seeders;

use App\Models\LabTest;
use Illuminate\Database\Seeder;

class LabTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tests = [
            [
                'test_code' => 'CBC001',
                'test_name' => 'Complete Blood Count (CBC)',
                'category' => 'Hematology',
                'description' => 'A fundamental test that evaluates overall health and detects conditions like anemia and infections.',
                'price' => 1150.00,
                'sample_type' => 'Whole Blood',
                'turnaround_time' => '1 hour',
                'is_active' => true,
            ],
            [
                'test_code' => 'FBS001',
                'test_name' => 'Fasting Blood Sugar',
                'category' => 'Biochemistry',
                'description' => 'Measures blood glucose levels after fasting to screen for diabetes.',
                'price' => 220.00,
                'sample_type' => 'Serum',
                'turnaround_time' => '30 mins',
                'is_active' => true,
            ],
            [
                'test_code' => 'TFT001',
                'test_name' => 'Thyroid Function Tests (TFTs)',
                'category' => 'Endocrinology',
                'description' => 'Assesses thyroid gland function.',
                'price' => 3500.00,
                'sample_type' => 'Serum',
                'turnaround_time' => '24 hours',
                'is_active' => true,
            ],
            [
                'test_code' => 'HBA1C001',
                'test_name' => 'Glycated Hemoglobin (HbA1c)',
                'category' => 'Biochemistry',
                'description' => 'Measures average blood sugar levels over the past 3 months.',
                'price' => 1990.00,
                'sample_type' => 'Whole Blood',
                'turnaround_time' => '1 hour',
                'is_active' => true,
            ],
            [
                'test_code' => 'CREAT001',
                'test_name' => 'Serum Creatinine',
                'category' => 'Renal Function',
                'description' => 'Evaluates kidney function.',
                'price' => 725.00,
                'sample_type' => 'Serum',
                'turnaround_time' => '1 hour',
                'is_active' => true,
            ],
            [
                'test_code' => 'BXM001',
                'test_name' => 'Blood Group Crossmatch',
                'category' => 'Blood Bank',
                'description' => 'Tests for blood compatibility before transfusion.',
                'price' => 1125.00,
                'sample_type' => 'Whole Blood',
                'turnaround_time' => '2 hours',
                'is_active' => true,
            ],
            [
                'test_code' => 'UREA001',
                'test_name' => 'Urea and Creatinine (UECs)',
                'category' => 'Renal Function',
                'description' => 'Serum test for kidney function assessment.',
                'price' => 1500.00,
                'sample_type' => 'Serum',
                'turnaround_time' => '1 hour',
                'is_active' => true,
            ],
            [
                'test_code' => 'CRP001',
                'test_name' => 'C-Reactive Protein (CRP)',
                'category' => 'Immunology',
                'description' => 'Indicator of inflammation in the body.',
                'price' => 1850.00,
                'sample_type' => 'Serum',
                'turnaround_time' => '2 hours',
                'is_active' => true,
            ],
            [
                'test_code' => 'MAL001',
                'test_name' => 'Malaria Test (BS/RDT)',
                'category' => 'Parasitology',
                'description' => 'Used to identify the malaria parasite.',
                'price' => 500.00,
                'sample_type' => 'Capillary/Whole Blood',
                'turnaround_time' => '30 mins',
                'is_active' => true,
            ],
            [
                'test_code' => 'HIV001',
                'test_name' => 'HIV 1&2 Screening',
                'category' => 'Serology',
                'description' => 'Testing for HIV antibodies.',
                'price' => 500.00,
                'sample_type' => 'Serum/Whole Blood',
                'turnaround_time' => '30 mins',
                'is_active' => true,
            ],
            [
                'test_code' => 'URA001',
                'test_name' => 'Urinalysis',
                'category' => 'Clinical Chemistry',
                'description' => 'Routine urine examination.',
                'price' => 600.00,
                'sample_type' => 'Urine',
                'turnaround_time' => '30 mins',
                'is_active' => true,
            ],
            [
                'test_code' => 'HPY001',
                'test_name' => 'H. Pylori Antigen Test',
                'category' => 'Serology',
                'description' => 'Testing for H. Pylori infection.',
                'price' => 1200.00,
                'sample_type' => 'Stool/Serum',
                'turnaround_time' => '1 hour',
                'is_active' => true,
            ],
            [
                'test_code' => 'LFT001',
                'test_name' => 'Liver Function Test (LFT)',
                'category' => 'Biochemistry',
                'description' => 'Assesses liver health.',
                'price' => 2500.00,
                'sample_type' => 'Serum',
                'turnaround_time' => '2 hours',
                'is_active' => true,
            ],
            [
                'test_code' => 'LIP001',
                'test_name' => 'Lipid Profile',
                'category' => 'Biochemistry',
                'description' => 'Measures cholesterol and triglyceride levels.',
                'price' => 2000.00,
                'sample_type' => 'Serum',
                'turnaround_time' => '2 hours',
                'is_active' => true,
            ],
            [
                'test_code' => 'TYP001',
                'test_name' => 'Typhoid (Widal) Test',
                'category' => 'Serology',
                'description' => 'Screening for typhoid fever.',
                'price' => 800.00,
                'sample_type' => 'Serum',
                'turnaround_time' => '1 hour',
                'is_active' => true,
            ],
            [
                'test_code' => 'STOA001',
                'test_name' => 'Stool Analysis',
                'category' => 'Parasitology',
                'description' => 'Microscopic examination of stool.',
                'price' => 500.00,
                'sample_type' => 'Stool',
                'turnaround_time' => '1 hour',
                'is_active' => true,
            ],
            [
                'test_code' => 'PREG001',
                'test_name' => 'Pregnancy Test (Urine)',
                'category' => 'Immunology',
                'description' => 'Testing for HCG in urine.',
                'price' => 300.00,
                'sample_type' => 'Urine',
                'turnaround_time' => '15 mins',
                'is_active' => true,
            ],
        ];

        foreach ($tests as $test) {
            LabTest::updateOrCreate(['test_code' => $test['test_code']], $test);
        }
    }
}
