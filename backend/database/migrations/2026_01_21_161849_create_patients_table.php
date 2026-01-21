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
        Schema::create('patients', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('patient_number')->unique(); // Auto-generated unique ID
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->date('date_of_birth');
            $table->enum('gender', ['male', 'female', 'other']);
            $table->string('national_id')->unique()->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('county')->nullable();
            $table->string('country')->default('Kenya');
            
            // Emergency contact
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->string('emergency_contact_relationship')->nullable();
            
            // Insurance information
            $table->string('insurance_provider')->nullable();
            $table->string('insurance_number')->nullable();
            $table->date('insurance_expiry')->nullable();
            $table->enum('insurance_type', ['nhif', 'private', 'corporate', 'none'])->default('none');
            
            // Medical information
            $table->string('blood_group')->nullable();
            $table->text('allergies')->nullable();
            $table->text('chronic_conditions')->nullable();
            
            // Status
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('patient_number');
            $table->index('national_id');
            $table->index(['first_name', 'last_name']);
            $table->index('phone');
        });

        // Patient visits table
        Schema::create('patient_visits', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('patient_id');
            $table->uuid('doctor_id')->nullable();
            $table->enum('visit_type', ['opd', 'ipd', 'emergency']);
            $table->string('visit_number')->unique();
            $table->timestamp('visit_date');
            $table->text('chief_complaint')->nullable();
            $table->text('history_of_present_illness')->nullable();
            $table->text('examination_findings')->nullable();
            $table->text('diagnosis')->nullable();
            $table->text('treatment_plan')->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['active', 'completed', 'cancelled'])->default('active');
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->foreign('doctor_id')->references('id')->on('users')->onDelete('set null');
            
            $table->index('patient_id');
            $table->index('visit_date');
            $table->index('status');
        });

        // Vitals table
        Schema::create('vitals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('visit_id');
            $table->decimal('temperature', 4, 1)->nullable(); // Celsius
            $table->string('blood_pressure')->nullable(); // e.g., "120/80"
            $table->integer('pulse_rate')->nullable(); // bpm
            $table->integer('respiratory_rate')->nullable(); // per minute
            $table->decimal('weight', 5, 2)->nullable(); // kg
            $table->decimal('height', 5, 2)->nullable(); // cm
            $table->decimal('bmi', 4, 2)->nullable();
            $table->integer('oxygen_saturation')->nullable(); // %
            $table->text('notes')->nullable();
            $table->uuid('recorded_by');
            $table->timestamps();
            
            $table->foreign('visit_id')->references('id')->on('patient_visits')->onDelete('cascade');
            $table->foreign('recorded_by')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vitals');
        Schema::dropIfExists('patient_visits');
        Schema::dropIfExists('patients');
    }
};
