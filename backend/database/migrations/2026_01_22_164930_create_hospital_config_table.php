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
        Schema::create('hospital_config', function (Blueprint $table) {
            $table->id();
            $table->enum('hospital_mode', ['FULL', 'COMPACT'])->default('FULL');
            $table->boolean('allow_multi_role_users')->default(true);
            $table->boolean('require_role_switching')->default(true);
            $table->boolean('billing_interrupt_enabled')->default(true);
            $table->json('enabled_departments')->nullable(); // ['lab', 'pharmacy', 'ward', 'radiology']
            $table->json('minimum_compliance_rules')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Insert default configuration
        DB::table('hospital_config')->insert([
            'hospital_mode' => 'FULL',
            'allow_multi_role_users' => true,
            'require_role_switching' => true,
            'billing_interrupt_enabled' => true,
            'enabled_departments' => json_encode(['lab', 'pharmacy', 'ward', 'radiology']),
            'minimum_compliance_rules' => json_encode([
                'payment_before_consultation' => false,
                'payment_before_pharmacy' => true,
                'payment_before_lab' => false,
                'require_vitals_before_consultation' => true,
            ]),
            'notes' => 'Default hospital configuration - Full Department Mode',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hospital_config');
    }
};
