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
        // Invoices
        Schema::create('invoices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('invoice_number')->unique();
            $table->uuid('patient_id');
            $table->uuid('visit_id')->nullable();
            $table->timestamp('invoice_date');
            $table->timestamp('due_date')->nullable();
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->decimal('paid_amount', 12, 2)->default(0);
            $table->decimal('balance', 12, 2)->default(0);
            $table->enum('status', ['draft', 'pending', 'paid', 'partial', 'overdue', 'cancelled'])->default('pending');
            $table->text('notes')->nullable();
            $table->uuid('created_by');
            $table->uuid('voided_by')->nullable();
            $table->timestamp('voided_at')->nullable();
            $table->text('void_reason')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->foreign('visit_id')->references('id')->on('patient_visits')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            
            $table->index('patient_id');
            $table->index('invoice_date');
            $table->index('status');
        });

        // Invoice Items
        Schema::create('invoice_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('invoice_id');
            $table->string('item_type'); // 'service', 'drug', 'test', 'procedure'
            $table->string('item_name');
            $table->text('description')->nullable();
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 12, 2);
            $table->timestamps();
            
            $table->foreign('invoice_id')->references('id')->on('invoices')->onDelete('cascade');
        });

        // Payments
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('payment_number')->unique();
            $table->uuid('invoice_id');
            $table->uuid('patient_id');
            $table->timestamp('payment_date');
            $table->decimal('amount', 12, 2);
            $table->enum('payment_method', ['cash', 'card', 'mobile_money', 'insurance', 'bank_transfer'])->default('cash');
            $table->string('reference_number')->nullable();
            $table->text('notes')->nullable();
            $table->uuid('received_by');
            $table->uuid('voided_by')->nullable();
            $table->timestamp('voided_at')->nullable();
            $table->text('void_reason')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('invoice_id')->references('id')->on('invoices')->onDelete('cascade');
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->foreign('received_by')->references('id')->on('users')->onDelete('cascade');
            
            $table->index('payment_date');
            $table->index('payment_method');
        });

        // Daily Cash Summaries (Z-Reports)
        Schema::create('daily_summaries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->date('summary_date')->unique();
            $table->decimal('cash_amount', 12, 2)->default(0);
            $table->decimal('card_amount', 12, 2)->default(0);
            $table->decimal('mobile_money_amount', 12, 2)->default(0);
            $table->decimal('insurance_amount', 12, 2)->default(0);
            $table->decimal('bank_transfer_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->integer('transaction_count')->default(0);
            $table->uuid('generated_by');
            $table->timestamps();
            
            $table->foreign('generated_by')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_summaries');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('invoice_items');
        Schema::dropIfExists('invoices');
    }
};
