<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // string, boolean, number, json
            $table->string('group')->default('general'); // general, finance, system
            $table->string('label')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Seed default settings
        DB::table('settings')->insert([
            [
                'key' => 'hospital_name',
                'value' => 'City General Hospital',
                'type' => 'string',
                'group' => 'general',
                'label' => 'Hospital Name',
                'description' => 'The name displayed on the dashboard and reports.',
                'created_at' => now(), 'updated_at' => now()
            ],
            [
                'key' => 'currency_symbol',
                'value' => 'KES',
                'type' => 'string',
                'group' => 'finance',
                'label' => 'Currency Symbol',
                'description' => 'Currency symbol used in invoices.',
                'created_at' => now(), 'updated_at' => now()
            ],
            [
                'key' => 'tax_rate',
                'value' => '16',
                'type' => 'number',
                'group' => 'finance',
                'label' => 'Tax Rate (%)',
                'description' => 'Default VAT percentage applied to invoices.',
                'created_at' => now(), 'updated_at' => now()
            ],
            [
                'key' => 'consultation_fee',
                'value' => '1500',
                'type' => 'number',
                'group' => 'finance',
                'label' => 'Standard Consultation Fee',
                'description' => 'Default fee for new visits.',
                'created_at' => now(), 'updated_at' => now()
            ],
             [
                'key' => 'contact_email',
                'value' => 'admin@cityhospital.com',
                'type' => 'string',
                'group' => 'general',
                'label' => 'Contact Email',
                'description' => 'Public facing contact email.',
                'created_at' => now(), 'updated_at' => now()
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
