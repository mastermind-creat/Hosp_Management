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
        // Drugs/Medications Catalog
        Schema::create('drugs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('generic_name');
            $table->string('brand_name')->nullable();
            $table->string('strength')->nullable(); // e.g., "500mg"
            $table->string('form')->nullable(); // e.g., "tablet", "syrup", "injection"
            $table->string('category')->nullable(); // e.g., "antibiotic", "analgesic"
            $table->decimal('unit_price', 10, 2);
            $table->integer('reorder_level')->default(50);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('generic_name');
            $table->index('category');
        });

        // Drug Stock Batches
        Schema::create('drug_batches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('drug_id');
            $table->string('batch_number');
            $table->integer('quantity_received');
            $table->integer('quantity_remaining');
            $table->decimal('unit_cost', 10, 2);
            $table->date('manufacture_date')->nullable();
            $table->date('expiry_date');
            $table->uuid('supplier_id')->nullable();
            $table->uuid('received_by');
            $table->timestamp('received_at');
            $table->timestamps();
            
            $table->foreign('drug_id')->references('id')->on('drugs')->onDelete('cascade');
            $table->foreign('received_by')->references('id')->on('users')->onDelete('cascade');
            
            $table->index('drug_id');
            $table->index('expiry_date');
        });

        // Suppliers
        Schema::create('suppliers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('contact_person')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // Drug Dispensing Records
        Schema::create('drug_dispensing', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('patient_id');
            $table->uuid('prescription_id')->nullable();
            $table->uuid('drug_id');
            $table->uuid('batch_id');
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 12, 2);
            $table->uuid('dispensed_by');
            $table->timestamp('dispensed_at');
            $table->uuid('invoice_id')->nullable();
            $table->timestamps();
            
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->foreign('prescription_id')->references('id')->on('prescriptions')->onDelete('set null');
            $table->foreign('drug_id')->references('id')->on('drugs')->onDelete('cascade');
            $table->foreign('batch_id')->references('id')->on('drug_batches')->onDelete('cascade');
            $table->foreign('dispensed_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('invoice_id')->references('id')->on('invoices')->onDelete('set null');
            
            $table->index('patient_id');
            $table->index('dispensed_at');
        });

        // Stock Adjustments
        Schema::create('stock_adjustments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('drug_id');
            $table->uuid('batch_id')->nullable();
            $table->enum('adjustment_type', ['addition', 'deduction', 'correction']);
            $table->integer('quantity');
            $table->text('reason');
            $table->uuid('adjusted_by');
            $table->timestamps();
            
            $table->foreign('drug_id')->references('id')->on('drugs')->onDelete('cascade');
            $table->foreign('batch_id')->references('id')->on('drug_batches')->onDelete('set null');
            $table->foreign('adjusted_by')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_adjustments');
        Schema::dropIfExists('drug_dispensing');
        Schema::dropIfExists('suppliers');
        Schema::dropIfExists('drug_batches');
        Schema::dropIfExists('drugs');
    }
};
