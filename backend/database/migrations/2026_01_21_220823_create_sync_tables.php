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
        Schema::create('sync_queue', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('model_type'); // e.g., App\Models\Patient
            $table->uuid('model_id');
            $table->string('action'); // create, update, delete
            $table->json('payload'); // Snapshot of data
            $table->enum('status', ['pending', 'synced', 'failed'])->default('pending');
            $table->integer('attempts')->default(0);
            $table->text('error_message')->nullable();
            $table->timestamp('queued_at')->useCurrent();
            $table->timestamp('synced_at')->nullable();
            $table->timestamps();
            
            $table->index('status');
            $table->index('queued_at');
        });

        Schema::create('sync_history', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->timestamp('sync_started_at');
            $table->timestamp('sync_completed_at')->nullable();
            $table->integer('items_processed')->default(0);
            $table->integer('items_failed')->default(0);
            $table->string('status'); // success, partial_failure, failure
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sync_history');
        Schema::dropIfExists('sync_queue');
    }
};
