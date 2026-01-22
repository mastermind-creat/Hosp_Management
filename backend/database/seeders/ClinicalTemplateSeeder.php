<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ClinicalTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templates = [
            [
                'type' => 'complaint',
                'label' => 'General Fever',
                'content' => 'Patient presents with high grade fever, chills, and generalized body weakness for the past 3 days.'
            ],
            [
                'type' => 'finding',
                'label' => 'Normal Respiratory',
                'content' => 'Chest is clear on auscultation. Normal breath sounds. No added sounds (crepitations or wheeze).'
            ],
            [
                'type' => 'diagnosis',
                'label' => 'Suspected Malaria',
                'content' => 'Uncomplicated Malaria (Suspected)'
            ],
            [
                'type' => 'plan',
                'label' => 'Standard Injection Plan',
                'content' => 'Administer prescribed IV fluids and injections. Monitor vitals 4 hourly. Review after 24 hours.'
            ],
            [
                'type' => 'finding',
                'label' => 'Normal Cardiac',
                'content' => 'S1 and S2 heart sounds heard. No murmurs. Pulse is regular and of good volume.'
            ]
        ];

        foreach ($templates as $template) {
            \App\Models\ClinicalTemplate::create($template);
        }
    }
}
