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
        // Laboratory Tests Catalog
        Schema::create('lab_tests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('test_code')->unique();
            $table->string('test_name');
            $table->string('category')->nullable(); // e.g., "Hematology", "Chemistry", "Microbiology"
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->string('sample_type')->nullable(); // e.g., "Blood", "Urine", "Stool"
            $table->integer('turnaround_time')->nullable(); // in hours
            $table->text('normal_range')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('test_code');
            $table->index('category');
        });

        // Test Requests
        Schema::create('test_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('request_number')->unique();
            $table->uuid('patient_id');
            $table->uuid('visit_id')->nullable();
            $table->uuid('test_id');
            $table->uuid('requested_by');
            $table->timestamp('request_date');
            $table->enum('priority', ['routine', 'urgent', 'stat'])->default('routine');
            $table->text('clinical_notes')->nullable();
            $table->enum('status', ['pending', 'sample_collected', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->uuid('invoice_id')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->foreign('visit_id')->references('id')->on('patient_visits')->onDelete('set null');
            $table->foreign('test_id')->references('id')->on('lab_tests')->onDelete('cascade');
            $table->foreign('requested_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('invoice_id')->references('id')->on('invoices')->onDelete('set null');
            
            $table->index('patient_id');
            $table->index('request_date');
            $table->index('status');
        });

        // Sample Collection
        Schema::create('sample_collections', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('request_id');
            $table->string('sample_id')->unique();
            $table->timestamp('collection_date');
            $table->uuid('collected_by');
            $table->text('collection_notes')->nullable();
            $table->timestamps();
            
            $table->foreign('request_id')->references('id')->on('test_requests')->onDelete('cascade');
            $table->foreign('collected_by')->references('id')->on('users')->onDelete('cascade');
        });

        // Test Results
        Schema::create('test_results', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('request_id');
            $table->text('result_value');
            $table->string('unit')->nullable();
            $table->text('interpretation')->nullable();
            $table->boolean('is_abnormal')->default(false);
            $table->text('technician_notes')->nullable();
            $table->uuid('entered_by');
            $table->timestamp('result_date');
            $table->uuid('verified_by')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
            
            $table->foreign('request_id')->references('id')->on('test_requests')->onDelete('cascade');
            $table->foreign('entered_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('verified_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('test_results');
        Schema::dropIfExists('sample_collections');
        Schema::dropIfExists('test_requests');
        Schema::dropIfExists('lab_tests');
    }
};
