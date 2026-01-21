<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // IPD Admissions
        Schema::create('ipd_admissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('patient_id');
            $table->uuid('visit_id');
            $table->string('admission_number')->unique();
            $table->timestamp('admission_date');
            $table->timestamp('discharge_date')->nullable();
            $table->string('ward')->nullable();
            $table->string('bed_number')->nullable();
            $table->text('admission_reason');
            $table->text('initial_assessment')->nullable();
            $table->text('admission_orders')->nullable();
            $table->text('discharge_summary')->nullable();
            $table->enum('status', ['admitted', 'discharged', 'transferred'])->default('admitted');
            $table->uuid('admitted_by');
            $table->uuid('discharged_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->foreign('visit_id')->references('id')->on('patient_visits')->onDelete('cascade');
            $table->foreign('admitted_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('discharged_by')->references('id')->on('users')->onDelete('set null');
            
            $table->index('patient_id');
            $table->index('status');
        });

        // Prescriptions
        Schema::create('prescriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('visit_id');
            $table->uuid('patient_id');
            $table->uuid('prescribed_by');
            $table->string('prescription_number')->unique();
            $table->timestamp('prescription_date');
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'dispensed', 'cancelled'])->default('pending');
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('visit_id')->references('id')->on('patient_visits')->onDelete('cascade');
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->foreign('prescribed_by')->references('id')->on('users')->onDelete('cascade');
        });

        // Prescription Items
        Schema::create('prescription_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('prescription_id');
            $table->string('drug_name');
            $table->string('dosage');
            $table->string('frequency');
            $table->integer('duration_days');
            $table->integer('quantity');
            $table->text('instructions')->nullable();
            $table->timestamps();
            
            $table->foreign('prescription_id')->references('id')->on('prescriptions')->onDelete('cascade');
        });

        // Treatment Notes
        Schema::create('treatment_notes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('visit_id');
            $table->uuid('created_by');
            $table->text('note');
            $table->enum('note_type', ['progress', 'consultation', 'procedure', 'other'])->default('progress');
            $table->timestamps();
            
            $table->foreign('visit_id')->references('id')->on('patient_visits')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('treatment_notes');
        Schema::dropIfExists('prescription_items');
        Schema::dropIfExists('prescriptions');
        Schema::dropIfExists('ipd_admissions');
    }
};
