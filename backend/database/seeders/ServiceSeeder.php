<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Service;
use Illuminate\Support\Str;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            // Consultations
            ['name' => 'General Consultation', 'category' => 'Consultation', 'price' => 500, 'description' => 'Standard doctor consultation'],
            ['name' => 'Specialist Consultation', 'category' => 'Consultation', 'price' => 1500, 'description' => 'Specialist doctor consultation'],
            ['name' => 'Follow-up Visit', 'category' => 'Consultation', 'price' => 300, 'description' => 'Follow-up consultation'],
            
            // Procedures
            ['name' => 'Wound Dressing', 'category' => 'Procedure', 'price' => 200, 'description' => 'Basic wound dressing'],
            ['name' => 'Suturing', 'category' => 'Procedure', 'price' => 800, 'description' => 'Wound suturing'],
            ['name' => 'IV Cannulation', 'category' => 'Procedure', 'price' => 300, 'description' => 'Intravenous cannulation'],
            ['name' => 'Catheterization', 'category' => 'Procedure', 'price' => 500, 'description' => 'Urinary catheterization'],
            
            // Imaging
            ['name' => 'X-Ray (Single View)', 'category' => 'Imaging', 'price' => 1000, 'description' => 'Single view X-ray'],
            ['name' => 'X-Ray (Two Views)', 'category' => 'Imaging', 'price' => 1500, 'description' => 'Two view X-ray'],
            ['name' => 'Ultrasound', 'category' => 'Imaging', 'price' => 2000, 'description' => 'Ultrasound scan'],
            
            // Emergency
            ['name' => 'Emergency Room Fee', 'category' => 'Emergency', 'price' => 1000, 'description' => 'Emergency room admission fee'],
            ['name' => 'Ambulance Service', 'category' => 'Emergency', 'price' => 3000, 'description' => 'Ambulance transport'],
        ];

        foreach ($services as $service) {
            Service::create($service);
        }
    }
}
